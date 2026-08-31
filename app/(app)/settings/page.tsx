"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Link2,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { updateProfile, type UpdateProfileInput } from "./actions";
import type { Profile, Availability } from "@/lib/types";
import { cn } from "@/lib/utils";

const AVAILABILITY_OPTIONS: {
  value: Availability;
  label: string;
  description: string;
}[] = [
  {
    value: "open",
    label: "Open to collaborate",
    description: "Available for new projects",
  },
  {
    value: "limited",
    label: "Limited availability",
    description: "Selective about new commitments",
  },
  {
    value: "unavailable",
    label: "Not available",
    description: "Not looking for projects right now",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [fullName, setFullName] = useState("");
  const [section, setSection] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState<Availability>("open");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?next=/settings");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single<Profile>();

      if (profileError || !profileData) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      setProfile(profileData);
      setFullName(profileData.full_name);
      setSection(profileData.section || "");
      setBio(profileData.bio || "");
      setAvailability(profileData.availability);
      setGithubUrl(profileData.github_url || "");
      setLinkedinUrl(profileData.linkedin_url || "");
      setPortfolioUrl(profileData.portfolio_url || "");
      setAvatarUrl(profileData.avatar_url || "");
      setLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const input: UpdateProfileInput = {
        full_name: fullName,
        section: section || undefined,
        bio: bio || undefined,
        availability,
        github_url: githubUrl || undefined,
        linkedin_url: linkedinUrl || undefined,
        portfolio_url: portfolioUrl || undefined,
        avatar_url: avatarUrl || undefined,
      };

      await updateProfile(input);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-9 w-9 animate-spin text-accent" />
          <p className="mt-5 text-[13.5px] font-medium text-muted">Loading your settings…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-danger/20 bg-danger/[0.05] px-8 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/[0.10]">
            <AlertCircle className="h-7 w-7 text-danger" />
          </div>
          <h2 className="mt-5 font-display text-[20px] font-semibold text-foreground">
            Failed to load profile
          </h2>
          <p className="mt-3 text-[13.5px] text-muted">
            {error || "Unable to load your profile settings"}
          </p>
          <Link href="/feed" className="btn-secondary mt-7 text-[13px]">
            Go to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Header */}
      <header className="mb-9">
        <Link
          href={`/profile/${profile.id}`}
          className="group inline-flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back to profile
        </Link>
        <div className="mt-4 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/[0.10] ring-1 ring-accent/20">
            <User className="h-5 w-5 text-accent" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-tight text-foreground sm:text-[32px]">
              Settings
            </h1>
          </div>
        </div>
        <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted pl-[52px]">
          Manage your GCET Nexus profile and preferences
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-10">
        {/* ═══ Profile ═══ */}
        <Section
          icon={User}
          title="Profile"
          description="Your identity on GCET Nexus"
        >
          <div className="space-y-5">
            <Field
              label="Full name"
              required
              hint="Your real name as it appears on official records"
            >
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input text-[14px]"
                required
                minLength={2}
                placeholder="e.g. Arjun Kumar"
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Branch" immutable>
                <div className="input cursor-not-allowed flex items-center bg-surface-2 text-muted py-2.5">
                  {profile.branch}
                </div>
              </Field>
              <Field label="Year" immutable>
                <div className="input cursor-not-allowed flex items-center bg-surface-2 text-muted py-2.5">
                  Year {profile.year}
                </div>
              </Field>
            </div>

            <Field label="Section" hint="Optional — e.g. A, B, C">
              <input
                id="section"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                className="input text-[14px]"
                placeholder="A"
                maxLength={1}
              />
            </Field>

            <Field
              label="Availability"
              hint="Let others know if you're open to new projects"
            >
              <div className="space-y-2.5">
                {AVAILABILITY_OPTIONS.map((option) => {
                  const isActive = availability === option.value;
                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all duration-150",
                        isActive
                          ? "border-accent/35 bg-accent/[0.05] shadow-xs"
                          : "border-border bg-surface hover:border-border-strong hover:bg-surface-2/60",
                      )}
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={isActive}
                        onChange={(e) =>
                          setAvailability(e.target.value as Availability)
                        }
                        className="peer sr-only"
                      />
                      <div
                        className={cn(
                          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-all",
                          isActive
                            ? "border-accent bg-accent"
                            : "border-muted-2 bg-transparent",
                        )}
                      >
                        {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-[14px] font-semibold leading-tight",
                            isActive ? "text-foreground" : "text-foreground/90",
                          )}
                        >
                          {option.label}
                        </p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field
              label="Bio"
              hint="Tell others about yourself, your interests, and what you're working on"
            >
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input min-h-[120px] text-[14px] leading-relaxed resize-y"
                placeholder="I'm a third-year CSE student passionate about web development and AI…"
                maxLength={500}
              />
              <div className="mt-2 flex items-center justify-between text-[11.5px]">
                <span className="text-muted">Maximum 500 characters</span>
                <span
                  className={cn(
                    "tabular-nums",
                    bio.length > 450 ? "font-semibold text-warning" : "text-muted",
                  )}
                >
                  {bio.length}/500
                </span>
              </div>
            </Field>
          </div>
        </Section>

        {/* ═══ Links ═══ */}
        <Section
          icon={Link2}
          title="Links"
          description="Connect your external profiles"
        >
          <div className="space-y-5">
            <Field
              label="GitHub"
              hint="Your GitHub profile URL"
              icon={Github}
            >
              <input
                id="githubUrl"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="input pl-10 text-[14px]"
                placeholder="https://github.com/username"
              />
            </Field>

            <Field
              label="LinkedIn"
              hint="Your LinkedIn profile URL"
              icon={Linkedin}
            >
              <input
                id="linkedinUrl"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="input pl-10 text-[14px]"
                placeholder="https://linkedin.com/in/username"
              />
            </Field>

            <Field
              label="Portfolio"
              hint="Your personal website or portfolio"
              icon={Globe}
            >
              <input
                id="portfolioUrl"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="input pl-10 text-[14px]"
                placeholder="https://yourportfolio.com"
              />
            </Field>
          </div>
        </Section>

        {/* ═══ Avatar ═══ */}
        <Section
          icon={ImageIcon}
          title="Avatar"
          description="Your profile picture"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="p-[3px] rounded-2xl bg-gradient-to-br from-accent/30 via-transparent to-accent/15 shadow-sm">
                <Avatar
                  src={avatarUrl || profile.avatar_url}
                  alt={fullName}
                  fallback={fullName}
                  size="xl"
                />
              </div>
              <p className="text-[11.5px] text-muted">Preview</p>
            </div>

            <div className="flex-1">
              <Field
                label="Avatar URL"
                hint="Enter a direct link to your avatar image (JPG, PNG, or WEBP)"
              >
                <input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="input text-[14px]"
                  placeholder="https://example.com/avatar.jpg"
                />
              </Field>
            </div>
          </div>
        </Section>

        {/* Messages */}
        {error && (
          <div className="flex items-start gap-3.5 rounded-xl border border-danger/25 bg-danger/[0.07] px-5 py-4">
            <AlertCircle className="h-[18px] w-[18px] shrink-0 text-danger mt-[1px]" />
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold text-danger">
                Unable to save changes
              </p>
              <p className="mt-1 text-[13px] text-danger/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3.5 rounded-xl border border-success/25 bg-success/[0.07] px-5 py-4">
            <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-success mt-[1px]" />
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold text-success">
                Profile updated successfully
              </p>
              <p className="mt-1 text-[13px] text-success/90 leading-relaxed">
                Your changes have been saved
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-border/80 pt-7 sm:flex-row sm:justify-end sm:items-center">
          <Link
            href={`/profile/${profile.id}`}
            className="btn-secondary text-[14px] h-11"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              "btn-primary flex h-11 items-center justify-center gap-2 text-[14px] sm:min-w-[190px]",
              saving && "cursor-wait",
            )}
          >
            {saving ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4.5 w-4.5" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-surface/40 p-6 sm:p-7 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/[0.10] ring-1 ring-accent/15">
          <Icon className="h-[18px] w-[18px] text-accent" strokeWidth={2.1} />
        </div>
        <div className="flex-1 pt-0.5">
          <h2 className="font-display text-[18px] font-semibold leading-tight text-foreground">
            {title}
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  immutable,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  immutable?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted" strokeWidth={2} />}
        <label className="text-[12.5px] font-semibold tracking-[0.01em] text-foreground">
          {label}
          {required && <span className="ml-0.5 text-accent">*</span>}
          {immutable && (
            <span className="ml-2 text-[11px] font-normal text-muted">
              (Cannot be changed)
            </span>
          )}
        </label>
      </div>
      <div className="relative">{children}</div>
      {hint && !immutable && (
        <p className="field-hint mt-2">{hint}</p>
      )}
    </div>
  );
}
