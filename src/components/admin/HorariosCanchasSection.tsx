import type { ScheduleRow } from '../../types';
import HorariosTable from './HorariosTable';
import StatusLegend from './StatusLegend';

// Datos de ejemplo para llenar la tabla de ocupacion.
const scheduleRows: ScheduleRow[] = [
  {
    time: '08:00',
    slots: [
      { court: 'Cancha 1', status: 'Libre' },
      { court: 'Cancha 2', status: 'Libre' },
      { court: 'Cancha 3', player: 'Luis R.', status: 'Pagado' },
      { court: 'Cancha 4', status: 'Libre' }
    ]
  },
  {
    time: '09:00',
    slots: [
      { court: 'Cancha 1', player: 'Maria S.', status: 'Pagado' },
      { court: 'Cancha 2', status: 'Libre' },
      { court: 'Cancha 3', status: 'Libre' },
      { court: 'Cancha 4', status: 'Libre' }
    ]
  },
  {
    time: '10:00',
    slots: [
      { court: 'Cancha 1', player: 'Carlos M.', status: 'Pagado' },
      { court: 'Cancha 2', player: 'Carolina P.', status: 'Abonado' },
      { court: 'Cancha 3', status: 'Libre' },
      { court: 'Cancha 4', player: 'Equipo Liga', status: 'Sin pagar' }
    ]
  },
  {
    time: '11:00',
    slots: [
      { court: 'Cancha 1', status: 'Libre' },
      { court: 'Cancha 2', player: 'Semillero U12', status: 'Pagado' },
      { court: 'Cancha 3', status: 'Libre' },
      { court: 'Cancha 4', status: 'Libre' }
    ]
  }
];

interface HorariosCanchasSectionProps {
  searchTerm: string;
}

function HorariosCanchasSection({ searchTerm }: HorariosCanchasSectionProps) {
  // Filtra por hora, cancha, jugador o estado.
  const filteredRows = scheduleRows.filter((row) => {
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
        <p>Incluye la tabla reutilizable, las celdas de reserva y la leyenda de estados.</p>
      </div>

      <HorariosTable rows={filteredRows} />
      <StatusLegend />
    </section>
  );
}

export default HorariosCanchasSection;
