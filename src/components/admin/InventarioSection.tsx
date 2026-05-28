import { useEffect, useState } from 'react';
import {
  completarMantenimiento,
  createEquipo,
  deleteEquipo,
  fetchEquipos,
  fetchInventarioSummary,
  marcarMantenimiento,
  updateEquipo
} from '../../lib/api';
import type { Equipo, EquipoCreatePayload, InventarioSummaryResponse } from '../../types';
import EquipoForm from './EquipoForm';
import InventarioStats from './InventarioStats';

type TabFilter = 'Todos' | 'Disponible' | 'Mantenimiento';

function InventarioSection() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [summary, setSummary] = useState<InventarioSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'danger' } | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('Todos');
  const [maintenanceIds, setMaintenanceIds] = useState<Record<number, boolean>>({});

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

  const handleMarcarMantenimiento = async (equipo: Equipo) => {
    const notas = window.prompt(`Marcar "${equipo.nombre}" para mantenimiento. Notas opcionales:`);
    if (notas === null) return;

    setMaintenanceIds((prev) => ({ ...prev, [equipo.id]: true }));
    try {
      await marcarMantenimiento(equipo.id, notas || undefined);
      setMessage({ text: `"${equipo.nombre}" marcado para mantenimiento.`, tone: 'success' });
      await loadData();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Error al marcar mantenimiento.', tone: 'danger' });
    } finally {
      setMaintenanceIds((prev) => {
        const next = { ...prev };
        delete next[equipo.id];
        return next;
      });
    }
  };

  const handleCompletarMantenimiento = async (equipo: Equipo) => {
    setMaintenanceIds((prev) => ({ ...prev, [equipo.id]: true }));
    try {
      await completarMantenimiento(equipo.id);
      setMessage({ text: `"${equipo.nombre}" ahora disponible.`, tone: 'success' });
      await loadData();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Error al completar mantenimiento.', tone: 'danger' });
    } finally {
      setMaintenanceIds((prev) => {
        const next = { ...prev };
        delete next[equipo.id];
        return next;
      });
    }
  };

  const filteredEquipos = activeTab === 'Todos'
    ? equipos
    : equipos.filter((e) => (e.maintenance_status ?? 'Disponible') === activeTab);

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

      {/* Tabs de filtro por estado de mantenimiento */}
      <div className="d-flex gap-2 mb-3">
        {(['Todos', 'Disponible', 'Mantenimiento'] as TabFilter[]).map((tab) => (
          <button
            key={tab}
            className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
            {tab === 'Mantenimiento' ? (
              <span className="badge bg-warning text-dark ms-1">
                {equipos.filter((e) => (e.maintenance_status ?? 'Disponible') === 'Mantenimiento').length}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <span className="spinner-border" />
        </div>
      ) : filteredEquipos.length === 0 ? (
        <div className="alert alert-light border">
          {activeTab === 'Todos'
            ? 'No hay equipos registrados.'
            : `No hay equipos en estado "${activeTab}".`}
        </div>
      ) : (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Precio alquiler</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipos.map((equipo) => {
              const isMantenimiento = (equipo.maintenance_status ?? 'Disponible') === 'Mantenimiento';
              return (
                <tr key={equipo.id} className={isMantenimiento ? 'table-warning' : ''}>
                  <td>{equipo.nombre}</td>
                  <td>
                    <span className="badge bg-secondary">{equipo.categoria}</span>
                  </td>
                  <td>${equipo.precio_alquiler.toLocaleString('es-CO')}</td>
                  <td>
                    <span className={equipo.stock_total <= 2 ? 'text-danger fw-bold' : ''}>{equipo.stock_total}</span>
                  </td>
                  <td>
                    <span className={`badge ${isMantenimiento ? 'bg-warning text-dark' : 'bg-success'}`}>
                      {isMantenimiento ? 'En Mantenimiento' : 'Disponible'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditingId(equipo.id)} type="button">
                      Editar
                    </button>
                    {!isMantenimiento ? (
                      <button
                        className="btn btn-sm btn-outline-warning me-1"
                        disabled={maintenanceIds[equipo.id]}
                        onClick={() => void handleMarcarMantenimiento(equipo)}
                        type="button"
                      >
                        {maintenanceIds[equipo.id] ? '...' : 'Mantenimiento'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-success me-1"
                        disabled={maintenanceIds[equipo.id]}
                        onClick={() => void handleCompletarMantenimiento(equipo)}
                        type="button"
                      >
                        {maintenanceIds[equipo.id] ? '...' : 'Completar'}
                      </button>
                    )}
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
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default InventarioSection;
