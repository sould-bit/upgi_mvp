import type { WeeklyReservationData } from '../../types';
import BarChartPlaceholder from './BarChartPlaceholder';

// Datos simples para representar reservas por dia.
const weeklyReservations: WeeklyReservationData[] = [
  { label: 'Lun', total: 10 },
  { label: 'Mar', total: 16 },
  { label: 'Mie', total: 18 },
  { label: 'Jue', total: 14 },
  { label: 'Vie', total: 22 },
  { label: 'Sab', total: 24 },
  { label: 'Dom', total: 15 }
];

function ReservasPorSemanaSection() {
  // Sumamos el total semanal para el resumen inferior.
  const totalReservations = weeklyReservations.reduce((accumulator, item) => accumulator + item.total, 0);

  return (
    // Seccion que luego se puede cambiar por un grafico real.
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">ReservasPorSemanaSection</span>
        <h2>Reservas por semana</h2>
        <p>Espacio listo para reemplazar el placeholder por Chart.js o Recharts cuando quieras.</p>
      </div>

      <BarChartPlaceholder data={weeklyReservations} />

      <div className="chart-summary">
        <span>
          <strong>{totalReservations}</strong> reservas proyectadas
        </span>
        <span>
          <strong>$307.500</strong> ingresos estimados
        </span>
      </div>
    </section>
  );
}

export default ReservasPorSemanaSection;
