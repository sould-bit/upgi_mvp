function StatusLegend() {
  return (
    // Esta leyenda ayuda a entender los colores de los estados.
    <div className="status-legend">
      <span>
        <i className="legend-dot dot-pagado" />
        Pagado (trazabilidad)
      </span>
      <span>
        <i className="legend-dot dot-abonado" />
        Abonado
      </span>
      <span>
        <i className="legend-dot dot-sin-pagar" />
        Sin pagar
      </span>
      <span>
        <i className="legend-dot dot-libre" />
        Libre
      </span>
    </div>
  );
}

export default StatusLegend;
