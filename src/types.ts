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
