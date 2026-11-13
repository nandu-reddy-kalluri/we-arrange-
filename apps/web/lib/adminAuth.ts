// Deprecated local-file & hardcoded-password admin auth has been retired.
// All admin & concierge authentication now runs through Supabase Auth + DB RBAC in @/services/auth.
export { ADMIN_SESSION_COOKIE } from "@we-arrange/auth";
export {
  changeAuthenticatedPassword,
  completePasswordReset,
  loginWithPassword,
  logoutSession,
  requireActiveAdmin,
  requireConciergeOrAdmin,
  resolveAuthenticatedContext,
  sendPasswordResetEmail,
} from "@/services/auth";
