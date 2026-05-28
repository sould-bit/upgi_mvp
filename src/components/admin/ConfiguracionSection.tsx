import { useEffect, useState } from 'react';
import type { BusinessSettings, ReglaPrecio } from '../../types';
import { fetchReglasPrecio, createReglaPrecio } from '../../lib/api';

const STORAGE_KEY = 'upgi-admin-settings';

const defaults: BusinessSettings = {
  sedeNombre: 'Complejo UPGI',
  horaApertura: '08:00',
  horaCierre: '23:00',
  duracionMinima: 1,
  moneda: 'COP'
};

function loadSettings(): BusinessSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

function ConfiguracionSection() {
  const [settings, setSettings] = useState<BusinessSettings>(() => loadSettings());
  const [message, setMessage] = useState('');
  const [reglas, setReglas] = useState<ReglaPrecio[]>([]);
  const [reglaForm, setReglaForm] = useState({
    nombre: '',
    tipo: 'horario_pico',
    valor: '',
    hora_inicio: '17:00',
    hora_fin: '20:00',
    es_socio: false
  });
  const [isSubmittingRegla, setIsSubmittingRegla] = useState(false);

  useEffect(() => {
    void loadReglas();
  }, []);

  const loadReglas = async () => {
    try {
      const response = await fetchReglasPrecio();
      setReglas(response.reglas);
    } catch {
      // Silent fail — pricing rules are optional.
    }
  };

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage('Configuración operativa guardada para esta estación.');
  };

  const handleCreateRegla = async () => {
    if (!reglaForm.nombre.trim() || !reglaForm.valor) return;
    setIsSubmittingRegla(true);
    try {
      await createReglaPrecio({
        nombre: reglaForm.nombre.trim(),
        tipo: reglaForm.tipo,
        valor: Number(reglaForm.valor),
        hora_inicio: reglaForm.tipo === 'horario_pico' ? reglaForm.hora_inicio : null,
        hora_fin: reglaForm.tipo === 'horario_pico' ? reglaForm.hora_fin : null,
        es_socio: reglaForm.tipo === 'descuento_socio'
      });
      setMessage('Regla de precio creada.');
      setReglaForm({ nombre: '', tipo: 'horario_pico', valor: '', hora_inicio: '17:00', hora_fin: '20:00', es_socio: false });
      await loadReglas();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error al crear regla.');
    } finally {
      setIsSubmittingRegla(false);
    }
  };

  return (
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">Configuración operativa</span>
        <h2>Parámetros básicos del negocio</h2>
        <p>Gestiona sede, horarios, moneda y reglas de precios para el operador.</p>
      </div>

      <div className="admin-config-grid">
        <label className="form-label">
          Nombre de sede
          <input
            className="form-control mt-1"
            onChange={(event) => setSettings((current) => ({ ...current, sedeNombre: event.target.value }))}
            value={settings.sedeNombre}
          />
        </label>
        <label className="form-label">
          Hora apertura
          <input
            className="form-control mt-1"
            onChange={(event) => setSettings((current) => ({ ...current, horaApertura: event.target.value }))}
            type="time"
            value={settings.horaApertura}
          />
        </label>
        <label className="form-label">
          Hora cierre
          <input
            className="form-control mt-1"
            onChange={(event) => setSettings((current) => ({ ...current, horaCierre: event.target.value }))}
            type="time"
            value={settings.horaCierre}
          />
        </label>
        <label className="form-label">
          Duración mínima (horas)
          <input
            className="form-control mt-1"
            min={1}
            onChange={(event) => setSettings((current) => ({ ...current, duracionMinima: Number(event.target.value) }))}
            type="number"
            value={settings.duracionMinima}
          />
        </label>
        <label className="form-label">
          Moneda
          <select
            className="form-select mt-1"
            onChange={(event) => setSettings((current) => ({ ...current, moneda: event.target.value }))}
            value={settings.moneda}
          >
            <option value="COP">COP</option>
            <option value="USD">USD</option>
          </select>
        </label>
      </div>

      <div className="d-flex align-items-center gap-3 mt-3 mb-4">
        <button className="btn btn-primary" onClick={handleSave} type="button">
          Guardar configuración
        </button>
        {message ? <span className="text-success fw-bold">{message}</span> : null}
      </div>

      {/* Sección de Reglas de Precio */}
      <div className="section-heading mt-4">
        <span className="eyebrow">Motor de precios</span>
        <h2>Reglas de precio</h2>
        <p>Configura incrementos por horario pico y descuentos para socios.</p>
      </div>

      <div className="admin-config-grid mb-3">
        <label className="form-label">
          Nombre
          <input
            className="form-control mt-1"
            placeholder="Ej: Horario pico"
            value={reglaForm.nombre}
            onChange={(e) => setReglaForm((prev) => ({ ...prev, nombre: e.target.value }))}
          />
        </label>
        <label className="form-label">
          Tipo
          <select
            className="form-select mt-1"
            value={reglaForm.tipo}
            onChange={(e) => setReglaForm((prev) => ({ ...prev, tipo: e.target.value }))}
          >
            <option value="horario_pico">Horario pico</option>
            <option value="descuento_socio">Descuento socio</option>
          </select>
        </label>
        <label className="form-label">
          Valor (%)
          <input
            className="form-control mt-1"
            min="1"
            max="100"
            placeholder="Ej: 50"
            type="number"
            value={reglaForm.valor}
            onChange={(e) => setReglaForm((prev) => ({ ...prev, valor: e.target.value }))}
          />
        </label>
        {reglaForm.tipo === 'horario_pico' ? (
          <>
            <label className="form-label">
              Desde
              <input
                className="form-control mt-1"
                type="time"
                value={reglaForm.hora_inicio}
                onChange={(e) => setReglaForm((prev) => ({ ...prev, hora_inicio: e.target.value }))}
              />
            </label>
            <label className="form-label">
              Hasta
              <input
                className="form-control mt-1"
                type="time"
                value={reglaForm.hora_fin}
                onChange={(e) => setReglaForm((prev) => ({ ...prev, hora_fin: e.target.value }))}
              />
            </label>
          </>
        ) : null}
      </div>
      <button
        className="btn btn-outline-primary btn-sm mb-4"
        onClick={() => void handleCreateRegla()}
        disabled={isSubmittingRegla || !reglaForm.nombre.trim() || !reglaForm.valor}
        type="button"
      >
        {isSubmittingRegla ? 'Guardando...' : 'Agregar regla'}
      </button>

      {reglas.length > 0 ? (
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Horario</th>
              <th>Socio</th>
            </tr>
          </thead>
          <tbody>
            {reglas.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                <td><span className="badge bg-info">{r.tipo}</span></td>
                <td>{r.valor}%</td>
                <td>{r.hora_inicio && r.hora_fin ? `${r.hora_inicio} - ${r.hora_fin}` : '—'}</td>
                <td>{r.es_socio ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-light border">No hay reglas de precio configuradas.</div>
      )}
    </section>
  );
}

export default ConfiguracionSection;
