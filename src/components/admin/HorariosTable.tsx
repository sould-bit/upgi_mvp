import type { ScheduleRow } from '../../types';
import ReservaCell from './ReservaCell';

interface HorariosTableProps {
  rows: ScheduleRow[];
}

function HorariosTable({ rows }: HorariosTableProps) {
  return (
    // Tabla principal de horarios por cancha.
    <div className="table-responsive">
      <table className="table admin-table align-middle mb-0">
        <thead>
          <tr>
            <th>Horario</th>
            <th>Cancha 1</th>
            <th>Cancha 2</th>
            <th>Cancha 3</th>
            <th>Cancha 4</th>
          </tr>
        </thead>
        <tbody>
          {/* Cada fila representa una hora */}
          {rows.map((row) => (
            <tr key={row.time}>
              <td>{row.time}</td>
              {/* Cada celda representa una cancha en esa hora */}
              {row.slots.map((slot) => (
                <td key={`${row.time}-${slot.court}`}>
                  <ReservaCell slot={slot} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HorariosTable;
