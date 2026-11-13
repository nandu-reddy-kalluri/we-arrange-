// Legacy cookie name kept solely so logout handlers can clear any stale browser cookie cleanly.
// Do NOT authorize access from cookie presence or static email lists; use DB-backed RBAC (public.admins / public.roles).
export const ADMIN_SESSION_COOKIE = "ymwa_admin_session";
