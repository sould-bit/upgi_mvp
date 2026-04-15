// Este archivo guarda los tipos para no repetir estructuras en muchos componentes.
export type PaymentStatus = 'Pagado' | 'Abonado' | 'Sin pagar' | 'Libre';

// Datos de las cards que se ven en la pagina principal.
export interface Feature {
  icon: string;
  title: string;
  description: string;
}

// Datos que maneja el formulario de reservas.
export interface ReservationFormData {
  venue: string;
  court: string;
  date: string;
  startTime: string;
  endTime: string;
  players: number;
}

// Resumen que se muestra al lado del formulario.
export interface ReservationSummary {
  availability: string;
  durationLabel: string;
  totalPriceLabel: string;
}

// Credenciales basicas del login.
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
}

export interface ApiUser {
  id: number;
  email: string;
  nombre: string;
  telefono?: string | null;
  is_admin: boolean;
}

export interface AuthResponse {
  status: number;
  message: string;
  access_token?: string | null;
  token_type?: string | null;
  expires_in?: number | null;
  user?: ApiUser | null;
}

export interface AuthSession {
  accessToken: string;
  expiresIn: number;
  user: ApiUser;
}

export interface Court {
  id: number;
  nombre: string;
  tipo: string;
  precio_hora: number;
  capacidad: number;
  is_active: boolean;
}

export interface CourtListResponse {
  status: number;
  canchas: Court[];
}

export interface AvailabilityResponse {
  status: number;
  disponible: boolean;
  cancha: Court;
  horas_duracion?: number | null;
  duracion_label?: string | null;
  precio_total?: number | null;
  mensaje?: string | null;
}

export interface ReservationCreatePayload {
  cancha_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  jugadores: number;
  observaciones?: string;
}

export interface ReservationRecord {
  id: number;
  cancha: Court;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  jugadores: number;
  estado_pago: string;
  precio_total: number;
}

export interface ReservationCreateResponse {
  status: number;
  message: string;
  reserva: ReservationRecord;
}

export interface AdminStats {
  reservas_hoy: number;
  reservas_semana: number;
  reservas_mes: number;
  reservas_totales: number;
  ingresos_hoy: number;
  ingresos_semana: number;
  ingresos_mes: number;
  ingresos_totales: number;
  canchas_activas: number;
  usuarios_totales: number;
}

export interface AdminDashboardResponse {
  status: number;
  stats: AdminStats;
}

export interface WeeklyReservationsResponse {
  status: number;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
  reporte: WeeklyReservationData[];
  total_reservas: number;
}

export interface AdminReservation {
  id: number;
  usuario: {
    id?: number;
    nombre?: string;
    email?: string;
  };
  cancha: {
    id?: number;
    nombre?: string;
    tipo?: string;
  };
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado_pago: string;
  precio_total: number;
  created_at?: string | null;
}

export interface AdminReservationsResponse {
  status: number;
  reservas: AdminReservation[];
  total: number;
  page: number;
  limit: number;
}

// Notificaciones usadas en el panel admin.
export interface NotificationItem {
  id: number;
  title: string;
  detail: string;
  tone: 'success' | 'warning' | 'info';
}

// Estadisticas rapidas del dashboard.
export interface StatData {
  icon: string;
  label: string;
  value: string;
  variation?: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
}

export interface AdminProfile {
  initials: string;
  name: string;
  role: string;
}

// Espacio de una cancha dentro de la tabla de horarios.
export interface CourtSlot {
  court: string;
  player?: string;
  status: PaymentStatus;
}

// Fila completa de una hora con sus 4 canchas.
export interface ScheduleRow {
  time: string;
  slots: CourtSlot[];
}

// Datos simples para el grafico semanal.
export interface WeeklyReservationData {
  label: string;
  total: number;
}
