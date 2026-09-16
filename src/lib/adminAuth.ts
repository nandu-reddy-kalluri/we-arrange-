// Server-side Admin Auth helper
import fs from "fs";
import path from "path";

// File path for optional password persistence in local environment
const AUTH_PERSIST_FILE = path.join(process.cwd(), ".admin_auth.json");

// Default initial master password as requested
const DEFAULT_PASSWORD = "252U1R9162";
export const AUTHORIZED_ADMIN_EMAILS = [
  "sanjaypatel243444@gmail.com",
  (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
].filter(Boolean);

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "sanjaypatel243444@gmail.com").toLowerCase().trim();
export const ADMIN_SESSION_COOKIE = "ymwa_admin_session";

function loadPersistedPassword(): string {
  try {
    if (fs.existsSync(AUTH_PERSIST_FILE)) {
      const data = JSON.parse(fs.readFileSync(AUTH_PERSIST_FILE, "utf-8"));
      if (data?.password) {
        return data.password;
      }
    }
  } catch {
    // Fall back to memory default
  }
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

function savePersistedPassword(pwd: string): void {
  try {
    fs.writeFileSync(AUTH_PERSIST_FILE, JSON.stringify({ password: pwd, updatedAt: new Date().toISOString() }), "utf-8");
  } catch {
    // If file write fails, in-memory will still hold it
  }
}

let currentAdminPassword = loadPersistedPassword();

export function getAdminPassword(): string {
  return currentAdminPassword;
}

export function setAdminPassword(newPassword: string): void {
  currentAdminPassword = newPassword;
  savePersistedPassword(newPassword);
}

export function verifyAdminPassword(password: string): boolean {
  return password === currentAdminPassword;
}

export function verifyAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return AUTHORIZED_ADMIN_EMAILS.includes(normalized);
}

// ── In-Memory OTP Store for Password Recovery ──────────────────────────────
interface OtpEntry {
  otp: string;
  expiresAt: number; // timestamp
  cooldownUntil: number; // timestamp
  attempts: number;
}

interface ResetTokenEntry {
  email: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpEntry>();
const resetTokenStore = new Map<string, ResetTokenEntry>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes validity
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes validity

export function requestPasswordResetOtp(email: string): { success: boolean; error?: string; cooldownRemaining?: number } {
  const normalizedEmail = email.toLowerCase().trim();
  if (!verifyAdminEmail(normalizedEmail)) {
    return { success: false, error: "The provided email is not an authorized administrator address." };
  }

  const now = Date.now();
  const existing = otpStore.get(normalizedEmail);

  if (existing && existing.cooldownUntil > now) {
    const remainingSec = Math.ceil((existing.cooldownUntil - now) / 1000);
    return { success: false, error: `Please wait ${remainingSec}s before requesting another OTP.`, cooldownRemaining: remainingSec };
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(normalizedEmail, {
    otp,
    expiresAt: now + OTP_TTL_MS,
    cooldownUntil: now + RESEND_COOLDOWN_MS,
    attempts: 0,
  });

  // Log in server console for administrative tracking and dev inspection
  console.log(`\n======================================================`);
  console.log(`[YMWA Security Notification]`);
  console.log(`Admin Password Reset OTP generated for: ${normalizedEmail}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Expires in: 10 minutes`);
  console.log(`======================================================\n`);

  return { success: true };
}

export function verifyResetOtp(email: string, enteredOtp: string): { success: boolean; resetToken?: string; error?: string } {
  const normalizedEmail = email.toLowerCase().trim();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { success: false, error: "No pending password reset request found. Please request a new OTP." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { success: false, error: "The verification OTP has expired. Please request a new code." };
  }

  if (record.attempts >= 5) {
    otpStore.delete(normalizedEmail);
    return { success: false, error: "Too many failed attempts. Please request a new OTP." };
  }

  if (record.otp !== enteredOtp.trim()) {
    record.attempts += 1;
    return { success: false, error: "Invalid OTP code. Please check and try again." };
  }

  // OTP verified successfully -> clear it and issue a secure one-time reset token
  otpStore.delete(normalizedEmail);

  const resetToken = `ymwa_rst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  resetTokenStore.set(resetToken, {
    email: normalizedEmail,
    expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
  });

  return { success: true, resetToken };
}

export function resetAdminPasswordWithToken(resetToken: string, newPassword: string): { success: boolean; error?: string } {
  if (!resetToken) {
    return { success: false, error: "Invalid or missing reset token." };
  }

  const entry = resetTokenStore.get(resetToken);
  if (!entry) {
    return { success: false, error: "Invalid or expired session. Please start the password recovery process again." };
  }

  if (Date.now() > entry.expiresAt) {
    resetTokenStore.delete(resetToken);
    return { success: false, error: "Reset session has expired. Please request a new OTP." };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  // Update password
  setAdminPassword(newPassword.trim());

  // Clean up reset token so it cannot be reused
  resetTokenStore.delete(resetToken);

  console.log(`[YMWA Security Notification] Master admin password successfully reset for: ${entry.email}`);

  return { success: true };
}
