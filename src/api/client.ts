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
    // Implement token refresh (discovered in API audit)
    if (response.status === 401 && endpoint !== "/auth/login" && endpoint !== "/auth/refresh") {
      const refreshToken = localStorage.getItem("ivy_refresh_token");
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_KEY || ''
            },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            localStorage.setItem('ivy_token', refreshData.access_token);
            if (refreshData.refresh_token) {
              localStorage.setItem('ivy_refresh_token', refreshData.refresh_token);
            }
            
            // Retry original request
            headers.set("Authorization", `Bearer ${refreshData.access_token}`);
            const retryRes = await fetch(url, { ...options, headers });
            const retryText = await retryRes.text();
            if (!retryRes.ok) throw new Error("Retry failed");
            try {
              return JSON.parse(retryText) as T;
            } catch {
              return retryText as any;
            }
          }
        } catch (err) {
          // Silent catch, fall through to logout
        }
      }
      
      // If refresh failed or no token, hard logout
      localStorage.removeItem("ivy_token");
      localStorage.removeItem("ivy_refresh_token");
      localStorage.removeItem("ivy_user");
      window.location.href = "/login";
      return null as any;
    }

    // The API guide says "Error bodies are {'detail': '...'}. Read them."
    const detail = typeof body === 'object' && body && 'detail' in body
      ? String(body.detail)
      : text;
    throw new Error(`${response.status}: ${detail}`);
  }

  return body as T;
}
