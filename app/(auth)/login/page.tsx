"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justSignedUp  = params.get("confirm") === "1";
  const confirmFailed = params.get("error")   === "confirmation_failed";

  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "That email or password doesn't match our records."
          : error.message
      );
      return;
    }

    router.push(params.get("next") ?? "/feed");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="font-display text-base font-semibold text-foreground">Welcome back</h1>
      <p className="mt-0.5 text-sm text-muted">Sign in with your college email.</p>

      {/* Confirmation banners */}
      {justSignedUp && (
        <p className="mt-4 rounded-lg bg-live/10 px-3.5 py-2.5 text-sm text-live">
          Check your inbox — confirm your email before signing in.
        </p>
      )}
      {confirmFailed && (
        <p className="mt-4 rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          Email confirmation failed or expired. Please try signing up again.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="field-label">College email</label>
          <input
            {...register("email")}
            id="login-email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="you@gcet.edu.in"
          />
          {errors.email && (
            <span className="field-error">{errors.email.message}</span>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" className="field-label">Password</label>
          <input
            {...register("password")}
            id="login-password"
            className="input"
            type="password"
            autoComplete="current-password"
          />
          {errors.password && (
            <span className="field-error">{errors.password.message}</span>
          )}
        </div>

        {/* Server error */}
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
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h1 className="font-display text-base font-semibold text-foreground">Welcome back</h1>
      <p className="mt-0.5 text-sm text-muted">Sign in with your college email.</p>
      
      <div className="mt-5 space-y-4">
        <div>
          <label className="field-label">College email</label>
          <div className="input bg-surface-2 animate-pulse h-10"></div>
        </div>
        <div>
          <label className="field-label">Password</label>
          <div className="input bg-surface-2 animate-pulse h-10"></div>
        </div>
        <div className="btn-primary h-10 w-full bg-surface-2 animate-pulse"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      {/* Card */}
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

        {/* Form card with Suspense boundary */}
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        {/* Footer link */}
        <p className="mt-5 text-center text-sm text-muted">
          New to Nexus?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
