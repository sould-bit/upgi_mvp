import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAdminDashboard, fetchAdminReservations, fetchWeeklyReservations } from '../lib/api';
import { getStoredSession } from '../lib/session';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardWelcomeAlert from '../components/admin/DashboardWelcomeAlert';
import HorariosCanchasSection from '../components/admin/HorariosCanchasSection';
import ReservasPorSemanaSection from '../components/admin/ReservasPorSemanaSection';
import StatsSection from '../components/admin/StatsSection';
import type {
  AdminDashboardResponse,
  AdminProfile,
  AdminReservationsResponse,
  NotificationItem,
  ScheduleRow,
  StatData,
  WeeklyReservationData,
  WeeklyReservationsResponse
} from '../types';

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

function buildScheduleRows(response: AdminReservationsResponse | null): ScheduleRow[] {
  if (!response) {
    return [];
  }

  const groupedRows = new Map<string, ScheduleRow>();

  response.reservas.forEach((reservation) => {
    const timeKey = reservation.hora_inicio.slice(0, 5);
    const courtName = reservation.cancha.nombre ?? 'Cancha';
    const currentRow = groupedRows.get(timeKey) ?? { time: timeKey, slots: [] };

    currentRow.slots.push({
      court: courtName,
      player: reservation.usuario.nombre ?? reservation.usuario.email ?? `Reserva #${reservation.id}`,
      status: (reservation.estado_pago as ScheduleRow['slots'][number]['status']) ?? 'Sin pagar'
    });

    groupedRows.set(timeKey, currentRow);
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
        const reservationsParams = new URLSearchParams({
          fecha: new Date().toISOString().slice(0, 10),
          limit: '50'
        });
        const weeklyParams = new URLSearchParams(weekRange);

        const [dashboardResponse, weeklyResponse, reservationsResponse] = await Promise.all([
          fetchAdminDashboard(),
          fetchWeeklyReservations(weeklyParams),
          fetchAdminReservations(reservationsParams)
        ]);

        if (!isMounted) {
          return;
        }

        setDashboard(dashboardResponse);
        setWeeklyReservations(weeklyResponse);
        setAdminReservations(reservationsResponse);
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
  const scheduleRows = useMemo(() => buildScheduleRows(adminReservations), [adminReservations]);
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

  const renderSection = () => {
    if (section === 'dashboard') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Gestiona tu centro deportivo desde una arquitectura pensada por componentes."
            title="Panel principal"
          />
          <StatsSection stats={adminStats} />
          <HorariosCanchasSection rows={scheduleRows} searchTerm={searchTerm} />
          <ReservasPorSemanaSection data={weeklyData} estimatedIncome={estimatedIncome} />
        </>
      );
    }

    if (section === 'reservas') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Filtra reservas, revisa estados de pago y valida ocupacion."
            title="Modulo de reservas"
          />
          <HorariosCanchasSection rows={scheduleRows} searchTerm={searchTerm} />
        </>
      );
    }

    if (section === 'reportes') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Seccion orientada a metricas, comparativas y futuros graficos."
            title="Modulo de reportes"
          />
          <StatsSection stats={adminStats} />
          <ReservasPorSemanaSection data={weeklyData} estimatedIncome={estimatedIncome} />
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
