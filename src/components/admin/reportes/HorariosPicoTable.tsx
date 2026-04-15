import type { HorarioPicoItem } from '../../../types';

interface HorariosPicoTableProps {
  data: HorarioPicoItem[];
  isLoading?: boolean;
}

function HorariosPicoTable({ data, isLoading = false }: HorariosPicoTableProps) {
  return (
    <section className="panel-card h-100">
      <div className="section-heading mb-3">
        <span className="eyebrow">Horarios pico</span>
        <h2>Top horarios</h2>
      </div>

      {isLoading ? <div className="alert alert-info mb-0">Cargando horarios...</div> : null}

      {!isLoading && data.length === 0 ? (
        <div className="alert alert-light border mb-0">Sin datos</div>
      ) : null}

      {!isLoading && data.length > 0 ? (
        <div className="table-responsive">
          <table className="table admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Hora</th>
                <th className="text-end">Cantidad de reservas</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item) => (
                <tr key={item.hora}>
                  <td>{item.hora}</td>
                  <td className="text-end">{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default HorariosPicoTable;
