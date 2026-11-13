export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:3000/api"
).replace(/\/+$/, "");


export const SESSION_REVALIDATION_EVENT = "eventos:session-revalidation";

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
    if (
      (response.status === 401 || response.status === 403) &&
      normalizedPath.split(/[?#]/, 1)[0] !== "usuarios/perfil" &&
      token &&
      headers.get("Authorization") === `Bearer ${token}` &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event(SESSION_REVALIDATION_EVENT));
    }

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
export async function apiRequestPdf(path: string): Promise<Blob> {
  const token = localStorage.getItem("token");
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  const headers = new Headers({ Accept: "application/pdf" });
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${baseUrl}/${normalizedPath}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    let message = `Error HTTP ${response.status}`;
    if (data && typeof data === "object" && "message" in data) {
      const value = data.message;
      if (typeof value === "string") message = value;
      else if (Array.isArray(value)) message = value.map(String).join(", ");
    }
    throw new ApiError(response.status, message);
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/pdf")) {
    throw new Error("El servidor no devolvió un archivo PDF válido.");
  }
  return response.blob();
}
