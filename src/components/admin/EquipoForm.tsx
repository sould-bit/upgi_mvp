import { useState } from 'react';
import type { Equipo, EquipoCategoria, EquipoCreatePayload } from '../../types';

interface EquipoFormProps {
  mode: 'create' | 'edit';
  initial?: Partial<Equipo>;
  isSubmitting: boolean;
  onSubmit: (payload: EquipoCreatePayload) => void;
  onCancel?: () => void;
}

const CATEGORIAS: EquipoCategoria[] = ['Raquetas', 'Pelotas', 'Accesorios', 'Iluminacion', 'Redes'];

function EquipoForm({ mode, initial, isSubmitting, onSubmit, onCancel }: EquipoFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [categoria, setCategoria] = useState<EquipoCategoria>(initial?.categoria ?? 'Raquetas');
  const [precioAlquiler, setPrecioAlquiler] = useState(String(initial?.precio_alquiler ?? ''));
  const [stockTotal, setStockTotal] = useState(String(initial?.stock_total ?? ''));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const precio = Number(precioAlquiler);
    const stock = Number(stockTotal);

    if (!nombre.trim() || !precio || precio <= 0 || Number.isNaN(stock) || stock < 0) {
      return;
    }

    onSubmit({
      nombre: nombre.trim(),
      categoria,
      precio_alquiler: precio,
      stock_total: stock
    });
  };

  return (
    <form className="row g-3 mb-4" onSubmit={handleSubmit}>
      <div className="col-md-3">
        <input
          className="form-control"
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Nombre del equipo"
          required
          value={nombre}
        />
      </div>
      <div className="col-md-2">
        <select
          className="form-select"
          onChange={(event) => setCategoria(event.target.value as EquipoCategoria)}
          value={categoria}
        >
          {CATEGORIAS.map((categoriaItem) => (
            <option key={categoriaItem} value={categoriaItem}>
              {categoriaItem}
            </option>
          ))}
        </select>
      </div>
      <div className="col-md-2">
        <input
          className="form-control"
          min="1"
          onChange={(event) => setPrecioAlquiler(event.target.value)}
          placeholder="Precio por dia"
          required
          type="number"
          value={precioAlquiler}
        />
      </div>
      <div className="col-md-2">
        <input
          className="form-control"
          min="0"
          onChange={(event) => setStockTotal(event.target.value)}
          placeholder="Stock"
          required
          type="number"
          value={stockTotal}
        />
      </div>
      <div className="col-md-3 d-flex gap-2">
        <button className="btn btn-primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear equipo' : 'Guardar cambios'}
        </button>
        {onCancel ? (
          <button className="btn btn-outline-secondary" onClick={onCancel} type="button">
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default EquipoForm;
