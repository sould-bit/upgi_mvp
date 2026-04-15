import { useEffect, useState } from 'react';
import { createEquipo, deleteEquipo, fetchEquipos, fetchInventarioSummary, updateEquipo } from '../../lib/api';
import type { Equipo, EquipoCreatePayload, InventarioSummaryResponse } from '../../types';
import EquipoForm from './EquipoForm';
import InventarioStats from './InventarioStats';

function InventarioSection() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [summary, setSummary] = useState<InventarioSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'danger' } | null>(null);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [equiposResponse, summaryResponse] = await Promise.all([fetchEquipos(), fetchInventarioSummary()]);
      setEquipos(equiposResponse.equipos);
      setSummary(summaryResponse);
    } catch {
      setMessage({ text: 'Error al cargar inventario.', tone: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleCreate = async (payload: EquipoCreatePayload) => {
    setIsSubmitting(true);

    try {
      await createEquipo(payload);
      setMessage({ text: 'Equipo creado.', tone: 'success' });
      await loadData();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Error al crear.', tone: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (equipo: Equipo) => {
    setIsSubmitting(true);

    try {
      await updateEquipo(equipo.id, {
        nombre: equipo.nombre,
        categoria: equipo.categoria,
        precio_alquiler: equipo.precio_alquiler,
        stock_total: equipo.stock_total
      });
      setEditingId(null);
      setMessage({ text: 'Equipo actualizado.', tone: 'success' });
      await loadData();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Error al actualizar.', tone: 'danger' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (equipo: Equipo) => {
    if (!window.confirm(`¿Eliminar "${equipo.nombre}"?`)) {
      return;
    }

    setDeletingIds((previous) => ({ ...previous, [equipo.id]: true }));

    try {
      await deleteEquipo(equipo.id);
      setMessage({ text: 'Equipo eliminado.', tone: 'success' });
      await loadData();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Error al eliminar.', tone: 'danger' });
    } finally {
      setDeletingIds((previous) => {
        const next = { ...previous };
        delete next[equipo.id];
        return next;
      });
    }
  };

  const editingEquipo = editingId !== null ? equipos.find((equipo) => equipo.id === editingId) : undefined;

  return (
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">InventarioSection</span>
        <h2>Inventario de equipos</h2>
        <p>Gestiona el equipamiento disponible para alquiler.</p>
      </div>

      <InventarioStats isLoading={isLoading} summary={summary} />

      {editingEquipo ? (
        <div className="mb-4">
          <h5>Editando: {editingEquipo.nombre}</h5>
          <EquipoForm
            initial={editingEquipo}
            isSubmitting={isSubmitting}
            mode="edit"
            onCancel={() => setEditingId(null)}
            onSubmit={(payload) => handleEdit({ ...editingEquipo, ...payload })}
          />
        </div>
      ) : (
        <div className="mb-4">
          <h5>Agregar nuevo equipo</h5>
          <EquipoForm isSubmitting={isSubmitting} mode="create" onSubmit={handleCreate} />
        </div>
      )}

      {message ? <div className={`alert alert-${message.tone} mb-3`}>{message.text}</div> : null}

      {isLoading ? (
        <div className="text-center py-4">
          <span className="spinner-border" />
        </div>
      ) : equipos.length === 0 ? (
        <div className="alert alert-light border">No hay equipos registrados.</div>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio alquiler</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equipos.map((equipo) => (
              <tr key={equipo.id}>
                <td>{equipo.nombre}</td>
                <td>
                  <span className="badge bg-secondary">{equipo.categoria}</span>
                </td>
                <td>${equipo.precio_alquiler.toLocaleString('es-CO')}</td>
                <td>
                  <span className={equipo.stock_total <= 2 ? 'text-danger fw-bold' : ''}>{equipo.stock_total}</span>
                </td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => setEditingId(equipo.id)} type="button">
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    disabled={deletingIds[equipo.id]}
                    onClick={() => void handleDelete(equipo)}
                    type="button"
                  >
                    {deletingIds[equipo.id] ? '...' : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default InventarioSection;
