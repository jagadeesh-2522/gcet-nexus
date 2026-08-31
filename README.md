# GCET Nexus

Connect. Collaborate. Build. — A student-only builder network for Geethanjali
College of Engineering and Technology.

## Stack

Next.js 14 (App Router) + TypeScript · Tailwind CSS · Supabase (Postgres,
Auth, Row Level Security) · deployed on Vercel. Everything here runs on free
tiers.

## Setup

1. Create a free project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`, then `supabase/policies.sql`.
3. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon
   key (Project Settings → API).
4. `npm install`
5. `npm run dev` and visit `localhost:3000`.
6. In Supabase Auth settings, you may want to disable "Confirm email" while
   developing locally so signup is instant; re-enable it before launch.

## What's actually implemented

- **Auth**: signup/login restricted to `@gcet.edu.in`, enforced both in the
  form (zod) and at the database level (a `check` constraint on
  `profiles.email`), plus a trigger that provisions a profile row on signup.
  Middleware protects all routes except `/login`, `/signup`.
- **Database + RLS**: full schema (`supabase/schema.sql`) and policies
  (`supabase/policies.sql`) for projects, membership, join requests,
  notifications, saved projects, updates, and achievements — ownership is
  enforced in Postgres, not just in the UI.
- **Feed**: real query against `projects`, hydrated with each viewer's
  relationship to every project (leader / member / requested / none) so the
  CTA button is correct per-card, matching the button-state rules in the
  brief. Hackathon info is only rendered when present.
- **Project creation**: full form with tag-based role/skill/tech pickers,
  writing to Postgres via a server action, with the leader auto-added as the
  first team member.
- **Project details**: full page with team list, tech stack, roles, external
  link, and — for the leader only — a request management panel with real
  accept/decline actions that insert the member, bump the team size, and
  fire notifications (all done inside a Postgres trigger for atomicity).
- **Join request flow**: the request form collects "why" and "what can you
  contribute," is blocked from duplicate submission by a unique constraint,
  and is fully separate from the leader's must-explicitly-decide step — a
  request never auto-adds anyone to a team.
- **Theming**: dark (primary) and light themes with distinct token values
  (not an inversion), persisted to `localStorage`, plus a system-preference
  fallback on first load.
- **Opening animation**: a ~2s CSS/SVG sequence (scattered nodes → converge
  into the Nexus mark → wordmark) that plays once per browser session via
  `sessionStorage`, not on every navigation.
- **Logo**: a reproducible geometric SVG (`components/layout/logo.tsx`) —
  three orbiting nodes converging on a center node.

## What's scaffolded but needs finishing before launch

These follow the same patterns as the pages above — same data model, same
RLS, same server-action approach — so they're mechanical to complete:

- **Discover / search page** — filters (branch, year, skills, availability,
  project type, recruitment status) are designed for in section 17 of the
  brief and the schema already has the indexes (`gin` on `tech_stack` and
  `required_skills`) to support them, but the page itself isn't built yet.
- **Profile pages** (`/profile/[id]`) and the profile dashboard (current /
  completed projects, collaborations, hackathons, achievements) — the
  `profiles`, `project_members`, and `achievements` tables are ready; the
  page needs writing.
- **My Projects** page (leading / participating / completed tabs) — same
  situation: data model ready, page not written.
- **Notifications page** — the `notifications` table, triggers, and unread
  badge in the navbar are live; the page that lists and marks-read is not
  yet built.
- **Settings page** — edit profile, theme, logout.
- **Project updates composer** — reading updates on the project page works;
  the "post an update" form for leaders/members doesn't exist yet.
- **Skill/interest tag management on the profile edit form.**
- **Saved Projects UI** — the bookmark button in `ProjectCard` is currently
  visual only; wire it to the `toggleSaveProject` server action (already
  written in `app/(app)/projects/actions.ts`).
- **shadcn/ui primitives** — the brief calls for shadcn where useful; this
  pass used plain Tailwind classes (`.input`, `.btn-primary`, `.card` in
  `globals.css`) to keep the file count manageable. Swapping in shadcn
  components is optional polish, not a blocker.

No feature above is faked with mock data — they're simply not built yet, and
are called out here rather than stubbed with placeholder content, per the
project's own rule against pretending a feature works when it doesn't.

## Folder structure

```
app/
  (auth)/login, (auth)/signup        — public auth pages
  (app)/feed, discover, my-projects, — authenticated app shell (see layout.tsx)
       notifications, settings
  (app)/projects/new, [id], actions.ts
  (app)/profile/[id]
components/
  layout/   — navbar, theme provider/toggle, logo, intro animation, empty state
  project/  — project card, badges, tag input, join dialog, request manager, team list
lib/
  supabase/ — browser + server Supabase clients
  validations/ — zod schemas for auth and project forms
  types.ts, constants.ts, utils.ts
supabase/
  schema.sql, policies.sql
```
