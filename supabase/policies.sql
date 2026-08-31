-- ============================================================
-- GCET NEXUS — ROW LEVEL SECURITY POLICIES
-- Run after schema.sql. All tables are locked down by default;
-- these policies open exactly what the product needs.
-- ============================================================

alter table profiles enable row level security;
alter table skills enable row level security;
alter table interests enable row level security;
alter table profile_skills enable row level security;
alter table profile_interests enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table join_requests enable row level security;
alter table project_updates enable row level security;
alter table saved_projects enable row level security;
alter table notifications enable row level security;
alter table achievements enable row level security;

-- ---------- PROFILES ----------
create policy "profiles are readable by any signed-in student"
  on profiles for select using (auth.role() = 'authenticated');

create policy "a student can update only their own profile"
  on profiles for update using (auth.uid() = id);

-- Insert happens via the handle_new_user trigger (security definer), so no
-- direct insert policy for regular users is needed.

-- ---------- SKILLS / INTERESTS (public lookup tables) ----------
create policy "skills readable by all signed-in students"
  on skills for select using (auth.role() = 'authenticated');
create policy "interests readable by all signed-in students"
  on interests for select using (auth.role() = 'authenticated');

create policy "profile_skills readable by all"
  on profile_skills for select using (auth.role() = 'authenticated');
create policy "a student manages only their own skill tags"
  on profile_skills for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

create policy "profile_interests readable by all"
  on profile_interests for select using (auth.role() = 'authenticated');
create policy "a student manages only their own interest tags"
  on profile_interests for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ---------- PROJECTS ----------
create policy "projects are readable by any signed-in student"
  on projects for select using (auth.role() = 'authenticated');

create policy "a student can create a project they lead"
  on projects for insert with check (auth.uid() = leader_id);

create policy "only the leader can edit their project"
  on projects for update using (auth.uid() = leader_id);

create policy "only the leader can delete their project"
  on projects for delete using (auth.uid() = leader_id);

-- ---------- PROJECT MEMBERS ----------
create policy "project members readable by any signed-in student"
  on project_members for select using (auth.role() = 'authenticated');

-- Members are normally inserted by the accept-request trigger (security
-- definer). This policy additionally allows a leader to add themself once
-- on project creation, and to remove members from their own project.
create policy "leader can remove a member from their project"
  on project_members for delete using (
    exists (select 1 from projects p where p.id = project_id and p.leader_id = auth.uid())
    or profile_id = auth.uid() -- a student may leave a project themself
  );

create policy "leader can add the initial member row for their own project"
  on project_members for insert with check (
    exists (select 1 from projects p where p.id = project_id and p.leader_id = auth.uid())
  );

-- ---------- JOIN REQUESTS ----------
create policy "applicant and leader can view a request"
  on join_requests for select using (
    applicant_id = auth.uid()
    or exists (select 1 from projects p where p.id = project_id and p.leader_id = auth.uid())
  );

create policy "authenticated users can create join requests for themselves"
  on join_requests for insert with check (
    applicant_id = auth.uid()
  );

create policy "only the project leader can decide a request"
  on join_requests for update using (
    exists (select 1 from projects p where p.id = project_id and p.leader_id = auth.uid())
  );

-- ---------- PROJECT UPDATES ----------
create policy "project updates readable by any signed-in student"
  on project_updates for select using (auth.role() = 'authenticated');

create policy "leader or a member can post a project update"
  on project_updates for insert with check (
    author_id = auth.uid()
    and (
      exists (select 1 from projects p where p.id = project_id and p.leader_id = auth.uid())
      or exists (select 1 from project_members pm where pm.project_id = project_updates.project_id and pm.profile_id = auth.uid())
    )
  );

-- ---------- SAVED PROJECTS ----------
create policy "a student manages only their own saved projects"
  on saved_projects for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ---------- NOTIFICATIONS ----------
create policy "a student can read only their own notifications"
  on notifications for select using (auth.uid() = profile_id);

create policy "a student can mark only their own notifications read"
  on notifications for update using (auth.uid() = profile_id);

-- Inserts happen via security-definer triggers, so no general insert policy.

-- ---------- ACHIEVEMENTS ----------
create policy "achievements readable by any signed-in student"
  on achievements for select using (auth.role() = 'authenticated');

create policy "a student manages only their own achievements"
  on achievements for insert with check (auth.uid() = profile_id);
create policy "a student updates only their own achievements"
  on achievements for update using (auth.uid() = profile_id);
create policy "a student deletes only their own achievements"
  on achievements for delete using (auth.uid() = profile_id);
