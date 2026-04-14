import type {
  AdminDashboardResponse,
  AdminReservationsResponse,
  AuthResponse,
  AvailabilityResponse,
  CourtListResponse,
  LoginCredentials,
  ReservationCreatePayload,
  ReservationCreateResponse,
  WeeklyReservationsResponse
} from '../types';
import { getStoredSession } from './session';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getStoredSession();
  const headers = new Headers(init?.headers);

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });

  const data = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

  if (!response.ok) {
    const message = data?.error ?? data?.message ?? 'No fue posible completar la solicitud.';
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export function loginRequest(credentials: LoginCredentials) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function fetchCourts() {
  return apiRequest<CourtListResponse>('/canchas');
}

export function fetchAvailability(canchaId: number, params: URLSearchParams) {
  return apiRequest<AvailabilityResponse>(`/canchas/${canchaId}/disponibilidad?${params.toString()}`);
}

export function createReservation(payload: ReservationCreatePayload) {
  return apiRequest<ReservationCreateResponse>('/reservas', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchAdminDashboard() {
  return apiRequest<AdminDashboardResponse>('/admin/dashboard');
}

export function fetchWeeklyReservations(params: URLSearchParams) {
  return apiRequest<WeeklyReservationsResponse>(`/admin/reportes/reservas-semana?${params.toString()}`);
}

export function fetchAdminReservations(params: URLSearchParams) {
  return apiRequest<AdminReservationsResponse>(`/admin/reservas?${params.toString()}`);
}

export { ApiError, API_BASE_URL };
