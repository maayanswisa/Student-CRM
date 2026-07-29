const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? "maayanswisa9@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.has(email.toLowerCase());
}
