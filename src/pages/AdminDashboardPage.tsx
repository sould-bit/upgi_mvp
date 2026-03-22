import { useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';
import DashboardWelcomeAlert from '../components/admin/DashboardWelcomeAlert';
import HorariosCanchasSection from '../components/admin/HorariosCanchasSection';
import ReservasPorSemanaSection from '../components/admin/ReservasPorSemanaSection';
import StatsSection from '../components/admin/StatsSection';
import type { NotificationItem, StatData } from '../types';

// Notificaciones de ejemplo para mostrar el menu del admin.
const adminNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Reserva confirmada',
    detail: 'Cancha 1 - 10:00 AM',
    tone: 'success'
  },
  {
    id: 2,
    title: 'Pago pendiente',
    detail: 'Reserva #1234',
    tone: 'warning'
  },
  {
    id: 3,
    title: 'Mantenimiento programado',
    detail: 'Cancha 3 - manana',
    tone: 'info'
  }
];

// Estadisticas de ejemplo para el dashboard.
const adminStats: StatData[] = [
  {
    icon: 'calendar-check',
    label: 'Reservas activas',
    value: '24',
    variation: '+12%',
    tone: 'primary'
  },
  {
    icon: 'cash-stack',
    label: 'Ingresos del dia',
    value: '$125.000',
    variation: '+8%',
    tone: 'success'
  },
  {
    icon: 'geo-alt',
    label: 'Canchas disponibles',
    value: '3/8',
    tone: 'warning'
  },
  {
    icon: 'exclamation-triangle',
    label: 'Quejas pendientes',
    value: '2',
    variation: '-50%',
    tone: 'danger'
  }
];

function AdminDashboardPage() {
  // Leemos el modulo actual desde la URL.
  const { section = 'dashboard' } = useParams();
  const [searchTerm, setSearchTerm] = useState('');

  // Segun la seccion, mostramos un bloque distinto del panel.
  const renderSection = () => {
    if (section === 'dashboard') {
      return (
        <>
          <DashboardWelcomeAlert
            description="Gestiona tu centro deportivo desde una arquitectura pensada por componentes."
            title="Panel principal"
          />
          <StatsSection stats={adminStats} />
          <HorariosCanchasSection searchTerm={searchTerm} />
          <ReservasPorSemanaSection />
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
          <HorariosCanchasSection searchTerm={searchTerm} />
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
          <ReservasPorSemanaSection />
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
        <AdminTopbar notifications={adminNotifications} onSearch={setSearchTerm} />
        <div className="admin-content-stack">{renderSection()}</div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
