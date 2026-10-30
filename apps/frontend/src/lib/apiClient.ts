const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  const response = await fetch(
    `${baseUrl}/${normalizedPath}`,
    {
      ...options,
      headers,
    },
  );

  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;

    if (data && typeof data === "object" && "message" in data) {
      const value = data.message;

      if (typeof value === "string") {
        message = value;
      } else if (Array.isArray(value)) {
        message = value.map(String).join(", ");
      }
    }

    throw new ApiError(response.status, message);
  }

  return data as T;
}