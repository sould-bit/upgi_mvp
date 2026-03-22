import type { ReservationFormData } from '../../types';

// Props necesarias para que este formulario funcione desde la pagina padre.
interface ReservaFormSectionProps {
  formData: ReservationFormData;
  venueOptions: string[];
  courtOptions: string[];
  timeOptions: string[];
  onFieldChange: <K extends keyof ReservationFormData>(
    field: K,
    value: ReservationFormData[K]
  ) => void;
  onSubmit: () => void;
  onReset: () => void;
}

function ReservaFormSection({
  formData,
  venueOptions,
  courtOptions,
  timeOptions,
  onFieldChange,
  onSubmit,
  onReset
}: ReservaFormSectionProps) {
  return (
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">Reserva FormSection</span>
        <h2>Formulario de reserva</h2>
      </div>

      <form
        className="row g-3"
        onSubmit={(event) => {
          // Evita que la pagina se recargue al enviar.
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="col-12">
          <label className="form-label" htmlFor="venue">
            Sede
          </label>
          <select
            className="form-select"
            id="venue"
            onChange={(event) => onFieldChange('venue', event.target.value)}
            value={formData.venue}
          >
            <option value="">Elige una sede</option>
            {/* Se pinta cada sede disponible */}
            {venueOptions.map((venue) => (
              <option key={venue} value={venue}>
                {venue}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="court">
            Cancha
          </label>
          <select
            className="form-select"
            id="court"
            onChange={(event) => onFieldChange('court', event.target.value)}
            value={formData.court}
          >
            <option value="">Elige una cancha</option>
            {/* Se pinta cada cancha disponible */}
            {courtOptions.map((court) => (
              <option key={court} value={court}>
                {court}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="date">
            Fecha
          </label>
          <input
            className="form-control"
            id="date"
            onChange={(event) => onFieldChange('date', event.target.value)}
            type="date"
            value={formData.date}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="startTime">
            Hora inicio
          </label>
          <select
            className="form-select"
            id="startTime"
            onChange={(event) => onFieldChange('startTime', event.target.value)}
            value={formData.startTime}
          >
            {/* La hora de inicio no usa la ultima opcion para evitar rangos malos */}
            {timeOptions.slice(0, -1).map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="endTime">
            Hora fin
          </label>
          <select
            className="form-select"
            id="endTime"
            onChange={(event) => onFieldChange('endTime', event.target.value)}
            value={formData.endTime}
          >
            {/* La hora final empieza desde la segunda opcion */}
            {timeOptions.slice(1).map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label" htmlFor="players">
            Numero de jugadores
          </label>
          <input
            className="form-control"
            id="players"
            max={8}
            min={1}
            onChange={(event) => onFieldChange('players', Number(event.target.value))}
            type="number"
            value={formData.players}
          />
        </div>

        <div className="col-12 d-flex gap-3">
          {/* Botones principales del formulario */}
          <button className="btn btn-primary rounded-pill px-4" type="submit">
            Confirmar reserva
          </button>
          <button className="btn btn-outline-secondary rounded-pill px-4" onClick={onReset} type="button">
            Limpiar
          </button>
        </div>
      </form>
    </section>
  );
}

export default ReservaFormSection;
