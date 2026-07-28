# CRM למורים פרטיים (Personal Tutor CRM)

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui, backed by Supabase (Postgres + Auth). RTL Hebrew interface, mobile-first, single-admin login.

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com/dashboard) (free tier is enough).
2. **Run the schema migration**: open the SQL Editor in your Supabase project and run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. **Create your admin login**: in the Supabase dashboard go to Authentication → Users → Add user, and set an email + password. There is no self-serve sign-up page — this is the only account.
4. **Set environment variables**: copy `.env.local.example` to `.env.local` (already present with placeholder values) and fill in your project's URL and anon key, found in Project Settings → API:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. **Install dependencies and run**:
   ```bash
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) and log in with the user you created in step 3.

## Project structure

- `src/app/(dashboard)` — the authenticated app: dashboard, students, lessons, reports, wrapped in a shared sidebar/bottom-nav shell.
- `src/app/login` — the single login page.
- `src/actions/` — Server Actions for all data mutations (students, lessons, auth).
- `src/lib/supabase/` — Supabase client factories for browser, server components, and the proxy (Next.js 16's renamed `middleware`).
- `src/lib/whatsapp.ts` — builds `wa.me` deep links for payment reminders, lesson reminders, and lesson summaries. These only pre-fill a WhatsApp message; nothing is sent automatically.
- `src/lib/export.ts` — CSV / Excel (`.xlsx`) report generation for the Reports page.
- `supabase/migrations/0001_init.sql` — the full `students` / `lessons` schema with RLS policies.

## Notes

- Row Level Security is intentionally simple: any authenticated user (there is only one) can read/write everything. There's no per-row ownership since this is a single-admin tool, not multi-tenant.
- Deleting a student is a soft "archive" (status change), never a hard delete, so lesson history is preserved.
