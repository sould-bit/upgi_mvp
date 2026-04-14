import type { WeeklyReservationData } from '../../types';
import BarChartPlaceholder from './BarChartPlaceholder';

interface ReservasPorSemanaSectionProps {
  data: WeeklyReservationData[];
  estimatedIncome: string;
}

function ReservasPorSemanaSection({ data, estimatedIncome }: ReservasPorSemanaSectionProps) {
  const totalReservations = data.reduce((accumulator, item) => accumulator + item.total, 0);

  return (
    // Seccion que luego se puede cambiar por un grafico real.
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">ReservasPorSemanaSection</span>
        <h2>Reservas por semana</h2>
        <p>Espacio listo para reemplazar el placeholder por Chart.js o Recharts cuando quieras.</p>
      </div>

        <BarChartPlaceholder data={data} />

      <div className="chart-summary">
        <span>
          <strong>{totalReservations}</strong> reservas proyectadas
        </span>
        <span>
          <strong>{estimatedIncome}</strong> ingresos estimados
        </span>
      </div>
    </section>
  );
}

export default ReservasPorSemanaSection;
