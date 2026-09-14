const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://solve.ivy.homes";
const API_KEY = import.meta.env.VITE_API_KEY;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("ivy_token");
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }

  // We learned in Phase 4 that the Bearer token is strictly required for data endpoints
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let body: any;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    // The API guide says "Error bodies are {'detail': '...'}. Read them."
    const detail = typeof body === 'object' && body && 'detail' in body
      ? String(body.detail)
      : text;
    throw new Error(`${response.status}: ${detail}`);
  }

  return body as T;
}
