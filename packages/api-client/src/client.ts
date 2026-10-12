export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: data?.message || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return {
      data,
      error: null,
      status: res.status,
    };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || "Network error",
      status: 500,
    };
  }
}
