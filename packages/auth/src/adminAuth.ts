export const ADMIN_SESSION_COOKIE = "ymwa_admin_session";

export const AUTHORIZED_ADMIN_EMAILS = [
  "sanjaypatel243444@gmail.com",
  (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
].filter(Boolean);

export function verifyAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}
