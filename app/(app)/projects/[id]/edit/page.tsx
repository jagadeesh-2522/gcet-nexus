"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Link from "next/link";
import { Edit3, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { projectSchema, type ProjectInput, PROJECT_TYPES, PROJECT_STATUSES } from "@/lib/validations/project";
import { ROLE_OPTIONS, SKILL_OPTIONS } from "@/lib/constants";
import { TagInput } from "@/components/project/tag-input";
import { updateProject } from "../../actions";
import type { Project } from "@/lib/types";

const TYPE_LABEL: Record<(typeof PROJECT_TYPES)[number], string> = {
  hackathon: "Hackathon",
  personal: "Personal Project",
  academic: "Academic Project",
  open_source: "Open Source",
  startup: "Startup / Idea",
};

const STATUS_LABEL: Record<(typeof PROJECT_STATUSES)[number], string> = {
  recruiting: "Recruiting",
  in_progress: "In Progress",
  closed: "Closed",
  completed: "Completed",
  paused: "Paused",
};

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAuthorized, setNotAuthorized] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    mode: "onChange",
  });

  const type = watch("type");

  useEffect(() => {
    async function loadProject() {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }

      // Fetch project
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !project) {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }

      // Check if user is the leader
      if (project.leader_id !== user.id) {
        setNotAuthorized(true);
        setLoading(false);
        return;
      }

      // Pre-populate form
      reset({
        name: project.name,
        shortDescription: project.short_description,
        fullDescription: project.full_description,
        type: project.type,
        hackathonName: project.hackathon_name || "",
        hackathonUrl: project.hackathon_url || "",
        techStack: project.tech_stack,
        requiredRoles: project.required_roles,
        requiredSkills: project.required_skills || [],
        maxTeamSize: project.max_team_size,
        status: project.status,
        deadline: project.deadline || "",
        externalUrl: project.external_url || "",
      });

      setLoading(false);
    }

    loadProject();
  }, [params.id, reset]);

  async function onSubmit(values: ProjectInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      await updateProject(params.id, values);
    } catch (e) {
      // NEXT_REDIRECT throws internally on success — only surface real errors.
      if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
        setServerError(e.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl pb-16">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="mt-5 text-sm font-medium text-muted">Loading project...</p>
        </div>
      </div>
    );
  }

  if (notAuthorized) {
    return (
      <div className="mx-auto max-w-3xl pb-16">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-danger/20 bg-danger/5 px-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-8 w-8 text-danger" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold text-foreground">Access denied</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            You don't have permission to edit this project. Only the project leader can make changes.
          </p>
          <Link href="/my-projects" className="btn-secondary mt-8">
            Go to My Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 shadow-sm">
          <Edit3 className="h-7 w-7 text-accent" />
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground">Edit project</h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
          Update your project details. Changes will be visible immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        {/* ─── PROJECT IDENTITY ─────────────────────────────────────────── */}
        <section className="space-y-6">
          <SectionHeader
            title="Project Identity"
            description="Help others understand what you're building at a glance"
          />

          <Field
            label="Project name"
            hint="Keep it concise and memorable"
            error={errors.name?.message}
          >
            <input
              {...register("name")}
              className="input text-base"
              placeholder="e.g. CampusEats — food ordering for hostels"
            />
          </Field>

          <Field
            label="Short description"
            hint="One line that captures attention — shown on project cards"
            error={errors.shortDescription?.message}
          >
            <input
              {...register("shortDescription")}
              className="input text-base"
              placeholder="e.g. Order food from campus cafeterias via WhatsApp bot"
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Project type" error={errors.type?.message}>
              <select {...register("type")} className="input">
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Status" error={errors.status?.message}>
              <select {...register("status")} className="input">
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {type === "hackathon" && (
            <div className="grid grid-cols-1 gap-5 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:grid-cols-2">
              <Field label="Hackathon name" error={errors.hackathonName?.message}>
                <input {...register("hackathonName")} className="input" placeholder="Smart India Hackathon" />
              </Field>
              <Field label="Hackathon URL" hint="Optional" error={errors.hackathonUrl?.message}>
                <input {...register("hackathonUrl")} className="input" placeholder="https://" />
              </Field>
            </div>
          )}
        </section>

        {/* ─── PROJECT DETAILS ──────────────────────────────────────────── */}
        <section className="space-y-6 border-t border-border pt-12">
          <SectionHeader
            title="Project Details"
            description="Explain what you're building and why it matters"
          />

          <Field
            label="Full description"
            hint="What problem are you solving? What's your approach? Why should people care?"
            error={errors.fullDescription?.message}
          >
            <textarea
              {...register("fullDescription")}
              className="input min-h-48 text-base leading-relaxed"
              placeholder="Describe your project in detail..."
            />
          </Field>

          <Field label="External link" hint="GitHub, Figma, or project website (optional)" error={errors.externalUrl?.message}>
            <input {...register("externalUrl")} className="input" placeholder="https://github.com/yourproject" />
          </Field>

          <Field label="Deadline" hint="Optional — helps set clear expectations" error={errors.deadline?.message}>
            <input {...register("deadline")} type="date" className="input" />
          </Field>
        </section>

        {/* ─── TECHNOLOGY ───────────────────────────────────────────────── */}
        <section className="space-y-6 border-t border-border pt-12">
          <SectionHeader
            title="Technology"
            description="What tools and technologies will you use?"
          />

          <Field
            label="Tech stack"
            hint="Add technologies one by one — press Enter to confirm each"
            error={errors.techStack?.message}
          >
            <Controller
              control={control}
              name="techStack"
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={SKILL_OPTIONS}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                />
              )}
            />
          </Field>
        </section>

        {/* ─── TEAM ─────────────────────────────────────────────────────── */}
        <section className="space-y-6 border-t border-border pt-12">
          <SectionHeader
            title="Team"
            description="Who are you looking for? What roles do you need?"
          />

          <Field
            label="Roles needed"
            hint="Press Enter after each role — these appear as highlights to potential collaborators"
            error={errors.requiredRoles?.message}
          >
            <Controller
              control={control}
              name="requiredRoles"
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  suggestions={ROLE_OPTIONS}
                  placeholder="e.g. Frontend Developer, UI Designer"
                />
              )}
            />
          </Field>

          <Field
            label="Specific skills"
            hint="Optional — add any specific technical skills you're looking for"
            error={errors.requiredSkills?.message}
          >
            <Controller
              control={control}
              name="requiredSkills"
              render={({ field }) => (
                <TagInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  suggestions={SKILL_OPTIONS}
                  placeholder="e.g. TypeScript, Tailwind CSS"
                />
              )}
            />
          </Field>

          <Field
            label="Maximum team size"
            hint="Including yourself — you can always adjust this later"
            error={errors.maxTeamSize?.message}
          >
            <input
              {...register("maxTeamSize")}
              type="number"
              min={1}
              max={20}
              className="input"
            />
          </Field>
        </section>

        {/* ─── ACTIONS ──────────────────────────────────────────────────── */}
        <div className="border-t border-border pt-10">
          {serverError && (
            <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-5 py-4 text-sm text-danger">
              <p className="font-semibold">Unable to save changes</p>
              <p className="mt-1 text-danger/90">{serverError}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 text-base sm:flex-none sm:min-w-[200px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
            <Link href={`/projects/${params.id}`} className="btn-secondary text-base">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="pb-2">
      <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-sm font-bold text-foreground">{label}</span>
      {children}
      {hint && !error && <span className="field-hint mt-2">{hint}</span>}
      {error && <span className="field-error mt-2">{error}</span>}
    </label>
  );
}
