import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address (e.g., name@domain.com)"),
  password: z
    .string()
    .min(1, "Please enter your password")
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const vendorRegisterSchema = registerSchema.extend({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(160),
  categorySlug: z.string().trim().min(2, "Vendor category is required").max(80),
  city: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(2000).optional(),
  website: z.string().trim().url("Invalid website URL").optional(),
});

export const refreshSessionSchema = z.object({
  refreshToken: z.string().min(10, "Valid refresh token is required").optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  redirectTo: z.string().url().optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string().min(8).max(128).optional(),
  accessToken: z.string().min(10).optional(),
  code: z.string().min(4).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "New password and confirmation do not match",
  });

