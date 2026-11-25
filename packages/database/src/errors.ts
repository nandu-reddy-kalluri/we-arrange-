export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "RATE_LIMITED"
  | "TOO_MANY_REQUESTS"
  | "PAYLOAD_TOO_LARGE"
  | "DATABASE_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    status: number,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface PostgrestLikeError {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
}

export function isPostgrestError(err: unknown): err is PostgrestLikeError {
  return (
    typeof err === "object" &&
    err !== null &&
    ("code" in err || "message" in err)
  );
}

export function mapDatabaseError(
  err: unknown,
  fallbackMessage = "A database operation failed."
): AppError {
  if (err instanceof AppError) {
    return err;
  }

  if (isPostgrestError(err)) {
    switch (err.code) {
      case "23505":
        return new AppError("CONFLICT", 409, "A matching record already exists.");
      case "23503":
        return new AppError(
          "VALIDATION_ERROR",
          400,
          "Referenced record does not exist."
        );
      case "23514":
        return new AppError(
          "VALIDATION_ERROR",
          400,
          "Input violates a database integrity constraint."
        );
      case "22P02":
        return new AppError("VALIDATION_ERROR", 400, "Invalid identifier format.");
      case "42501":
        return new AppError(
          "FORBIDDEN",
          403,
          "Permission denied for the requested resource."
        );
      case "42P01":
      case "42703":
      case "PGRST204":
      case "PGRST205":
        return new AppError(
          "SERVICE_UNAVAILABLE",
          503,
          "Database schema migration has not been applied for this operation."
        );
      case "PGRST116":
        return new AppError("NOT_FOUND", 404, "Requested record was not found.");
      default:
        return new AppError("DATABASE_ERROR", 500, fallbackMessage);
    }
  }

  return new AppError("INTERNAL_ERROR", 500, fallbackMessage);
}

export function assertNoDbError<T>(
  result: { data: T | null; error: PostgrestLikeError | null },
  fallbackMessage?: string
): T {
  if (result.error) {
    throw mapDatabaseError(result.error, fallbackMessage);
  }
  if (result.data === null) {
    throw new AppError("NOT_FOUND", 404, "Requested record was not found.");
  }
  return result.data;
}

