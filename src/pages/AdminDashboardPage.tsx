import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  cancelReservation,
  createCourt,
  createPublicReservation,
  deleteCourt,
  fetchAdminDashboard,
  fetchAdminReservations,
  fetchAvailability,
  fetchCourts,
  fetchWeeklyReservations,
  updateReservationPaymentStatus
} from '../lib/api';
import { getStoredSession } from '../lib/session';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardWelcomeAlert from '../components/admin/DashboardWelcomeAlert';
import HorariosCanchasSection from '../components/admin/HorariosCanchasSection';
import InventarioSection from '../components/admin/InventarioSection';
import ReportesAvanzadosSection from '../components/admin/reportes/ReportesAvanzadosSection';
import ReservasPorSemanaSection from '../components/admin/ReservasPorSemanaSection';
import ReservaFormSection from '../components/reservas/ReservaFormSection';
import StatsSection from '../components/admin/StatsSection';
import type {
  AdminDashboardResponse,
  AdminReservation,
  AdminProfile,
  AdminReservationsResponse,
  Court,
  EditablePaymentStatus,
  NotificationItem,
  PaymentStatus,
  ReservationFormData,
  ReservationSummary,
  ScheduleRow,
  StatData,
  WeeklyReservationData,
  WeeklyReservationsResponse
} from '../types';

interface CourtFormState {
  nombre: string;
  tipo: string;
  precio_hora: string;
  capacidad: string;
}

const defaultWeeklyData: WeeklyReservationData[] = [
  { label: 'Lun', total: 0 },
  { label: 'Mar', total: 0 },
  { label: 'Mie', total: 0 },
  { label: 'Jue', total: 0 },
  { label: 'Vie', total: 0 },
  { label: 'Sab', total: 0 },
  { label: 'Dom', total: 0 }
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(today);
  start.setDate(today.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    fecha_inicio: start.toISOString().slice(0, 10),
    fecha_fin: end.toISOString().slice(0, 10)
  };
}

function getMonthRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  return {
    fecha_inicio: start.toISOString().slice(0, 10),
    fecha_fin: end.toISOString().slice(0, 10)
  };
}

function buildStats(response: AdminDashboardResponse | null): StatData[] {
  if (!response) {
    return [];
  }

  return [
    {
      icon: 'calendar-check',
      label: 'Reservas hoy',
      value: String(response.stats.reservas_hoy),
      variation: `${response.stats.reservas_semana} semana`,
      tone: 'primary'
    },
    {
      icon: 'cash-stack',
      label: 'Ingresos hoy',
      value: formatCurrency(response.stats.ingresos_hoy),
      variation: formatCurrency(response.stats.ingresos_semana),
      tone: 'success'
    },
    {
      icon: 'geo-alt',
      label: 'Canchas activas',
      value: String(response.stats.canchas_activas),
      variation: `${response.stats.usuarios_totales} usuarios`,
      tone: 'warning'
    },
    {
      icon: 'bar-chart',
      label: 'Reservas totales',
      value: String(response.stats.reservas_totales),
      variation: formatCurrency(response.stats.ingresos_totales),
      tone: 'danger'
    }
  ];
}

function buildNotifications(response: AdminReservationsResponse | null): NotificationItem[] {
  if (!response) {
    return [];
  }

  return response.reservas.slice(0, 3).map((reservation) => ({
    id: reservation.id,
    title: reservation.usuario.nombre ?? 'Reserva reciente',
    detail: `${reservation.cancha.nombre ?? 'Cancha'} - ${reservation.hora_inicio}`,
    tone:
      reservation.estado_pago === 'Pagado'
        ? 'success'
        : reservation.estado_pago === 'Sin pagar'
          ? 'warning'
          : 'info'
  }));
}

function normalizePaymentStatus(status: string): PaymentStatus {
  if (status === 'Pagado' || status === 'Abonado' || status === 'Sin pagar') {
    return status;
  }

  return 'Sin pagar';
}

function toMinutes(time: string): number {
  const [hours = '0', minutes = '0'] = time.slice(0, 5).split(':');
  return Number(hours) * 60 + Number(minutes);
}

