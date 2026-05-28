import { useState } from 'react';
import type { BusinessSettings } from '../../types';

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

  const handleSave = () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage('Configuración operativa guardada para esta estación.');
  };

  return (
    <section className="panel-card">
      <div className="section-heading">
        <span className="eyebrow">Configuración operativa</span>
        <h2>Parámetros básicos del negocio</h2>
        <p>
          MVP simple: guarda valores locales para que el operador explique sede, horario y moneda durante la
          capacitación sin tocar reglas críticas del backend.
        </p>
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

      <div className="d-flex align-items-center gap-3 mt-3">
        <button className="btn btn-primary" onClick={handleSave} type="button">
          Guardar configuración
        </button>
        {message ? <span className="text-success fw-bold">{message}</span> : null}
      </div>
    </section>
  );
}

export default ConfiguracionSection;
