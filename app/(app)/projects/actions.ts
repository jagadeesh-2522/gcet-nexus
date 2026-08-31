"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { projectSchema, joinRequestSchema, type ProjectInput, type JoinRequestInput } from "@/lib/validations/project";

export async function createProject(input: ProjectInput) {
  const parsed = projectSchema.parse(input);
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to create a project.");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      leader_id: user.id,
      name: parsed.name,
      short_description: parsed.shortDescription,
      full_description: parsed.fullDescription,
      type: parsed.type,
      hackathon_name: parsed.hackathonName || null,
      hackathon_url: parsed.hackathonUrl || null,
      tech_stack: parsed.techStack,
      required_roles: parsed.requiredRoles,
      required_skills: parsed.requiredSkills,
      max_team_size: parsed.maxTeamSize,
      status: parsed.status,
      deadline: parsed.deadline || null,
      external_url: parsed.externalUrl || null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // The leader is the first team member.
  await supabase.from("project_members").insert({ project_id: data.id, profile_id: user.id, role: "Leader" });

  revalidatePath("/feed");
  redirect(`/projects/${data.id}`);
}

export async function submitJoinRequest(projectId: string, input: JoinRequestInput) {
  const parsed = joinRequestSchema.parse(input);
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to request to join.");

  const { error } = await supabase.from("join_requests").insert({
    project_id: projectId,
    applicant_id: user.id,
    why_message: parsed.whyMessage,
    contribution_message: parsed.contributionMessage,
  });

  // Unique constraint on (project_id, applicant_id) blocks duplicate requests.
  if (error) {
    if (error.code === "23505") {
      throw new Error("You've already requested to join this project.");
    }
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}`);
}

export async function decideJoinRequest(requestId: string, projectId: string, decision: "accepted" | "declined") {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  // RLS also enforces this, but checking here gives a clearer error.
  const { data: project } = await supabase.from("projects").select("leader_id").eq("id", projectId).single();
  if (!project || project.leader_id !== user.id) {
    throw new Error("Only the project leader can decide on requests.");
  }

  const { error } = await supabase.from("join_requests").update({ status: decision }).eq("id", requestId);
  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function toggleSaveProject(projectId: string, currentlySaved: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in.");

  if (currentlySaved) {
    await supabase.from("saved_projects").delete().eq("project_id", projectId).eq("profile_id", user.id);
  } else {
    await supabase.from("saved_projects").insert({ project_id: projectId, profile_id: user.id });
  }

  revalidatePath("/feed");
  revalidatePath("/my-projects");
}

export async function updateProject(projectId: string, input: ProjectInput) {
  const parsed = projectSchema.parse(input);
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to edit a project.");

  // Verify user is the leader (RLS also enforces this)
  const { data: project } = await supabase
    .from("projects")
    .select("leader_id")
    .eq("id", projectId)
    .single();

  if (!project || project.leader_id !== user.id) {
    throw new Error("Only the project leader can edit this project.");
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name: parsed.name,
      short_description: parsed.shortDescription,
      full_description: parsed.fullDescription,
      type: parsed.type,
      hackathon_name: parsed.hackathonName || null,
      hackathon_url: parsed.hackathonUrl || null,
      tech_stack: parsed.techStack,
      required_roles: parsed.requiredRoles,
      required_skills: parsed.requiredSkills,
      max_team_size: parsed.maxTeamSize,
      deadline: parsed.deadline || null,
      external_url: parsed.externalUrl || null,
      status: parsed.status || "recruiting",
    })
    .eq("id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/feed");
  revalidatePath("/my-projects");
  redirect(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to delete a project.");

  // Verify user is the leader (RLS also enforces this)
  const { data: project } = await supabase
    .from("projects")
    .select("leader_id")
    .eq("id", projectId)
    .single();

  if (!project || project.leader_id !== user.id) {
    throw new Error("Only the project leader can delete this project.");
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) throw new Error(error.message);

  revalidatePath("/feed");
  revalidatePath("/my-projects");
  redirect("/my-projects");
}
