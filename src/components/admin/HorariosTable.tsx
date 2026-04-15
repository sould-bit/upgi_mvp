import type { EditablePaymentStatus, ScheduleRow } from '../../types';
import ReservaCell from './ReservaCell';

interface HorariosTableProps {
  rows: ScheduleRow[];
  isUpdatingPayment: (reservationId?: number) => boolean;
  isCancellingReservation: (reservationId?: number) => boolean;
  onStatusChange: (reservationId: number, status: EditablePaymentStatus) => Promise<void>;
  onCancelReservation: (reservationId: number) => Promise<void>;
  onOpenModal: (reservationId: number) => void;
  onQuickReserve: (courtName: string, time: string) => void;
}

function HorariosTable({
  rows,
  isUpdatingPayment,
  isCancellingReservation,
  onStatusChange,
  onCancelReservation,
  onOpenModal,
  onQuickReserve
}: HorariosTableProps) {
  const courtHeaders = rows[0]?.slots.map((slot) => slot.court) ?? [];

  return (
    <div className="horarios-table-wrapper">
      <table className="table horarios-admin-table align-middle mb-0">
        <thead>
          <tr>
            <th className="horarios-th-time sticky-col">Hora</th>
            {courtHeaders.map((court) => (
              <th className="horarios-th-court sticky-row" key={court}>
                {court}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            // Enriquecer cada slot con el time del padre para acciones rápidas.
            const enrichedSlots = row.slots.map((slot) => ({ ...slot, time: row.time }));

            return (
              <tr className="horarios-row" key={row.time}>
                <td className="horarios-td-time sticky-col">
                  <span className="time-label">{row.time}</span>
                </td>
                {enrichedSlots.map((slot) => (
                  <td className="horarios-td-slot" key={`${row.time}-${slot.court}`}>
                    <ReservaCell
                      isCancelling={isCancellingReservation(slot.reservationId)}
                      isUpdatingPayment={isUpdatingPayment(slot.reservationId)}
                      onCancel={onCancelReservation}
                      onOpenModal={onOpenModal}
                      onQuickReserve={onQuickReserve}
                      onStatusChange={onStatusChange}
                      slot={slot}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default HorariosTable;
