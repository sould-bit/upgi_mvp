import { useEffect, useState } from 'react';
import { fetchSeries, cancelarSerie, fetchCourts } from '../../lib/api';
import type { Court, SerieReserva } from '../../types';

function SerieReservasPanel() {
  const [series, setSeries] = useState<SerieReserva[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'danger' } | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [seriesResp, courtsResp] = await Promise.all([fetchSeries(), fetchCourts()]);
      setSeries(seriesResp.series);
      setCourts(courtsResp.canchas);
    } catch {
      setMessage({ text: 'Error al cargar series.', tone: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = async (serie: SerieReserva) => {
    const confirmed = window.confirm(
      `¿Cancelar la serie #${serie.id}? Esto cancelará todas las reservas futuras de esta serie.`
    );
    if (!confirmed) return;

    try {
      const resp = await cancelarSerie(serie.id);
      setMessage({ text: resp.message, tone: 'success' });
      await loadData();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Error al cancelar serie.', tone: 'danger' });
    }
  };

  const getCourtName = (canchaId: number) => courts.find((c) => c.id === canchaId)?.nombre ?? `Cancha #${canchaId}`;
  const activeSeries = series.filter((s) => s.is_active);

  if (isLoading) {
    return <div className="text-center py-3"><span className="spinner-border" /></div>;
  }

  return (
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">Series recurrentes</span>
        <h2>Reservas periódicas activas</h2>
        <p>Gestioná las reservas que se repiten automáticamente (liga semanal, clases, etc.).</p>
      </div>

      {message ? <div className={`alert alert-${message.tone}`}>{message.text}</div> : null}

      {activeSeries.length === 0 ? (
        <div className="alert alert-light border">No hay series activas. Creá una desde el formulario de reservas con la opción "Recurrente".</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Cancha</th>
                <th>Frecuencia</th>
                <th>Horario</th>
                <th>Desde</th>
                <th>Hasta</th>
                <th>Instancias</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activeSeries.map((serie) => (
                <tr key={serie.id}>
                  <td>{serie.id}</td>
                  <td>{getCourtName(serie.cancha_id)}</td>
                  <td>
                    <span className="badge bg-info">
                      {serie.frecuencia}
                      {serie.intervalo > 1 ? ` x${serie.intervalo}` : ''}
                    </span>
                  </td>
                  <td>{serie.hora_inicio} — {serie.hora_fin}</td>
                  <td>{serie.fecha_inicio}</td>
                  <td>{serie.fecha_fin ?? 'Sin fin'}</td>
                  <td>{serie.total_instancias}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void handleCancelar(serie)}
                      type="button"
                    >
                      Cancelar serie
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default SerieReservasPanel;
