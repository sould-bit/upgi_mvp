// Este archivo guarda los tipos para no repetir estructuras en muchos componentes.
export type PaymentStatus = 'Pagado' | 'Abonado' | 'Sin pagar' | 'Libre';
export type EditablePaymentStatus = Exclude<PaymentStatus, 'Libre'>;

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
  // Campos del cliente — solo necesarios para reserva publica sin auth.
  nombre: string;
  email: string;
  telefono: string;
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

export interface CourtCreatePayload {
  nombre: string;
  tipo: string;
  precio_hora: number;
  capacidad: number;
}

export interface CourtCreateResponse {
  status: number;
  message: string;
  cancha: Court;
}

export interface CourtDeleteResponse {
  status: number;
  message: string;
  cancha: Court;
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

export interface ReservationCreatePublicPayload {
  cancha_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  jugadores: number;
  nombre: string;
  email: string;
  telefono?: string;
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

export interface ReservationPaymentUpdatePayload {
  estado_pago: EditablePaymentStatus;
}

export interface ReservationPaymentUpdateResponse {
  status: number;
  message: string;
  reserva: {
    id: number;
    estado_pago: string;
  };
}

export interface ReservationCancelResponse {
  status: number;
  message: string;
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
    telefono?: string | null;
    is_socio?: boolean;
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
  observaciones?: string | null;
  alquileres?: ReservaAlquilerEquipo[];
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
  reservationId?: number;
  court: string;
  player?: string;
  status: PaymentStatus;
  timeRangeLabel?: string;
  isRangeStart?: boolean;
  // Tiempo del bloque padre (para acciones rápidas).
  time?: string;
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

export interface OcupacionItem {
  cancha_id: number;
  cancha_nombre: string;
  horas_reservadas: number;
  horas_disponibles: number;
  ocupacion_pct: number;
}

export interface OcupacionResponse {
  status: number;
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  ocupacion: OcupacionItem[];
}

export interface HorarioPicoItem {
  hora: string;
  cantidad: number;
}

export interface HorariosPicoResponse {
  status: number;
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  horarios: HorarioPicoItem[];
}

export interface ClienteFrecuenteItem {
  cliente_nombre: string;
  total_reservas: number;
  total_gastado: number;
}

export interface ClientesFrecuentesResponse {
  status: number;
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  clientes: ClienteFrecuenteItem[];
}

export interface DailyItem {
  fecha: string;
  reservas_count: number;
  ingreso_total: number;
}

export interface DailyResponse {
  status: number;
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  daily: DailyItem[];
}

export interface ReporteFiltros {
  fechaDesde: string;
  fechaHasta: string;
  canchaId: number | null;
}

export type EquipoCategoria = 'Raquetas' | 'Pelotas' | 'Accesorios' | 'Iluminacion' | 'Redes';

export interface Equipo {
  id: number;
  nombre: string;
  categoria: EquipoCategoria;
  precio_alquiler: number;
  stock_total: number;
  is_active: boolean;
  maintenance_status: 'Disponible' | 'Mantenimiento';
  maintenance_notes?: string | null;
}

export type EquipoCreatePayload = Omit<Equipo, 'id' | 'is_active'>;
export type EquipoUpdatePayload = Partial<Omit<Equipo, 'id' | 'is_active'>>;

export interface EquipoListResponse {
  status: number;
  equipos: Equipo[];
}

export interface EquipoCreateResponse {
  status: number;
  message: string;
  equipo: Equipo;
}

export interface EquipoUpdateResponse {
  status: number;
  message: string;
  equipo: Equipo;
}

export interface EquipoDeleteResponse {
  status: number;
  message: string;
  equipo: Equipo;
}

export interface InventarioSummaryResponse {
  status: number;
  total_equipos: number;
  stock_total: number;
  valor_inventario: number;
  equipos_bajo_stock: number;
  alquileres_activos: number;
}

export interface ReservaAlquilerEquipo {
  id: number;
  equipo_id: number;
  equipo_nombre: string;
  categoria: string;
  cantidad: number;
  precio_alquiler: number;
  subtotal: number;
}

export interface ReservaAlquileresUpdatePayload {
  items: {
    equipo_id: number;
    cantidad: number;
  }[];
}

export interface ReservaAlquileresResponse {
  status: number;
  message: string;
  reserva_id: number;
  alquileres: ReservaAlquilerEquipo[];
  total_alquileres: number;
  precio_total_reserva: number;
}

export interface InventarioAlquiladoItem {
  equipo_id: number;
  equipo_nombre: string;
  categoria: string;
  cantidad_total: number;
  ingreso_total: number;
}

export interface InventarioAlquiladoResponse {
  status: number;
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  inventario_alquilado: InventarioAlquiladoItem[];
}

export interface BusinessSettings {
  sedeNombre: string;
  horaApertura: string;
  horaCierre: string;
  duracionMinima: number;
  moneda: string;
}

export interface Comunicacion {
  id: number;
  reserva_id: number;
  autor_usuario_id: number;
  autor_nombre: string;
  contenido: string;
  tipo: 'SYSTEM' | 'NOTE';
  created_at?: string | null;
}

export interface ComunicacionListResponse {
  status: number;
  comunicaciones: Comunicacion[];
}

export interface ComunicacionCreateResponse {
  status: number;
  message: string;
  comunicacion: Comunicacion;
}

export interface ReglaPrecio {
  id: number;
  nombre: string;
  tipo: 'horario_pico' | 'descuento_socio' | 'promo';
  valor: number;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  es_socio: boolean;
  is_active: boolean;
}

export interface ReglaPrecioCreatePayload {
  nombre: string;
  tipo: string;
  valor: number;
  hora_inicio?: string | null;
  hora_fin?: string | null;
  es_socio: boolean;
}

export interface ReglaPrecioListResponse {
  status: number;
  reglas: ReglaPrecio[];
}

export interface ReglaPrecioCreateResponse {
  status: number;
  message: string;
  regla: ReglaPrecio;
}

export interface PrecioPreviewResponse {
  status: number;
  precio_base: number;
  descuento: number;
  precio_final: number;
  desglose: { regla: string; tipo: string; descuento: number }[];
}

export interface ListaEsperaEntry {
  id: number;
  cancha_id: number;
  cliente_nombre: string;
  cliente_email?: string | null;
  cliente_telefono?: string | null;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  posicion: number;
  estado: 'ESPERANDO' | 'PROMOVIDA' | 'CANCELADA';
  created_at?: string | null;
}

export interface ListaEsperaListResponse {
  status: number;
  entradas: ListaEsperaEntry[];
}

export interface ListaEsperaCreateResponse {
  status: number;
  message: string;
  entrada: ListaEsperaEntry;
}

export interface ListaEsperaPromoteResponse {
  status: number;
  message: string;
  reserva_id?: number | null;
}
