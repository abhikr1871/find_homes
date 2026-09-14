import { apiFetch } from "./client";

export interface LoginResponse {
  // We learned in Phase 4 that the API returns 'access_token', not 'token'
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    email: string;
    name: string;
  };
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutApi(): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}
