"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Availability } from "@/lib/types";

export interface UpdateProfileInput {
  full_name: string;
  section?: string;
  bio?: string;
  availability: Availability;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
}

export async function updateProfile(input: UpdateProfileInput) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to update your profile.");
  }

  // Clean up empty strings to null for optional fields
  const cleanedInput = {
    full_name: input.full_name.trim(),
    section: input.section?.trim() || null,
    bio: input.bio?.trim() || null,
    availability: input.availability,
    github_url: input.github_url?.trim() || null,
    linkedin_url: input.linkedin_url?.trim() || null,
    portfolio_url: input.portfolio_url?.trim() || null,
    avatar_url: input.avatar_url?.trim() || null,
  };

  const { error } = await supabase
    .from("profiles")
    .update(cleanedInput)
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  revalidatePath(`/profile/${user.id}`);
}
