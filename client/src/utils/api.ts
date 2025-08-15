// client/src/lib/api.ts
type Json = Record<string, unknown> | unknown[];

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
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

  const res = await fetch(url, { ...init, headers, body });

  if (!res.ok) {
    // Versuch, eine aussagekräftige Fehlermeldung zu ziehen
    try {
      const err = await res.json();
      const msg =
        (typeof err === "object" &&
          err &&
          "error" in err &&
          (err as any).error) ||
        (typeof err === "object" &&
          err &&
          "message" in err &&
          (err as any).message) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    } catch {
      throw new Error(`Request failed (${res.status})`);
    }
  }

  // 204 No Content etc.
  if (res.status === 204) return undefined as T;

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
