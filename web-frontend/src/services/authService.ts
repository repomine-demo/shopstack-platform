import { api } from "./apiClient";

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);
  const resp = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/login`, {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) throw new Error("Login failed");
  const data: LoginResponse = await resp.json();
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  return data;
}

export async function register(email: string, password: string, fullName: string, tenantId: string) {
  const data = await api.post<LoginResponse>("/api/auth/register", { email, password, full_name: fullName, tenant_id: tenantId });
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function getToken(): string | null {
  return localStorage.getItem("access_token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
