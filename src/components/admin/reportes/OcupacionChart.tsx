import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { OcupacionItem } from '../../../types';

interface OcupacionChartProps {
  data: OcupacionItem[];
  isLoading?: boolean;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function OcupacionChart({ data, isLoading = false }: OcupacionChartProps) {
  const formatPercentValue = (value: number | string) => formatPercent(Number(value) || 0);

  return (
    <section className="panel-card h-100">
      <div className="section-heading mb-3">
        <span className="eyebrow">Ocupacion</span>
        <h2>Porcentaje por cancha</h2>
      </div>

      {isLoading ? <div className="alert alert-info mb-0">Cargando ocupacion...</div> : null}

      {!isLoading && data.length === 0 ? <div className="alert alert-light border mb-0">Sin datos</div> : null}

      {!isLoading && data.length > 0 ? (
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <XAxis dataKey="cancha_nombre" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatPercentValue(value)} width={70} />
              <Tooltip
                formatter={(value) =>
                  formatPercentValue(typeof value === 'number' || typeof value === 'string' ? value : 0)
                }
              />
              <Bar dataKey="ocupacion_pct" fill="#0d6efd" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}

export default OcupacionChart;
