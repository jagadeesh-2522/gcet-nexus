"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AI&ML", "CSD"];

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          branch:    values.branch,
          year:      values.year,
        },
      },
    });

    setSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/login?confirm=1");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[22rem] animate-scale-in">

        {/* Logo + wordmark */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Image
            src="/gcet-nexus-logo.png"
            alt="GCET Nexus"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-foreground">
              GCET Nexus
            </p>
            <p className="text-sm text-muted">Connect. Collaborate. Build.</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="font-display text-base font-semibold text-foreground">Create your account</h1>
          <p className="mt-0.5 text-sm text-muted">Only @gcet.edu.in emails can register.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>

            <Field label="Full name" htmlFor="sg-name" error={errors.fullName?.message}>
              <input
                {...register("fullName")}
                id="sg-name"
                className="input"
                autoComplete="name"
                placeholder="Aisha Reddy"
              />
            </Field>

            <Field label="College email" htmlFor="sg-email" error={errors.email?.message}>
              <input
                {...register("email")}
                id="sg-email"
                className="input"
                type="email"
                autoComplete="email"
                placeholder="you@gcet.edu.in"
              />
            </Field>

            {/* Branch + Year row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Branch" htmlFor="sg-branch" error={errors.branch?.message}>
                <select {...register("branch")} id="sg-branch" className="input" defaultValue="">
                  <option value="" disabled>Select</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>

              <Field label="Year" htmlFor="sg-year" error={errors.year?.message}>
                <select {...register("year")} id="sg-year" className="input" defaultValue="">
                  <option value="" disabled>Select</option>
                  {[1, 2, 3, 4].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Password" htmlFor="sg-password" error={errors.password?.message}>
              <input
                {...register("password")}
                id="sg-password"
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </Field>

            {serverError && (
              <p className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-1 h-10 w-full text-sm"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-muted">
          Already on Nexus?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Local field wrapper ────────────────────────────────────────────────────
function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="field-label">{label}</label>
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
