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

export async function loginApi(password: string): Promise<LoginResponse> {
  // Use demo1@ivy.homes by default for the assignment
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "demo1@ivy.homes",
      password,
    }),
  });
}

export async function logoutApi(): Promise<void> {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
  });
}
