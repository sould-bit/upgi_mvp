import type { ClienteFrecuenteItem } from '../../../types';

interface ClientesFrecuentesTableProps {
  data: ClienteFrecuenteItem[];
  isLoading?: boolean;
}

const copCurrency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0
});

function ClientesFrecuentesTable({ data, isLoading = false }: ClientesFrecuentesTableProps) {
  return (
    <section className="panel-card h-100">
      <div className="section-heading mb-3">
        <span className="eyebrow">Clientes frecuentes</span>
        <h2>Top clientes</h2>
      </div>

      {isLoading ? <div className="alert alert-info mb-0">Cargando clientes...</div> : null}

      {!isLoading && data.length === 0 ? (
        <div className="alert alert-light border mb-0">Sin datos</div>
      ) : null}

      {!isLoading && data.length > 0 ? (
        <div className="table-responsive">
          <table className="table admin-table align-middle mb-0">
            <thead>
              <tr>
                <th>Cliente</th>
                <th className="text-end">Reservas</th>
                <th className="text-end">Total gastado</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((item) => (
                <tr key={item.cliente_nombre}>
                  <td>{item.cliente_nombre}</td>
                  <td className="text-end">{item.total_reservas}</td>
                  <td className="text-end">{copCurrency.format(item.total_gastado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default ClientesFrecuentesTable;
