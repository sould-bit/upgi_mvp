import type { Court, EditablePaymentStatus } from '../../types';

export interface ReservationFilters {
  fecha: string;
  canchaId: string;
  estadoPago: '' | EditablePaymentStatus;
}

interface ReservationFiltersSectionProps {
  filters: ReservationFilters;
  courts: Court[];
  onChange: (filters: ReservationFilters) => void;
  onClear: () => void;
}

const estados: EditablePaymentStatus[] = ['Sin pagar', 'Abonado', 'Pagado'];

function ReservationFiltersSection({ filters, courts, onChange, onClear }: ReservationFiltersSectionProps) {
  return (
    <section className="panel-card admin-filter-card">
      <div>
        <span className="eyebrow">Filtros operativos</span>
        <h2>Buscar reservas por fecha, cancha y pago</h2>
        <p>Esto le da al operador trazabilidad antes de cambiar pagos o cancelar turnos.</p>
      </div>

      <div className="admin-filter-grid">
        <input
          className="form-control"
          onChange={(event) => onChange({ ...filters, fecha: event.target.value })}
          type="date"
          value={filters.fecha}
        />
        <select
          className="form-select"
          onChange={(event) => onChange({ ...filters, canchaId: event.target.value })}
          value={filters.canchaId}
        >
          <option value="">Todas las canchas</option>
          {courts.map((court) => (
            <option key={court.id} value={court.id}>
              {court.nombre}
            </option>
          ))}
        </select>
        <select
          className="form-select"
          onChange={(event) =>
            onChange({ ...filters, estadoPago: event.target.value as ReservationFilters['estadoPago'] })
          }
          value={filters.estadoPago}
        >
          <option value="">Todos los estados</option>
          {estados.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        <button className="btn btn-outline-secondary" onClick={onClear} type="button">
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}

export default ReservationFiltersSection;
