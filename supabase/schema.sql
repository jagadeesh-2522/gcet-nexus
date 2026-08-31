-- ============================================================
-- GCET NEXUS — DATABASE SCHEMA
-- Run in Supabase SQL editor. Assumes Supabase Auth (auth.users) is enabled.
-- ============================================================

-- ---------- ENUMS ----------
create type availability_status as enum ('open', 'limited', 'unavailable');
create type project_type as enum ('hackathon', 'personal', 'academic', 'open_source', 'startup');
create type project_status as enum ('recruiting', 'in_progress', 'closed', 'completed', 'paused');
create type request_status as enum ('pending', 'accepted', 'declined');
create type notification_type as enum (
  'join_request_received',
  'join_request_accepted',
  'join_request_declined',
  'added_to_project',
  'removed_from_project',
  'project_update'
);

-- ---------- PROFILES ----------
-- 1:1 with auth.users. Created via trigger on signup.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  branch text not null,
  year smallint not null check (year between 1 and 4),
  section text,
  bio text,
  availability availability_status not null default 'open',
  github_url text,
  linkedin_url text,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enforce college domain at the database level too (defense in depth).
alter table profiles add constraint profiles_email_domain_check
  check (email ilike '%@gcet.edu.in');

-- ---------- SKILLS / INTERESTS (lookup + join tables) ----------
create table skills (
  id serial primary key,
  name text not null unique
);

create table interests (
  id serial primary key,
  name text not null unique
);

create table profile_skills (
  profile_id uuid references profiles(id) on delete cascade,
  skill_id int references skills(id) on delete cascade,
  primary key (profile_id, skill_id)
);

create table profile_interests (
  profile_id uuid references profiles(id) on delete cascade,
  interest_id int references interests(id) on delete cascade,
  primary key (profile_id, interest_id)
);

-- ---------- PROJECTS ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  short_description text not null,
  full_description text not null,
  type project_type not null,
  hackathon_name text,
  hackathon_url text,
  tech_stack text[] not null default '{}',
  required_roles text[] not null default '{}',
  required_skills text[] not null default '{}',
  current_team_size smallint not null default 1,
  max_team_size smallint not null,
  status project_status not null default 'recruiting',
  deadline date,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_size_valid check (current_team_size <= max_team_size)
);

create index projects_status_idx on projects(status);
create index projects_type_idx on projects(type);
create index projects_tech_stack_idx on projects using gin(tech_stack);
create index projects_required_skills_idx on projects using gin(required_skills);

-- ---------- PROJECT MEMBERS ----------
create table project_members (
  project_id uuid references projects(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  role text,
  joined_at timestamptz not null default now(),
  primary key (project_id, profile_id)
);

-- ---------- JOIN REQUESTS ----------
create table join_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  applicant_id uuid not null references profiles(id) on delete cascade,
  why_message text not null,
  contribution_message text not null,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (project_id, applicant_id)
);

create index join_requests_project_idx on join_requests(project_id, status);

-- ---------- PROJECT UPDATES ----------
create table project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------- SAVED PROJECTS ----------
create table saved_projects (
  profile_id uuid references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (profile_id, project_id)
);

-- ---------- NOTIFICATIONS ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  payload jsonb not null default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_idx on notifications(profile_id, is_read);

-- ---------- ACHIEVEMENTS ----------
create table achievements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  achieved_on date,
  created_at timestamptz not null default now()
);

-- ---------- TRIGGERS ----------

-- Auto-create a profile row on signup using metadata passed from the client.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, branch, year)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Student'),
    new.email,
    coalesce(new.raw_user_meta_data->>'branch', 'Unspecified'),
    coalesce((new.raw_user_meta_data->>'year')::smallint, 1)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Keep updated_at fresh.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();

-- When a join request is accepted, add the member and bump team size.
create or replace function handle_request_accepted()
returns trigger as $$
begin
  if new.status = 'accepted' and old.status is distinct from 'accepted' then
    insert into project_members (project_id, profile_id)
    values (new.project_id, new.applicant_id)
    on conflict do nothing;

    update projects
      set current_team_size = current_team_size + 1
      where id = new.project_id;

    new.decided_at = now();

    insert into notifications (profile_id, type, payload)
    values (new.applicant_id, 'join_request_accepted', jsonb_build_object('project_id', new.project_id));
  elsif new.status = 'declined' and old.status is distinct from 'declined' then
    new.decided_at = now();
    insert into notifications (profile_id, type, payload)
    values (new.applicant_id, 'join_request_declined', jsonb_build_object('project_id', new.project_id));
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_join_request_status_change
  before update on join_requests
  for each row execute function handle_request_accepted();

-- Notify the project leader when a new request comes in.
create or replace function notify_leader_on_request()
returns trigger as $$
declare
  v_leader_id uuid;
begin
  select leader_id into v_leader_id from projects where id = new.project_id;
  insert into notifications (profile_id, type, payload)
  values (v_leader_id, 'join_request_received', jsonb_build_object('project_id', new.project_id, 'applicant_id', new.applicant_id));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_join_request_created
  after insert on join_requests
  for each row execute function notify_leader_on_request();
