import { useCallback, useEffect, useState } from 'react';
import {
  fetchClientesFrecuentes,
  fetchDaily,
  fetchHorariosPico,
  fetchInventarioAlquilado,
  fetchOcupacion
} from '../../../lib/api';
import type {
  ClienteFrecuenteItem,
  DailyItem,
  HorarioPicoItem,
  InventarioAlquiladoItem,
  OcupacionItem,
  ReporteFiltros
} from '../../../types';
import ClientesFrecuentesTable from './ClientesFrecuentesTable';
import ExportarExcelButton from './ExportarExcelButton';
import HorariosPicoTable from './HorariosPicoTable';
import IngresosChart from './IngresosChart';
import OcupacionChart from './OcupacionChart';
import ReporteNarrativo from './ReporteNarrativo';
import ReporteFiltrosComponent from './ReporteFiltros';

interface ReportesAvanzadosSectionProps {
  canchas: { id: number; nombre: string }[];
}

function getDefaultFilters(): ReporteFiltros {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);

  return {
    fechaDesde: start.toISOString().slice(0, 10),
    fechaHasta: end.toISOString().slice(0, 10),
    canchaId: null
  };
}

function buildParams(filters: ReporteFiltros): URLSearchParams {
  const params = new URLSearchParams({
    fecha_desde: filters.fechaDesde,
    fecha_hasta: filters.fechaHasta
  });

  if (filters.canchaId !== null) {
    params.set('cancha_id', String(filters.canchaId));
  }

  return params;
}

function ReportesAvanzadosSection({ canchas }: ReportesAvanzadosSectionProps) {
  const [filters, setFilters] = useState<ReporteFiltros>(() => getDefaultFilters());
  const [daily, setDaily] = useState<DailyItem[]>([]);
  const [ocupacion, setOcupacion] = useState<OcupacionItem[]>([]);
  const [horarios, setHorarios] = useState<HorarioPicoItem[]>([]);
  const [clientes, setClientes] = useState<ClienteFrecuenteItem[]>([]);
  const [inventario, setInventario] = useState<InventarioAlquiladoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = useCallback(async (nextFilters: ReporteFiltros) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = buildParams(nextFilters);
      const [dailyResponse, ocupacionResponse, horariosResponse, clientesResponse, inventarioResponse] = await Promise.all([
        fetchDaily(params),
        fetchOcupacion(params),
        fetchHorariosPico(params),
        fetchClientesFrecuentes(params),
        fetchInventarioAlquilado(params)
      ]);

      setDaily(dailyResponse.daily);
      setOcupacion(ocupacionResponse.ocupacion);
      setHorarios(horariosResponse.horarios);
      setClientes(clientesResponse.clientes);
      setInventario(inventarioResponse.inventario_alquilado);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible cargar los reportes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(filters);
  }, [filters, loadData]);

  const handleApply = (nextFilters: ReporteFiltros) => {
    setFilters(nextFilters);
  };

  return (
    <div className="admin-content-stack">
      <ReporteFiltrosComponent canchas={canchas} initial={filters} isLoading={isLoading} onApply={handleApply} />

      {errorMessage ? <div className="alert alert-danger mb-0">{errorMessage}</div> : null}

      <ReporteNarrativo
        clientes={clientes}
        daily={daily}
        horarios={horarios}
        inventario={inventario}
        ocupacion={ocupacion}
      />

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <IngresosChart data={daily} isLoading={isLoading} />
        </div>
        <div className="col-12 col-xl-6">
          <OcupacionChart data={ocupacion} isLoading={isLoading} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <HorariosPicoTable data={horarios} isLoading={isLoading} />
        </div>
        <div className="col-12 col-xl-6">
          <ClientesFrecuentesTable data={clientes} isLoading={isLoading} />
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <ExportarExcelButton filters={filters} />
      </div>
    </div>
  );
}

export default ReportesAvanzadosSection;
