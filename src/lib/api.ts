import type {
  AdminDashboardResponse,
  AdminReservationsResponse,
  AuthResponse,
  AvailabilityResponse,
  ClientesFrecuentesResponse,
  CourtCreatePayload,
  CourtCreateResponse,
  CourtDeleteResponse,
  CourtListResponse,
  DailyResponse,
  EquipoCreatePayload,
  EquipoCreateResponse,
  EquipoDeleteResponse,
  EquipoListResponse,
  EquipoUpdatePayload,
  EquipoUpdateResponse,
  HorariosPicoResponse,
  InventarioSummaryResponse,
  LoginCredentials,
  OcupacionResponse,
  RegisterPayload,
  ReservationCreatePayload,
  ReservationCreatePublicPayload,
  ReservationCreateResponse,
  ReservationCancelResponse,
  ReservationPaymentUpdatePayload,
  ReservationPaymentUpdateResponse,
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

export function registerRequest(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchCourts() {
  return apiRequest<CourtListResponse>('/canchas');
}

export function createCourt(payload: CourtCreatePayload) {
  return apiRequest<CourtCreateResponse>('/canchas', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function deleteCourt(canchaId: number) {
  return apiRequest<CourtDeleteResponse>(`/canchas/${canchaId}`, {
    method: 'DELETE'
  });
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

export function createPublicReservation(payload: ReservationCreatePublicPayload) {
  return apiRequest<ReservationCreateResponse>('/reservas/public', {
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

export function fetchOcupacion(params: URLSearchParams): Promise<OcupacionResponse> {
  return apiRequest<OcupacionResponse>(`/admin/reportes/ocupacion?${params.toString()}`);
}

export function fetchHorariosPico(params: URLSearchParams): Promise<HorariosPicoResponse> {
  return apiRequest<HorariosPicoResponse>(`/admin/reportes/horarios-pico?${params.toString()}`);
}

export function fetchClientesFrecuentes(params: URLSearchParams): Promise<ClientesFrecuentesResponse> {
  return apiRequest<ClientesFrecuentesResponse>(`/admin/reportes/clientes-frecuentes?${params.toString()}`);
}

export function fetchDaily(params: URLSearchParams): Promise<DailyResponse> {
  return apiRequest<DailyResponse>(`/admin/reportes/daily?${params.toString()}`);
}

export async function downloadReporteExcel(params: URLSearchParams): Promise<void> {
  const session = getStoredSession();
  const response = await fetch(`${API_BASE_URL}/admin/reportes/export/excel?${params.toString()}`, {
    headers: session?.accessToken
      ? {
          Authorization: `Bearer ${session.accessToken}`
        }
      : undefined
  });

  if (!response.ok) {
    let message = 'No fue posible exportar el reporte.';

    try {
      const data = (await response.json()) as { error?: string; message?: string };
      message = data.error ?? data.message ?? message;
    } catch {
      // No-op: fallback al mensaje por defecto.
    }

    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reportes_${params.get('fecha_desde')}_${params.get('fecha_hasta')}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

export function fetchAdminReservations(params: URLSearchParams) {
  return apiRequest<AdminReservationsResponse>(`/admin/reservas?${params.toString()}`);
}

export function updateReservationPaymentStatus(reservaId: number, payload: ReservationPaymentUpdatePayload) {
  return apiRequest<ReservationPaymentUpdateResponse>(`/reservas/${reservaId}/pago`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function cancelReservation(reservaId: number) {
  return apiRequest<ReservationCancelResponse>(`/reservas/${reservaId}`, {
    method: 'DELETE'
  });
}

export function fetchEquipos(): Promise<EquipoListResponse> {
  return apiRequest<EquipoListResponse>('/admin/equipos');
}

export function createEquipo(payload: EquipoCreatePayload): Promise<EquipoCreateResponse> {
  return apiRequest<EquipoCreateResponse>('/admin/equipos', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateEquipo(id: number, payload: EquipoUpdatePayload): Promise<EquipoUpdateResponse> {
  return apiRequest<EquipoUpdateResponse>(`/admin/equipos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function deleteEquipo(id: number): Promise<EquipoDeleteResponse> {
  return apiRequest<EquipoDeleteResponse>(`/admin/equipos/${id}`, {
    method: 'DELETE'
  });
}

export function fetchInventarioSummary(): Promise<InventarioSummaryResponse> {
  return apiRequest<InventarioSummaryResponse>('/admin/inventario');
}

export { ApiError, API_BASE_URL };
