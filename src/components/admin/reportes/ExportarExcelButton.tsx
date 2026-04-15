import { useState } from 'react';
import { downloadReporteExcel } from '../../../lib/api';
import type { ReporteFiltros } from '../../../types';

interface ExportarExcelButtonProps {
  filters: ReporteFiltros;
}

function ExportarExcelButton({ filters }: ExportarExcelButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const params = new URLSearchParams({
        fecha_desde: filters.fechaDesde,
        fecha_hasta: filters.fechaHasta
      });

      if (filters.canchaId !== null) {
        params.set('cancha_id', String(filters.canchaId));
      }

      await downloadReporteExcel(params);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible descargar el archivo Excel.';
      window.alert(message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button className="btn btn-outline-success" disabled={isDownloading} onClick={() => void handleDownload()} type="button">
      {isDownloading ? (
        <>
          <span aria-hidden="true" className="spinner-border spinner-border-sm me-2" />
          Exportando...
        </>
      ) : (
        'Exportar Excel'
      )}
    </button>
  );
}

export default ExportarExcelButton;
