import type { ScheduleRow } from '../../types';
import HorariosTable from './HorariosTable';
import StatusLegend from './StatusLegend';

interface HorariosCanchasSectionProps {
  searchTerm: string;
  rows: ScheduleRow[];
}

function HorariosCanchasSection({ rows, searchTerm }: HorariosCanchasSectionProps) {
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) {
      return true;
    }

    return (
      row.time.toLowerCase().includes(searchTerm) ||
      row.slots.some((slot) =>
        [slot.court, slot.player ?? '', slot.status].join(' ').toLowerCase().includes(searchTerm)
      )
    );
  });

  return (
    // Aqui reunimos la tabla y la leyenda de colores/estados.
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">Horarios CanchasSection</span>
        <h2>Ocupacion por hora y cancha</h2>
        <p>Incluye la tabla reutilizable, las celdas de reserva y la leyenda usando datos reales.</p>
      </div>

      {filteredRows.length > 0 ? (
        <HorariosTable rows={filteredRows} />
      ) : (
        <div className="alert alert-light border mb-0">No hay reservas para los filtros actuales.</div>
      )}
      <StatusLegend />
    </section>
  );
}

export default HorariosCanchasSection;
