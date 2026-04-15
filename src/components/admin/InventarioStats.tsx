import type { InventarioSummaryResponse } from '../../types';

interface InventarioStatsProps {
  summary: InventarioSummaryResponse | null;
  isLoading?: boolean;
}

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function InventarioStats({ summary, isLoading }: InventarioStatsProps) {
  const equipos = summary?.total_equipos ?? 0;
  const stock = summary?.stock_total ?? 0;
  const valor = summary?.valor_inventario ?? 0;

  return (
    <div className="stats-grid mb-4">
      <div className="panel-card stat-mini-card">
        <span className="stat-mini-label">Equipos</span>
        <span className="stat-mini-value">{isLoading ? '...' : equipos}</span>
      </div>
      <div className="panel-card stat-mini-card">
        <span className="stat-mini-label">Stock total</span>
        <span className="stat-mini-value">{isLoading ? '...' : stock}</span>
      </div>
      <div className="panel-card stat-mini-card">
        <span className="stat-mini-label">Valor inventario</span>
        <span className="stat-mini-value">{isLoading ? '...' : formatCOP(valor)}</span>
      </div>
    </div>
  );
}

export default InventarioStats;
