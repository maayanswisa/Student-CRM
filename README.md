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

- Row Level Security is intentionally simple: any authenticated user (there is only one) can read/write everything. There's no per-row ownership since this is a single-admin tool, not multi-tenant. There is also no separate "admin" flag anywhere — whichever user you create in Authentication → Users is the one account this app trusts.
- Deleting a student is a soft "archive" (status change), never a hard delete, so lesson history is preserved.
- When creating your user in Authentication → Users, check **Auto Confirm User** (or confirm the email link Supabase sends). An unconfirmed user cannot sign in.

## Troubleshooting

**Login fails with "fetch failed" instead of a real error, or `git push`/`fetch` fail with a certificate error.**

This happens when antivirus software (seen with AVG's "Web/Mail Shield") intercepts outbound HTTPS traffic and re-signs it with its own root certificate, which Node/Git don't trust out of the box.

- For `git`: run `git -c http.sslBackend=schannel <command>` (e.g. `push`/`pull`/`fetch`) — this tells Git to check Windows' own certificate store instead of its bundled one.
- For `npm run dev` / the app itself: export the interfering root certificate from Windows into `certs/avg-root.pem` (gitignored, machine-specific):
  ```powershell
  $cert = Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Subject -match "AVG" } | Select-Object -First 1
  New-Item -ItemType Directory -Force -Path certs | Out-Null
  $b64 = [Convert]::ToBase64String($cert.RawData, [Base64FormattingOptions]::InsertLineBreaks)
  "-----BEGIN CERTIFICATE-----`n$b64`n-----END CERTIFICATE-----" | Set-Content -Path certs\avg-root.pem -Encoding ascii
  ```
  Swap `"AVG"` for whatever security product's root cert shows up under `Cert:\LocalMachine\Root` if it's a different vendor. The `dev` script already points Node at `./certs/avg-root.pem` via `NODE_EXTRA_CA_CERTS` (set through `cross-env` in `package.json`, **not** `.env.local` — Node reads that variable at process boot, before `.env.local` is ever loaded, so setting it there has no effect). On a machine without this file, the flag is simply ignored.