function toTimeLabel(totalMinutes: number): string {
  const safeMinutes = Math.max(0, totalMinutes);
  const hours = Math.floor(safeMinutes / 60) % 24;
  const minutes = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function buildReservationTimeKeys(reservation: AdminReservation): string[] {
  const startMinutes = toMinutes(reservation.hora_inicio);
  const endMinutes = toMinutes(reservation.hora_fin);

  if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || endMinutes <= startMinutes) {
    return [reservation.hora_inicio.slice(0, 5)];
  }

  const timeKeys: string[] = [];

  for (let current = startMinutes; current < endMinutes; current += 60) {
    timeKeys.push(toTimeLabel(current));
  }

  return timeKeys.length ? timeKeys : [reservation.hora_inicio.slice(0, 5)];
}

function buildScheduleRows(reservations: AdminReservation[], courts: Court[], selectedDate: string): ScheduleRow[] {
  // Filtrar solo las reservas del día seleccionado.
  const dayReservations = reservations.filter((r) => r.fecha === selectedDate);

  if (dayReservations.length === 0) {
    // igual renderizar las filas de horas con todas las canchas libres.
    const orderedCourtNames = courts.filter((court) => court.is_active).map((court) => court.nombre);
    if (orderedCourtNames.length === 0) {
      return [];
    }
    const timeKeys = [
      '08:00','09:00','10:00','11:00','12:00','13:00',
      '14:00','15:00','16:00','17:00','18:00','19:00',
      '20:00','21:00','22:00','23:00'
    ];
    return timeKeys.map((time) => ({
      time,
      slots: orderedCourtNames.map(
        (name): ScheduleRow['slots'][number] => ({ court: name, status: 'Libre' as PaymentStatus, time })
      )
    }));
  }

  const orderedCourtNames = Array.from(
    new Set([
      ...courts.filter((court) => court.is_active).map((court) => court.nombre),
      ...dayReservations.map((reservation) => reservation.cancha.nombre ?? 'Cancha')
    ])
  );

  if (orderedCourtNames.length === 0) {
    return [];
  }

  const groupedRows = new Map<string, ScheduleRow>();

  dayReservations.forEach((reservation) => {
    const timeKeys = buildReservationTimeKeys(reservation);
    const courtName = reservation.cancha.nombre ?? 'Cancha';
    const slotIndex = orderedCourtNames.findIndex((name) => name === courtName);

    if (slotIndex === -1) {
      return;
    }

    timeKeys.forEach((timeKey, timeIndex) => {
      const currentRow =
        groupedRows.get(timeKey) ?? {
          time: timeKey,
          slots: orderedCourtNames.map(
            (name): ScheduleRow['slots'][number] => ({ court: name, status: 'Libre' as PaymentStatus, time: timeKey })
          )
        };

      currentRow.slots[slotIndex] = {
        reservationId: reservation.id,
        court: orderedCourtNames[slotIndex],
        player: reservation.usuario.nombre ?? reservation.usuario.email ?? `Reserva #${reservation.id}`,
        status: normalizePaymentStatus(reservation.estado_pago),
        isRangeStart: timeIndex === 0,
        timeRangeLabel: `${reservation.hora_inicio.slice(0, 5)} - ${reservation.hora_fin.slice(0, 5)}`,
        time: timeKey
      };

      groupedRows.set(timeKey, currentRow);
    });
  });

  return Array.from(groupedRows.values()).sort((a, b) => a.time.localeCompare(b.time));
}

