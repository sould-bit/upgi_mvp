import { type FormEvent, useEffect, useState } from 'react';
import type { ReporteFiltros as ReporteFiltrosType } from '../../../types';

interface ReporteFiltrosProps {
  initial: ReporteFiltrosType;
  canchas: { id: number; nombre: string }[];
  onApply: (filters: ReporteFiltrosType) => void;
  isLoading?: boolean;
}

function ReporteFiltros({ initial, canchas, onApply, isLoading = false }: ReporteFiltrosProps) {
  const [draft, setDraft] = useState<ReporteFiltrosType>(initial);

  useEffect(() => {
    setDraft(initial);
  }, [initial]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">Filtros</span>
        <h2>Reportes avanzados</h2>
        <p>Elegi el rango de fechas y la cancha para actualizar todos los widgets.</p>
      </div>

      <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="reportes-fecha-desde">
            Fecha desde
          </label>
          <input
            className="form-control"
            id="reportes-fecha-desde"
            onChange={(event) => setDraft((prev) => ({ ...prev, fechaDesde: event.target.value }))}
            required
            type="date"
            value={draft.fechaDesde}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="reportes-fecha-hasta">
            Fecha hasta
          </label>
          <input
            className="form-control"
            id="reportes-fecha-hasta"
            onChange={(event) => setDraft((prev) => ({ ...prev, fechaHasta: event.target.value }))}
            required
            type="date"
            value={draft.fechaHasta}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label" htmlFor="reportes-cancha">
            Cancha
          </label>
          <select
            className="form-select"
            id="reportes-cancha"
            onChange={(event) => {
              const value = event.target.value;
              setDraft((prev) => ({
                ...prev,
                canchaId: value ? Number(value) : null
              }));
            }}
            value={draft.canchaId ?? ''}
          >
            <option value="">Todas</option>
            {canchas.map((cancha) => (
              <option key={cancha.id} value={cancha.id}>
                {cancha.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <button className="btn btn-primary" disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <span aria-hidden="true" className="spinner-border spinner-border-sm me-2" />
                Aplicando...
              </>
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ReporteFiltros;
