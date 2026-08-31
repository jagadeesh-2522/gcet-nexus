// Hand-written domain types mirroring supabase/schema.sql.
// (In a real deployment, regenerate with `supabase gen types typescript`
// and keep these as the source of truth for anything the generator misses.)

export type Availability = "open" | "limited" | "unavailable";
export type ProjectType = "hackathon" | "personal" | "academic" | "open_source" | "startup";
export type ProjectStatus = "recruiting" | "in_progress" | "closed" | "completed" | "paused";
export type RequestStatus = "pending" | "accepted" | "declined";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  branch: string;
  year: number;
  section: string | null;
  bio: string | null;
  availability: Availability;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  leader_id: string;
  name: string;
  short_description: string;
  full_description: string;
  type: ProjectType;
  hackathon_name: string | null;
  hackathon_url: string | null;
  tech_stack: string[];
  required_roles: string[];
  required_skills: string[];
  current_team_size: number;
  max_team_size: number;
  status: ProjectStatus;
  deadline: string | null;
  external_url: string | null;
  created_at: string;
  updated_at: string;
  // Convenience fields hydrated by feed/detail queries:
  leader?: Pick<Profile, "id" | "full_name" | "branch" | "year" | "avatar_url">;
}

export interface JoinRequest {
  id: string;
  project_id: string;
  applicant_id: string;
  why_message: string;
  contribution_message: string;
  status: RequestStatus;
  created_at: string;
  decided_at: string | null;
  applicant?: Profile;
}

export interface ProjectMember {
  project_id: string;
  profile_id: string;
  role: string | null;
  joined_at: string;
  profile?: Pick<Profile, "id" | "full_name" | "avatar_url" | "branch" | "year">;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type:
    | "join_request_received"
    | "join_request_accepted"
    | "join_request_declined"
    | "added_to_project"
    | "removed_from_project"
    | "project_update";
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export type ActivityType = "project_created" | "member_joined" | "update_posted" | "request_accepted";

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  actor: Pick<Profile, "id" | "full_name" | "branch" | "year" | "avatar_url">;
  project: Pick<Project, "id" | "name" | "type" | "tech_stack">;
  timestamp: string;
  context?: {
    updateBody?: string;
    memberRole?: string | null;
  };
}

// Minimal Supabase Database type placeholder so `createClient<Database>`
// type-checks. Replace with the generated type once the schema is live.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
