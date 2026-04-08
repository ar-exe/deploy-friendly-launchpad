const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearToken() {
  localStorage.removeItem("auth_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ---- Auth ----

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
}

export async function apiSignUp(email: string, password: string, fullName: string) {
  const data = await request<{ token: string; user: AuthUser }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  setToken(data.token);
  return data;
}

export async function apiSignIn(email: string, password: string) {
  const data = await request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function apiGetMe() {
  return request<{ user: AuthUser }>("/api/auth/me");
}

export function apiSignOut() {
  clearToken();
}

export function hasToken() {
  return !!getToken();
}

// ---- Services ----

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  created_at: string;
}

export async function apiGetServices() {
  return request<Service[]>("/api/services");
}

// ---- Bookings ----

export interface BookingWithService {
  id: string;
  booking_date: string;
  booking_time: string;
  notes: string | null;
  status: string;
  services: {
    name: string;
    duration_minutes: number;
    price: number;
  } | null;
}

export async function apiGetBookings() {
  return request<BookingWithService[]>("/api/bookings");
}

export async function apiCreateBooking(data: {
  service_id: string;
  booking_date: string;
  booking_time: string;
  notes?: string | null;
}) {
  return request<{ id: string; status: string }>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiCancelBooking(id: string) {
  return request<{ success: boolean }>(`/api/bookings/${id}/cancel`, { method: "PATCH" });
}
