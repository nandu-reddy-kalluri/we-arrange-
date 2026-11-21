export interface SchemaLike<T> {
  parse(input: unknown): T;
}

export interface ApiErrorDetail {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

export interface ApiEnvelope<T> {
  ok?: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: string | ApiErrorDetail | null;
  message?: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  error: string | null;
  errorCode?: string;
  details?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  status: number;
}

export interface ApiRequestOptions<T = unknown> extends RequestInit {
  baseUrl?: string;
  accessToken?: string | null;
  retryOn401?: boolean;
  schema?: SchemaLike<T>;
  query?: Record<string, string | number | boolean | undefined | null>;
}

type AccessTokenProvider = () => Promise<string | null> | string | null;

let tokenProvider: AccessTokenProvider | null = null;
let inFlightRefresh: Promise<boolean> | null = null;

export function registerAccessTokenProvider(provider: AccessTokenProvider | null) {
  tokenProvider = provider;
}

export function getApiBaseUrl(): string {
  // Always use same-origin /api/... in the browser so portal Next.js rewrites handle proxying without CORS failures.
  if (typeof window !== "undefined") {
    return "";
  }
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return siteUrl ? siteUrl.replace(/\/+$/, "") : "http://localhost:3000";
}

function buildUrl(
  url: string,
  baseUrl?: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const isAbsolute = /^https?:\/\//i.test(url);
  const resolvedBase = (baseUrl ?? getApiBaseUrl()).replace(/\/+$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  let fullUrl = isAbsolute ? url : `${resolvedBase}${path}`;

  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    if (qs) {
      fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
    }
  }

  return fullUrl;
}

function shouldAttemptRefresh(url: string, retryOn401?: boolean): boolean {
  if (retryOn401 === false) return false;
  const authSkipPaths = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/vendor/auth/login",
    "/api/vendor/auth/register",
    "/api/admin/auth/login",
    "/api/admin/auth/logout",
    "/api/concierge/auth/login",
    "/api/concierge/auth/logout",
  ];
  return !authSkipPaths.some((p) => url.includes(p));
}

async function refreshAuthSession(baseUrl?: string): Promise<boolean> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = (async () => {
    try {
      const refreshUrl = buildUrl("/api/auth/refresh", baseUrl);
      const res = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      inFlightRefresh = null;
    }
  })();

  return inFlightRefresh;
}

async function buildHeaders(options: ApiRequestOptions<unknown>): Promise<Headers> {
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("Authorization")) {
    const token =
      options.accessToken !== undefined
        ? options.accessToken
        : tokenProvider
          ? await tokenProvider()
          : null;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return headers;
}

function extractError(
  payload: unknown,
  status: number
): { message: string; code?: string; details?: Record<string, unknown> } {
  if (payload && typeof payload === "object") {
    const obj = payload as ApiEnvelope<unknown>;
    if (obj.error && typeof obj.error === "object") {
      return {
        message:
          obj.error.message || `Request failed with status ${status}`,
        code: obj.error.code,
        details: obj.error.details,
      };
    }
    if (typeof obj.error === "string") {
      return { message: obj.error };
    }
    if (typeof obj.message === "string") {
      return { message: obj.message };
    }
  }
  return { message: `Request failed with status ${status}` };
}

export async function fetchApi<T>(
  url: string,
  options: ApiRequestOptions<T> = {}
): Promise<ApiResponse<T>> {
  const {
    baseUrl,
    accessToken,
    retryOn401,
    schema,
    query,
    ...fetchInit
  } = options;

  const targetUrl = buildUrl(url, baseUrl, query);

  const executeFetch = async (): Promise<Response> => {
    const headers = await buildHeaders({
      ...fetchInit,
      accessToken,
    });
    return fetch(targetUrl, {
      ...fetchInit,
      credentials: fetchInit.credentials ?? "include",
      headers,
    });
  };

  try {
    let res = await executeFetch();

    if (res.status === 401 && shouldAttemptRefresh(url, retryOn401)) {
      const refreshed = await refreshAuthSession(baseUrl);
      if (refreshed) {
        res = await executeFetch();
      }
    }

    const rawBody = (await res.json().catch(() => null)) as
      | ApiEnvelope<T>
      | T
      | null;

    const isEnvelope =
      rawBody !== null &&
      typeof rawBody === "object" &&
      "ok" in (rawBody as Record<string, unknown>);

    if (!res.ok || (isEnvelope && (rawBody as ApiEnvelope<T>).ok === false)) {
      const errInfo = extractError(rawBody, res.status);
      return {
        ok: false,
        data: null,
        error: errInfo.message,
        errorCode: errInfo.code,
        details: errInfo.details,
        status: res.status,
      };
    }

    const unwrappedData = isEnvelope
      ? ((rawBody as ApiEnvelope<T>).data ?? null)
      : (rawBody as T | null);
    const meta = isEnvelope ? (rawBody as ApiEnvelope<T>).meta : undefined;

    if (schema && unwrappedData !== null) {
      try {
        const validated = schema.parse(unwrappedData);
        return {
          ok: true,
          data: validated,
          error: null,
          meta,
          status: res.status,
        };
      } catch (validationErr: unknown) {
        return {
          ok: false,
          data: null,
          error:
            validationErr instanceof Error
              ? validationErr.message
              : "Response validation failed.",
          errorCode: "RESPONSE_VALIDATION_ERROR",
          status: res.status,
        };
      }
    }

    return {
      ok: true,
      data: unwrappedData as T | null,
      error: null,
      meta,
      status: res.status,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      data: null,
      error: err instanceof Error ? err.message : "Network error",
      errorCode: "NETWORK_ERROR",
      status: 500,
    };
  }
}

export const apiClient = {
  request: fetchApi,

  get<T>(url: string, options: Omit<ApiRequestOptions<T>, "method"> = {}) {
    return fetchApi<T>(url, { ...options, method: "GET" });
  },

  post<T>(
    url: string,
    body?: unknown,
    options: Omit<ApiRequestOptions<T>, "method" | "body"> = {}
  ) {
    const serialized =
      body === undefined
        ? undefined
        : typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body);
    return fetchApi<T>(url, { ...options, method: "POST", body: serialized });
  },

  patch<T>(
    url: string,
    body?: unknown,
    options: Omit<ApiRequestOptions<T>, "method" | "body"> = {}
  ) {
    const serialized =
      body === undefined
        ? undefined
        : typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body);
    return fetchApi<T>(url, { ...options, method: "PATCH", body: serialized });
  },

  put<T>(
    url: string,
    body?: unknown,
    options: Omit<ApiRequestOptions<T>, "method" | "body"> = {}
  ) {
    const serialized =
      body === undefined
        ? undefined
        : typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body);
    return fetchApi<T>(url, { ...options, method: "PUT", body: serialized });
  },

  delete<T>(
    url: string,
    body?: unknown,
    options: Omit<ApiRequestOptions<T>, "method" | "body"> = {}
  ) {
    const serialized =
      body === undefined
        ? undefined
        : typeof FormData !== "undefined" && body instanceof FormData
          ? body
          : JSON.stringify(body);
    return fetchApi<T>(url, { ...options, method: "DELETE", body: serialized });
  },

  async logout(isStaffPortal = false, baseUrl?: string) {
    return fetchApi<{ loggedOut?: boolean }>(
      isStaffPortal ? "/api/admin/auth/logout" : "/api/auth/logout",
      {
        method: "POST",
        retryOn401: false,
        baseUrl,
      }
    );
  },
};
