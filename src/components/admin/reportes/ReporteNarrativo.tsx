import type { ClienteFrecuenteItem, HorarioPicoItem, InventarioAlquiladoItem, OcupacionItem, DailyItem } from '../../../types';

interface ReporteNarrativoProps {
  daily: DailyItem[];
  ocupacion: OcupacionItem[];
  horarios: HorarioPicoItem[];
  clientes: ClienteFrecuenteItem[];
  inventario: InventarioAlquiladoItem[];
}

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

function ReporteNarrativo({ daily, ocupacion, horarios, clientes, inventario }: ReporteNarrativoProps) {
  const totalIngresos = daily.reduce((total, item) => total + item.ingreso_total, 0);
  const totalReservas = daily.reduce((total, item) => total + item.reservas_count, 0);
  const canchaTop = [...ocupacion].sort((a, b) => b.ocupacion_pct - a.ocupacion_pct)[0];
  const horarioTop = horarios[0];
  const clienteTop = clientes[0];
  const equipoTop = inventario[0];

  return (
    <section className="panel-card report-narrative">
      <div className="section-heading">
        <span className="eyebrow">Resumen para capacitación</span>
        <h2>Lectura ejecutiva del periodo</h2>
        <p>Este bloque ayuda a cerrar el tutorial explicando qué decisiones puede tomar el operador con datos.</p>
      </div>

      <div className="report-narrative-grid">
        <article>
          <strong>{totalReservas}</strong>
          <span>reservas gestionadas</span>
        </article>
        <article>
          <strong>{formatCOP(totalIngresos)}</strong>
          <span>ingresos registrados</span>
        </article>
        <article>
          <strong>{canchaTop ? `${canchaTop.cancha_nombre} (${canchaTop.ocupacion_pct}%)` : 'Sin datos'}</strong>
          <span>cancha con mayor ocupación</span>
        </article>
        <article>
          <strong>{horarioTop ? horarioTop.hora : 'Sin datos'}</strong>
          <span>horario pico</span>
        </article>
        <article>
          <strong>{clienteTop ? clienteTop.cliente_nombre : 'Sin datos'}</strong>
          <span>cliente frecuente</span>
        </article>
        <article>
          <strong>{equipoTop ? `${equipoTop.equipo_nombre} (${equipoTop.cantidad_total})` : 'Sin datos'}</strong>
          <span>equipo más alquilado</span>
        </article>
      </div>
    </section>
  );
}

export default ReporteNarrativo;
