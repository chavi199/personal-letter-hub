# Personal Letter Hub

A Hebrew web app for writing and organizing a large number of personal letters.

The app does not write letters for you. It keeps groups, people, reusable phrases, versions, and design in one place, so each letter stays in your own words.

## Features

- **Accounts.** Sign in, register, and reset a password with Supabase Auth. Every screen except login requires a session.
- **Dashboard.** See groups and how many letters are still open.
- **Groups and people.** Organize recipients, track each letter as not started, draft, or completed, and keep personal notes next to the text.
- **Content library.** Store reusable openings, compliments, and closings.
- **Letter versions.** Save a version, restore it, or delete it. Applying a version to other people adds a new version for each of them and does not overwrite their current letter.
- **Design.** Choose a theme, colors, border, logo, or background. Design is stored on the version and does not change the wording.
- **Formatting assist.** Send the current letter through Gemini to fix spelling, punctuation, paragraphs, and spacing. The assistant is instructed not to change meaning or tone.
- **Export.** Download one letter, or a whole group, as PDF or Word.
- **Statistics.** Review progress and export a group from the statistics screen.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript, Tailwind CSS, Radix UI |
| App | TanStack Start, TanStack Router, TanStack Query, Vite |
| Data | Supabase: PostgreSQL, Auth, Storage |
| Formatting | Gemini, called from the `gemini-format` Edge Function |

Row-level security is part of the data model: each user only sees their own groups, content, and versions. Details are in [`docs/DATABASE.md`](docs/DATABASE.md).

## Repository layout

```
src/routes        screens (dashboard, groups, letter, library, statistics, login)
src/components    letter panels and shared UI
src/hooks         React Query hooks
src/lib/api       Supabase access
src/lib           design themes, export, Supabase client
supabase          SQL migrations and the Gemini Edge Function
docs              architecture, database, and module notes
```

## Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project

## Local setup

```bash
git clone https://github.com/chavi199/personal-letter-hub.git
cd personal-letter-hub
npm ci
cp .env.example .env.local
```

Fill in `.env.local`:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Use the anon key, not the service-role key. `.env.local` is gitignored.

Then start the app:

```bash
npm run dev
```

## Database

[`docs/DATABASE.md`](docs/DATABASE.md) describes `groups`, `people`, `content_items`, and `letter_versions`, including row-level security.

After those tables exist, run the SQL in `supabase/migrations` in order:

1. `20240101000000_add_design_config_to_letter_versions.sql` adds `design_config` to each version.
2. `20240102000000_create_design_assets_bucket.sql` creates the storage bucket for logos and backgrounds.

## Formatting assist

The browser never receives the Gemini key. `src/lib/api/ai-editor.ts` calls the `gemini-format` Edge Function, and the function reads `GEMINI_API_KEY` from Supabase secrets.

Deploy the function in `supabase/functions/gemini-format`, then set the secret in the Supabase project. A key from [Google AI Studio](https://aistudio.google.com/) is enough for the free tier.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Deploy

[`render.yaml`](render.yaml) describes a Render static site:

- Build: `npm ci && npm run build`
- Publish directory: `dist`
- Branch: `main`

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Render dashboard. Do not commit them. Step-by-step notes are in [`DEPLOY_TO_RENDER.md`](DEPLOY_TO_RENDER.md).

## Further reading

- [`docs/PROJECT.md`](docs/PROJECT.md) — product scope
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how UI, services, and Supabase fit together
- [`docs/modules`](docs/modules) — versions, design, export, formatting, and applying a version
