// client/src/lib/api.ts
type Json = Record<string, unknown> | unknown[];

export class ApiError extends Error {
  status: number;
  data?: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL) ||
  "/api";

// Token automatisch mitsenden, wenn vorhanden
function withAuth(headers: HeadersInit = {}): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: Json } = {}
): Promise<T> {
  const url = path.startsWith("/")
    ? `${API_BASE}${path}`
    : `${API_BASE}/${path}`;

  const headers: HeadersInit = withAuth({
    "Content-Type": "application/json",
    ...(init.headers || {}),
  });

  const body = init.json !== undefined ? JSON.stringify(init.json) : init.body;

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, body });
  } catch (e: any) {
    // Netzwerkfehler o.ä.
    throw new ApiError(e?.message || "Network error", -1);
  }

  // 204 No Content etc.
  if (res.status === 204) return undefined as T;

  // Fehler -> aussagekräftigen ApiError werfen
  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    const msg =
      (payload &&
        typeof payload === "object" &&
        ("error" in payload
          ? (payload as any).error
          : (payload as any).message)) ||
      res.statusText ||
      `Request failed (${res.status})`;

    throw new ApiError(String(msg), res.status, payload);
  }

  // Erfolg -> JSON zurückgeben
  return (await res.json()) as T;
}

// Bequeme Helpers für gängige Methoden
export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, json?: Json, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "POST", json }),
  put: <T>(path: string, json?: Json, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "PUT", json }),
  del: <T>(path: string, init?: RequestInit) =>
    apiFetch<T>(path, { ...init, method: "DELETE" }),
};
