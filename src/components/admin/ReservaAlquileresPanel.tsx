import { useMemo, useState } from 'react';
import type { Equipo, ReservaAlquilerEquipo, ReservaAlquileresUpdatePayload } from '../../types';

interface ReservaAlquileresPanelProps {
  alquileres: ReservaAlquilerEquipo[];
  equipos: Equipo[];
  isSaving: boolean;
  onSave: (payload: ReservaAlquileresUpdatePayload) => Promise<void>;
}

function ReservaAlquileresPanel({ alquileres, equipos, isSaving, onSave }: ReservaAlquileresPanelProps) {
  const [equipoId, setEquipoId] = useState('');
  const [cantidad, setCantidad] = useState('1');

  const selectedEquipo = useMemo(
    () => equipos.find((equipo) => equipo.id === Number(equipoId)) ?? null,
    [equipoId, equipos]
  );
  const totalAlquileres = alquileres.reduce((total, item) => total + item.subtotal, 0);

  const handleAdd = async () => {
    if (!selectedEquipo) {
      return;
    }

    const nextCantidad = Number(cantidad);
    if (!Number.isFinite(nextCantidad) || nextCantidad <= 0) {
      return;
    }

    const currentItems = alquileres.map((item) => ({
      equipo_id: item.equipo_id,
      cantidad: item.cantidad
    }));
    const existing = currentItems.find((item) => item.equipo_id === selectedEquipo.id);

    if (existing) {
      existing.cantidad += nextCantidad;
    } else {
      currentItems.push({ equipo_id: selectedEquipo.id, cantidad: nextCantidad });
    }

    await onSave({ items: currentItems });
    setEquipoId('');
    setCantidad('1');
  };

  const handleRemove = async (equipoIdToRemove: number) => {
    await onSave({
      items: alquileres
        .filter((item) => item.equipo_id !== equipoIdToRemove)
        .map((item) => ({ equipo_id: item.equipo_id, cantidad: item.cantidad }))
    });
  };

  return (
    <section className="reservation-modal-section">
      <h3 className="reservation-modal-section-title">Equipos alquilados</h3>

      {alquileres.length ? (
        <div className="rental-list">
          {alquileres.map((item) => (
            <div className="rental-row" key={item.equipo_id}>
              <div>
                <strong>{item.equipo_nombre}</strong>
                <span>
                  {item.categoria} · {item.cantidad} x ${item.precio_alquiler.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="rental-row-actions">
                <strong>${item.subtotal.toLocaleString('es-CO')}</strong>
                <button
                  className="btn btn-sm btn-outline-danger"
                  disabled={isSaving}
                  onClick={() => void handleRemove(item.equipo_id)}
                  type="button"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-light border mb-0">Sin equipos asociados a esta reserva.</div>
      )}

      <div className="rental-form">
        <select className="form-select" onChange={(event) => setEquipoId(event.target.value)} value={equipoId}>
          <option value="">Seleccionar equipo</option>
          {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre} · stock {equipo.stock_total} · ${equipo.precio_alquiler.toLocaleString('es-CO')}
            </option>
          ))}
        </select>
        <input
          className="form-control"
          min={1}
          onChange={(event) => setCantidad(event.target.value)}
          type="number"
          value={cantidad}
        />
        <button className="btn btn-outline-primary" disabled={!selectedEquipo || isSaving} onClick={() => void handleAdd()} type="button">
          {isSaving ? 'Guardando...' : 'Agregar'}
        </button>
      </div>

      <div className="rental-total">
        <span>Total alquileres</span>
        <strong>${totalAlquileres.toLocaleString('es-CO')}</strong>
      </div>
    </section>
  );
}

export default ReservaAlquileresPanel;