function AdminDashboardPage() {
  const session = getStoredSession();
  const { section = 'dashboard' } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null);
  const [weeklyReservations, setWeeklyReservations] = useState<WeeklyReservationsResponse | null>(null);
  const [adminReservations, setAdminReservations] = useState<AdminReservationsResponse | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingCourt, setIsSubmittingCourt] = useState(false);
  const [deletingCourtId, setDeletingCourtId] = useState<number | null>(null);
  const [courtForm, setCourtForm] = useState<CourtFormState>({
    nombre: '',
    tipo: '',
    precio_hora: '',
    capacidad: ''
  });
  const [courtMessage, setCourtMessage] = useState<string | null>(null);
  const [courtMessageTone, setCourtMessageTone] = useState<'success' | 'danger'>('success');
  const [updatingPaymentByReservationId, setUpdatingPaymentByReservationId] = useState<Record<number, boolean>>({});
  const [cancellingReservationById, setCancellingReservationById] = useState<Record<number, boolean>>({});
  const [errorMessage, setErrorMessage] = useState('');

  // Estado para el formulario de reservas del admin.
  const reservationFormDefaults: ReservationFormData = {
    venue: 'Complejo UPGI',
    court: '',
    date: '',
    startTime: '08:00',
    endTime: '09:00',
    players: 4,
    nombre: '',
    email: '',
    telefono: ''
  };
  const [reservaForm, setReservaForm] = useState<ReservationFormData>(reservationFormDefaults);
  const [reservaNotice, setReservaNotice] = useState<string | null>(null);
  const [reservaNoticeTone, setReservaNoticeTone] = useState<'success' | 'danger' | 'info'>('info');
  const [reservaIsSubmitting, setReservaIsSubmitting] = useState(false);
  const [reservaAvailability, setReservaAvailability] = useState<string>('Elegí cancha, fecha y horario.');
  const [reservaIsAvailable, setReservaIsAvailable] = useState(false);
  // Fecha seleccionada para la grilla de horarios — sincronizada con el date picker.
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);

  const venueOptions = ['Complejo UPGI'];
  const timeOptions = [
    '08:00','09:00','10:00','11:00','12:00','13:00',
    '14:00','15:00','16:00','17:00','18:00','19:00',
    '20:00','21:00','22:00','23:00'
  ];

  useEffect(() => {
    let isMounted = true;

    const loadAdminData = async () => {
      if (!session?.accessToken || !session.user.is_admin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const weekRange = getWeekRange();
        const monthRange = getMonthRange();
        const reservationsParams = new URLSearchParams({
          limit: '100'
        });
        const weeklyParams = new URLSearchParams(weekRange);

        const [dashboardResponse, weeklyResponse, reservationsResponse, courtsResponse] = await Promise.all([
          fetchAdminDashboard(),
          fetchWeeklyReservations(weeklyParams),
          fetchAdminReservations(reservationsParams),
          fetchCourts()
        ]);

        if (!isMounted) {
          return;
        }

        setDashboard(dashboardResponse);
        setWeeklyReservations(weeklyResponse);
        setAdminReservations(reservationsResponse);
        setCourts(courtsResponse.canchas);
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'No fue posible cargar el panel admin.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [session?.accessToken, session?.user.is_admin]);

  const adminStats = useMemo(() => buildStats(dashboard), [dashboard]);
  const adminNotifications = useMemo(() => buildNotifications(adminReservations), [adminReservations]);
  const paidReservations = useMemo(
    () => adminReservations?.reservas.filter((reservation) => normalizePaymentStatus(reservation.estado_pago) === 'Pagado') ?? [],
    [adminReservations]
  );
  const operationalReservations = useMemo(
    () =>
      adminReservations?.reservas.filter((reservation) => normalizePaymentStatus(reservation.estado_pago) !== 'Pagado') ?? [],
    [adminReservations]
  );
  const scheduleRows = useMemo(
    () => buildScheduleRows(operationalReservations, courts, selectedDate),
    [operationalReservations, courts, selectedDate]
  );
  const filteredCourts = useMemo(() => {
    if (!searchTerm) {
      return courts;
    }

    return courts.filter((court) =>
      [court.nombre, court.tipo, String(court.capacidad), String(court.precio_hora)].join(' ').toLowerCase().includes(searchTerm)
    );
  }, [courts, searchTerm]);
  const profile: AdminProfile = useMemo(() => {
    const fullName = session?.user.nombre ?? 'Admin UPGI';
    const initials = fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');

    return {
      initials: initials || 'AU',
      name: fullName,
      role: session?.user.is_admin ? 'Administrador' : 'Usuario'
    };
  }, [session?.user.is_admin, session?.user.nombre]);

  const weeklyData = weeklyReservations?.reporte?.length ? weeklyReservations.reporte : defaultWeeklyData;
  const estimatedIncome = dashboard ? formatCurrency(dashboard.stats.ingresos_semana) : formatCurrency(0);

  // ---- Handlers del formulario de reservas del admin. ----
  const selectedCourt = useMemo(
    () => courts.find((court) => court.nombre === reservaForm.court) ?? null,
    [courts, reservaForm.court]
  );

  const courtOptions = useMemo(() => courts.map((court) => court.nombre), [courts]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedCourt || !reservaForm.date || !reservaForm.startTime || !reservaForm.endTime) {
        setReservaIsAvailable(false);
        setReservaAvailability('Elegí cancha, fecha y horario.');
        return;
      }

      const startIdx = timeOptions.indexOf(reservaForm.endTime);
      const endIdx = timeOptions.indexOf(reservaForm.startTime);
      if (startIdx <= endIdx) {
        setReservaIsAvailable(false);
        setReservaAvailability('La hora final debe ser mayor a la inicial.');
        return;
      }

      try {
        const params = new URLSearchParams({
          fecha: reservaForm.date,
          hora_inicio: `${reservaForm.startTime}:00`,
          hora_fin: `${reservaForm.endTime}:00`
        });
        const response = await fetchAvailability(selectedCourt.id, params);
        setReservaIsAvailable(response.disponible);
        setReservaAvailability(response.mensaje ?? (response.disponible ? 'Disponible' : 'No disponible'));
      } catch {
        setReservaIsAvailable(false);
        setReservaAvailability('Error al consultar disponibilidad.');
      }
    };

    void checkAvailability();
  }, [reservaForm.date, reservaForm.endTime, reservaForm.startTime, selectedCourt]);

  const handleReservaFieldChange = <K extends keyof ReservationFormData>(
    field: K,
    value: ReservationFormData[K]
  ) => {
    setReservaForm((prev) => ({ ...prev, [field]: value }));
    setReservaNotice(null);
  };

  const handleReservaSubmit = async () => {
    if (!selectedCourt || !reservaForm.date || !reservaIsAvailable) {
      setReservaNoticeTone('danger');
      setReservaNotice('Completá todos los campos y verificá disponibilidad antes de crear la reserva.');
      return;
    }

    if (!reservaForm.nombre.trim() || !reservaForm.email.trim()) {
      setReservaNoticeTone('danger');
      setReservaNotice('Completá el nombre y correo del cliente.');
      return;
    }

    setReservaIsSubmitting(true);
    setReservaNotice(null);

    try {
      await createPublicReservation({
        cancha_id: selectedCourt.id,
        fecha: reservaForm.date,
        hora_inicio: `${reservaForm.startTime}:00`,
        hora_fin: `${reservaForm.endTime}:00`,
        jugadores: reservaForm.players,
        nombre: reservaForm.nombre.trim(),
        email: reservaForm.email.trim(),
        telefono: reservaForm.telefono.trim() || undefined
      });

      setReservaNoticeTone('success');
      setReservaNotice(`Reserva creada para ${reservaForm.nombre}. Ahora aparece en la grilla.`);
      setReservaForm(reservationFormDefaults);
      setReservaIsAvailable(false);

      // Recargar reservas para que aparezcan en la grilla.
      try {
        const params = new URLSearchParams({ limit: '100' });
        const response = await fetchAdminReservations(params);
        setAdminReservations(response);
      } catch {
        // No criticalo; la reserva ya se creo.
      }
    } catch (error) {
      setReservaNoticeTone('danger');
      setReservaNotice(error instanceof Error ? error.message : 'No fue posible crear la reserva.');
    } finally {
      setReservaIsSubmitting(false);
    }
  };

  const handleReservaReset = () => {
    setReservaForm(reservationFormDefaults);
    setReservaNotice(null);
    setReservaIsAvailable(false);
    setReservaAvailability('Elegí cancha, fecha y horario.');
  };

  // Quick reserve desde la grilla: pre-llena el formulario.
  const handleQuickReserve = (courtName: string, time: string) => {
    setReservaForm((prev) => ({
      ...prev,
      court: courtName,
      date: selectedDate,
      startTime: time,
      // Calcular endTime como +1 hora.
      endTime: (() => {
        const idx = timeOptions.indexOf(time);
        return idx >= 0 && idx < timeOptions.length - 1 ? timeOptions[idx + 1] : time;
      })()
    }));
    // Scroll al formulario (si existe).
    const formEl = document.querySelector('.court-management-section, .admin-shell .panel-card form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ---- Handlers de canchas. ----
  const handleCourtFieldChange = (field: keyof CourtFormState, value: string) => {
    setCourtForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCourt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      nombre: courtForm.nombre.trim(),
      tipo: courtForm.tipo.trim(),
      precio_hora: Number(courtForm.precio_hora),
      capacidad: Number(courtForm.capacidad)
    };

    if (!payload.nombre || !payload.tipo || Number.isNaN(payload.precio_hora) || Number.isNaN(payload.capacidad)) {
      setCourtMessageTone('danger');
      setCourtMessage('Completá nombre, tipo, precio y capacidad para crear la cancha.');
      return;
    }

    if (payload.precio_hora <= 0 || payload.capacidad <= 0) {
      setCourtMessageTone('danger');
      setCourtMessage('Precio por hora y capacidad deben ser mayores a 0.');
      return;
    }

    setIsSubmittingCourt(true);
    setCourtMessage(null);

    try {
      const response = await createCourt(payload);
      setCourts((prev) => [response.cancha, ...prev]);
      setCourtForm({ nombre: '', tipo: '', precio_hora: '', capacidad: '' });
      setCourtMessageTone('success');
      setCourtMessage(response.message);
    } catch (error) {
      setCourtMessageTone('danger');
      setCourtMessage(error instanceof Error ? error.message : 'No fue posible crear la cancha.');
    } finally {
      setIsSubmittingCourt(false);
    }
  };

  const handleDeleteCourt = async (court: Court) => {
    const shouldDelete = window.confirm(`Vas a eliminar ${court.nombre}. Esta accion desactiva la cancha. ¿Continuar?`);

    if (!shouldDelete) {
      return;
    }

    setDeletingCourtId(court.id);
    setCourtMessage(null);

    try {
      const response = await deleteCourt(court.id);
      setCourts((prev) => prev.filter((item) => item.id !== court.id));
      setCourtMessageTone('success');
      setCourtMessage(response.message);
    } catch (error) {
      setCourtMessageTone('danger');
      setCourtMessage(error instanceof Error ? error.message : 'No fue posible eliminar la cancha.');
    } finally {
      setDeletingCourtId(null);
    }
  };

  const isUpdatingPayment = (reservationId?: number) => {
    if (!reservationId) {
      return false;
    }

    return Boolean(updatingPaymentByReservationId[reservationId]);
  };

  const isCancellingReservation = (reservationId?: number) => {
    if (!reservationId) {
      return false;
    }

    return Boolean(cancellingReservationById[reservationId]);
  };

  const handleStatusChange = async (reservationId: number, status: EditablePaymentStatus) => {
    const previousReservations = adminReservations;

    setErrorMessage('');
    setUpdatingPaymentByReservationId((prev) => ({
      ...prev,
      [reservationId]: true
    }));
    setAdminReservations((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        reservas: prev.reservas.map((reservation) =>
          reservation.id === reservationId ? { ...reservation, estado_pago: status } : reservation
        )
      };
    });

    try {
      const response = await updateReservationPaymentStatus(reservationId, { estado_pago: status });
      const normalizedStatus = normalizePaymentStatus(response.reserva.estado_pago);

      setAdminReservations((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          reservas: prev.reservas.map((reservation) =>
            reservation.id === reservationId ? { ...reservation, estado_pago: normalizedStatus } : reservation
          )
        };
      });
    } catch (error) {
      setAdminReservations(previousReservations);
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible actualizar el estado de pago.');
    } finally {
      setUpdatingPaymentByReservationId((prev) => {
        const next = { ...prev };
        delete next[reservationId];
        return next;
      });
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    const reservation = adminReservations?.reservas.find((item) => item.id === reservationId);

    if (!reservation) {
      return;
    }

    if (reservation.estado_pago === 'Pagado') {
      setErrorMessage('No se puede cancelar una reserva pagada.');
      return;
    }

    const shouldCancel = window.confirm(
      `Vas a cancelar la reserva de ${reservation.usuario.nombre ?? `Reserva #${reservation.id}`} en ${reservation.cancha.nombre ?? 'Cancha'}.`
    );

    if (!shouldCancel) {
      return;
    }

    const previousReservations = adminReservations;

    setErrorMessage('');
    setCancellingReservationById((prev) => ({
      ...prev,
      [reservationId]: true
    }));
    setAdminReservations((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        reservas: prev.reservas.filter((item) => item.id !== reservationId),
        total: Math.max(0, prev.total - 1)
      };
    });

    try {
      await cancelReservation(reservationId);
    } catch (error) {
      setAdminReservations(previousReservations);
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible cancelar la reserva.');
    } finally {
      setCancellingReservationById((prev) => {
        const next = { ...prev };
        delete next[reservationId];
        return next;
      });
    }
  };

  const renderSection = () => {
    if (section === 'dashboard') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Gestiona tu centro deportivo desde una arquitectura pensada por componentes."
            title="Panel principal"
          />
          <StatsSection stats={adminStats} />

          {/* Formulario de reservas rapido — accesible desde el dashboard. */}
          <section className="panel-card mb-4">
            <div className="section-heading">
              <span className="eyebrow">Admin — Alta de reserva</span>
              <h2>Nueva reserva para cliente</h2>
              <p>El cliente no necesita cuenta. Ingresá sus datos y elegí horario.</p>
            </div>
            <ReservaFormSection
              courtOptions={courtOptions}
              formData={reservaForm}
              onFieldChange={handleReservaFieldChange}
              onReset={handleReservaReset}
              onSubmit={handleReservaSubmit}
              timeOptions={timeOptions}
              venueOptions={venueOptions}
            />
            {reservaNotice ? (
              <div className={`alert alert-${reservaNoticeTone} mt-3 mb-0`}>{reservaNotice}</div>
            ) : null}
          </section>

          <HorariosCanchasSection
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            isCancellingReservation={isCancellingReservation}
            isUpdatingPayment={isUpdatingPayment}
            onCancelReservation={handleCancelReservation}
            onQuickReserve={handleQuickReserve}
            onStatusChange={handleStatusChange}
            paidReservations={paidReservations}
            rows={scheduleRows}
            searchTerm={searchTerm}
          />
          <ReservasPorSemanaSection data={weeklyData} estimatedIncome={estimatedIncome} />
        </>
      );
    }

    if (section === 'reservas') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Creá reservas para clientes, gestioná estados de pago y validá ocupacion."
            title="Modulo de reservas"
          />

          {/* Formulario de alta de reservas para clientes — mismo flujo que el consumer. */}
          <section className="panel-card mb-4">
            <div className="section-heading">
              <span className="eyebrow">Admin — Alta de reserva</span>
              <h2>Registrar reserva para un cliente</h2>
              <p>El cliente no necesita cuenta. Completá sus datos y elegí horario.</p>
            </div>
            <ReservaFormSection
              courtOptions={courtOptions}
              formData={reservaForm}
              onFieldChange={handleReservaFieldChange}
              onReset={handleReservaReset}
              onSubmit={handleReservaSubmit}
              timeOptions={timeOptions}
              venueOptions={venueOptions}
            />
            {reservaNotice ? (
              <div className={`alert alert-${reservaNoticeTone} mt-3 mb-0`}>{reservaNotice}</div>
            ) : null}
          </section>

          <HorariosCanchasSection
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            isCancellingReservation={isCancellingReservation}
            isUpdatingPayment={isUpdatingPayment}
            onCancelReservation={handleCancelReservation}
            onQuickReserve={handleQuickReserve}
            onStatusChange={handleStatusChange}
            paidReservations={paidReservations}
            rows={scheduleRows}
            searchTerm={searchTerm}
          />
        </>
      );
    }

    if (section === 'reportes') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Analiza ingresos, ocupacion y comportamiento de clientes con filtros por fecha y cancha."
            title="Reportes avanzados"
          />
          <ReportesAvanzadosSection canchas={courts.map((court) => ({ id: court.id, nombre: court.nombre }))} />
        </>
      );
    }

    if (section === 'inventario') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Gestiona el inventario de equipos para alquiler."
            title="Inventario"
          />
          <InventarioSection />
        </>
      );
    }

    if (section === 'canchas') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Da de alta nuevas canchas, revisa las existentes y desactiva las que ya no operan."
            title="Modulo de canchas"
          />
          <section className="panel-card court-management-section">
            <div className="section-heading">
              <span className="eyebrow">Administracion de canchas</span>
              <h2>Listado, alta y baja logica</h2>
              <p>La eliminacion desactiva la cancha y respeta reservas futuras para evitar inconsistencias.</p>
            </div>

            <form className="court-form-grid" onSubmit={handleCreateCourt}>
              <input
                className="form-control"
                onChange={(event) => handleCourtFieldChange('nombre', event.target.value)}
                placeholder="Nombre"
                required
                type="text"
                value={courtForm.nombre}
              />
              <input
                className="form-control"
                onChange={(event) => handleCourtFieldChange('tipo', event.target.value)}
                placeholder="Tipo"
                required
                type="text"
                value={courtForm.tipo}
              />
              <input
                className="form-control"
                min="1"
                onChange={(event) => handleCourtFieldChange('precio_hora', event.target.value)}
                placeholder="Precio por hora"
                required
                step="0.01"
                type="number"
                value={courtForm.precio_hora}
              />
              <input
                className="form-control"
                min="1"
                onChange={(event) => handleCourtFieldChange('capacidad', event.target.value)}
                placeholder="Capacidad"
                required
                type="number"
                value={courtForm.capacidad}
              />
              <button className="btn btn-primary" disabled={isSubmittingCourt} type="submit">
                {isSubmittingCourt ? 'Guardando...' : 'Crear cancha'}
              </button>
            </form>

            {courtMessage ? <div className={`alert alert-${courtMessageTone} mt-3 mb-0`}>{courtMessage}</div> : null}

            <div className="table-responsive mt-4">
              <table className="table admin-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Precio/hora</th>
                    <th>Capacidad</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourts.map((court) => (
                    <tr key={court.id}>
                      <td>{court.nombre}</td>
                      <td>{court.tipo}</td>
                      <td>{formatCurrency(court.precio_hora)}</td>
                      <td>{court.capacidad}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          disabled={deletingCourtId === court.id}
                          onClick={() => void handleDeleteCourt(court)}
                          type="button"
                        >
                          {deletingCourtId === court.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCourts.length === 0 ? (
              <div className="alert alert-light border mt-3 mb-0">No hay canchas para los filtros actuales.</div>
            ) : null}
          </section>
        </>
      );
    }

    return (
      <>
        <DashboardWelcomeAlert
          description="Vista demostrativa para evidenciar la navegacion persistente del sidebar."
          title={`Modulo de ${section}`}
        />
        <section className="panel-card placeholder-panel">
          <span className="eyebrow">Componente de apoyo</span>
          <h2>Seccion lista para seguir creciendo</h2>
          <p>
            Este espacio queda preparado para conectar inventario o configuracion con
            servicios reales sin romper la estructura del layout administrativo.
          </p>
        </section>
      </>
    );
  };

  return (
    <div className="admin-shell">
      {/* Sidebar fijo del panel */}
      <AdminSidebar />

      <div className="admin-main">
        {/* Barra superior con buscador y alertas */}
        <AdminTopbar notifications={adminNotifications} onSearch={setSearchTerm} profile={profile} />
        <div className="admin-content-stack">
          {!session?.accessToken ? (
            <div className="alert alert-warning">Iniciá sesión con una cuenta administradora para consumir la API del panel.</div>
          ) : null}
          {session?.accessToken && !session.user.is_admin ? (
            <div className="alert alert-danger">Tu usuario no tiene permisos de administrador.</div>
          ) : null}
          {isLoading ? <div className="alert alert-info">Cargando datos del panel desde la API...</div> : null}
          {errorMessage ? <div className="alert alert-danger">{errorMessage}</div> : null}
          {!isLoading && session?.user.is_admin ? renderSection() : null}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
