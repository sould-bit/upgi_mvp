import type { ReservationFormData, ReservationSummary } from '../../types';

// Este componente solo muestra el resumen ya calculado.
interface ReservaDetailsSectionProps {
  formData: ReservationFormData;
  summary: ReservationSummary;
}

function ReservaDetailsSection({ formData, summary }: ReservaDetailsSectionProps) {
  return (
    // El aside queda al lado del formulario como apoyo visual.
    <aside className="panel-card details-panel">
      <div className="section-heading">
        <span className="eyebrow">Reserva Details Section</span>
        <h2>Resumen de seleccion</h2>
      </div>

      <div className="status-chip">{summary.availability}</div>

      <div className="detail-list">
        {/* Si aun no hay datos, mostramos "No definido" */}
        <div className="detail-row">
          <span>Sede</span>
          <strong>{formData.venue || 'No definido'}</strong>
        </div>
        <div className="detail-row">
          <span>Cancha</span>
          <strong>{formData.court || 'No definido'}</strong>
        </div>
        <div className="detail-row">
          <span>Fecha</span>
          <strong>{formData.date || 'No definido'}</strong>
        </div>
        <div className="detail-row">
          <span>Horario</span>
          <strong>
            {formData.startTime && formData.endTime
              ? `${formData.startTime} - ${formData.endTime}`
              : 'No definido'}
          </strong>
        </div>
        <div className="detail-row">
          <span>Jugadores</span>
          <strong>{formData.players || 'No definido'}</strong>
        </div>
        <div className="detail-row">
          <span>Duracion</span>
          <strong>{summary.durationLabel}</strong>
        </div>
      </div>

      <div className="price-total">
        <span>Precio total</span>
        <strong>{summary.totalPriceLabel}</strong>
      </div>
    </aside>
  );
}

export default ReservaDetailsSection;
