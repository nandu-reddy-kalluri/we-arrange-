/**
 * Safely parse JSON strings with fallbacks and error handling.
 * Prevents "Unexpected end of JSON input" runtime errors.
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw || typeof raw !== "string" || raw.trim() === "") {
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn("safeJsonParse error:", error);
    return fallback;
  }
}
