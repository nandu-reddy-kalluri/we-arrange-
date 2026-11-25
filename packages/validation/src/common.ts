import { z } from "zod";

export const positiveIntIdSchema = z.coerce
  .number()
  .int("Identifier must be an integer")
  .positive("Identifier must be positive");

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(160, "Slug is too long")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const slugOrIdSchema = z
  .string()
  .trim()
  .min(1, "Identifier is required")
  .max(160);

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const isoDateTimeSchema = z
  .string()
  .datetime({ offset: true, message: "Timestamp must be valid ISO 8601 datetime" })
  .or(z.string().datetime({ message: "Timestamp must be valid ISO 8601 datetime" }));

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const inrAmountSchema = z.coerce
  .number()
  .finite()
  .min(0, "Amount cannot be negative")
  .max(500_000_000, "Amount exceeds supported transaction limit");

const PRIVATE_OR_METADATA_HOST_REGEX =
  /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|\[::1\])$/i;

export const safeHttpUrlSchema = z
  .string()
  .trim()
  .url("Valid URL is required")
  .refine((u) => {
    try {
      const parsed = new URL(u);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
      const hostname = parsed.hostname.toLowerCase();
      // Block internal/loopback/cloud metadata SSRF vectors in non-test runtimes
      if (process.env.NODE_ENV === "production" && PRIVATE_OR_METADATA_HOST_REGEX.test(hostname)) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, "URL must be a valid public http or https address (private and cloud metadata addresses are prohibited)");

export const nonEmptyTrimmed = (label: string, max = 500) =>
  z.string().trim().min(1, `${label} is required`).max(max);

// Non-price sorting strictly enforced across catalog & search per ENGINEERING_RULES.md
export const ALLOWED_CATALOG_SORT_FIELDS = [
  "relevance",
  "rating",
  "reviews",
  "capacity",
  "newest",
] as const;

export const catalogSortBySchema = z.enum(ALLOWED_CATALOG_SORT_FIELDS).default("relevance");
export const sortDirectionSchema = z.enum(["asc", "desc"]).default("desc");

