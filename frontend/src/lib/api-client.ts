import type { LoginResponse } from "./api-types";

const API_BASE =
  (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? "http://localhost:3000";

// Access token vive apenas em memória — não persiste entre reloads (por design).
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  if (typeof window !== "undefined") {
    localStorage.setItem("refresh_token", refresh);
  }
}

export function clearTokens(): void {
  accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("refresh_token");
  }
}

// Mutex simples para evitar múltiplos refreshes simultâneos.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Refresh falhou");
  }

  const data = (await res.json()) as LoginResponse;
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export type ApiError = Error & { status?: number; data?: unknown };

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const buildHeaders = (token: string | null): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const execute = async (token: string | null) => {
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: buildHeaders(token),
    });
  };

  let res = await execute(accessToken);

  if (res.status === 401) {
    // Tenta refresh uma vez, usando mutex para requests concorrentes.
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      res = await execute(newToken);
    } catch {
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      const err: ApiError = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    const err: ApiError = new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
    err.status = res.status;
    err.data = body;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
