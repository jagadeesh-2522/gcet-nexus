import { z } from "zod";

const GCET_DOMAIN = "@gcet.edu.in";

export const collegeEmail = z
  .string()
  .email("Enter a valid email address.")
  .toLowerCase()
  .refine((email) => email.endsWith(GCET_DOMAIN), {
    message: `Use your college email — it must end with ${GCET_DOMAIN}.`,
  });

export const signupSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  email: collegeEmail,
  branch: z.string().min(1, "Select your branch."),
  year: z.coerce.number().int().min(1).max(4),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const loginSchema = z.object({
  email: collegeEmail,
  password: z.string().min(1, "Enter your password."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
