import type { WeeklyReservationData } from '../../types';

interface BarChartPlaceholderProps {
  data: WeeklyReservationData[];
}

function BarChartPlaceholder({ data }: BarChartPlaceholderProps) {
  const maxValue = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="chart-placeholder">
      {/* Cada item se dibuja como una barra */}
      {data.map((item) => (
        <div className="chart-bar-group" key={item.label}>
          <div
            className="chart-bar"
            style={{ height: `${Math.max((item.total / maxValue) * 100, 18)}%` }}
          />
          <strong>{item.total}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default BarChartPlaceholder;
