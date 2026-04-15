import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DailyItem } from '../../../types';

interface IngresosChartProps {
  data: DailyItem[];
  isLoading?: boolean;
}

const copCurrency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function IngresosChart({ data, isLoading = false }: IngresosChartProps) {
  const hasData = data.some((item) => item.ingreso_total > 0);
  const formatCurrency = (value: number | string) => copCurrency.format(Number(value) || 0);

  return (
    <section className="panel-card h-100">
      <div className="section-heading mb-3">
        <span className="eyebrow">Ingresos diarios</span>
        <h2>Evolucion de ingresos</h2>
      </div>

      {isLoading ? <div className="alert alert-info mb-0">Cargando ingresos...</div> : null}

      {!isLoading && (!data.length || !hasData) ? (
        <div className="alert alert-light border mb-0">Sin datos para el periodo seleccionado</div>
      ) : null}

      {!isLoading && data.length > 0 && hasData ? (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={92} />
              <Tooltip
                formatter={(value) => formatCurrency(typeof value === 'number' || typeof value === 'string' ? value : 0)}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Line dataKey="ingreso_total" dot={false} stroke="#198754" strokeWidth={2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}

export default IngresosChart;
