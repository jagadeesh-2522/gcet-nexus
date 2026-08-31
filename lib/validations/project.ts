import { z } from "zod";

export const PROJECT_TYPES = ["hackathon", "personal", "academic", "open_source", "startup"] as const;
export const PROJECT_STATUSES = ["recruiting", "in_progress", "closed", "completed", "paused"] as const;

export const projectSchema = z
  .object({
    name: z.string().min(3, "Give your project a name.").max(80),
    shortDescription: z.string().min(10, "Add a one-line description.").max(160),
    fullDescription: z.string().min(30, "Say a bit more about what you're building."),
    type: z.enum(PROJECT_TYPES),
    hackathonName: z.string().optional(),
    hackathonUrl: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
    techStack: z.array(z.string()).min(1, "Add at least one technology."),
    requiredRoles: z.array(z.string()).min(1, "Add at least one role you need."),
    requiredSkills: z.array(z.string()).default([]),
    maxTeamSize: z.coerce.number().int().min(1).max(20),
    status: z.enum(PROJECT_STATUSES).default("recruiting"),
    deadline: z.string().optional(),
    externalUrl: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  })
  .refine((data) => data.type !== "hackathon" || !!data.hackathonName, {
    message: "Add the hackathon name.",
    path: ["hackathonName"],
  });

export type ProjectInput = z.infer<typeof projectSchema>;

export const joinRequestSchema = z.object({
  whyMessage: z.string().min(10, "Tell the leader why you want to join.").max(500),
  contributionMessage: z.string().min(10, "Tell the leader what you can contribute.").max(500),
});

export type JoinRequestInput = z.infer<typeof joinRequestSchema>;
