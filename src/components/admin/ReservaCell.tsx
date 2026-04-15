import type { CourtSlot, EditablePaymentStatus } from '../../types';
import PaymentStatusBadge from './PaymentStatusBadge';

interface ReservaCellProps {
  slot: CourtSlot;
  isUpdatingPayment?: boolean;
  isCancelling?: boolean;
  onStatusChange?: (reservationId: number, status: EditablePaymentStatus) => Promise<void>;
  onCancel?: (reservationId: number) => Promise<void>;
  onOpenModal?: (reservationId: number) => void;
  onQuickReserve?: (courtName: string, time: string) => void;
}

function ReservaCell({
  slot,
  isUpdatingPayment = false,
  isCancelling = false,
  onOpenModal,
  onQuickReserve
}: ReservaCellProps) {
  const reservationId = slot.reservationId;
  const isRangeContinuation = slot.isRangeStart === false;

  // Celda libre — botón rápido de reservar.
  if (slot.status === 'Libre') {
    return (
      <div className="reservation-cell reservation-cell--free">
        <button
          className="quick-reserve-btn"
          onClick={() => {
            if (onQuickReserve && slot.time) {
              onQuickReserve(slot.court, slot.time);
            }
          }}
          title={`Reservar ${slot.court} a las ${slot.time ?? slot.court}`}
          type="button"
        >
          <svg fill="none" height="20" stroke="currentColor" viewBox="0 0 24 24" width="20">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          Reservar
        </button>
      </div>
    );
  }

  // Continuación de rango horario — sin repetir info.
  if (isRangeContinuation) {
    return (
      <div className="reservation-cell reservation-cell--continuation">
        <span className="continuation-line" />
      </div>
    );
  }

  // Card de reserva ocupada — click abre modal.
  return (
    <div
      className={`reservation-card reservation-card--${slot.status.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={() => {
        if (reservationId && onOpenModal) {
          onOpenModal(reservationId);
        }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if ((event.key === 'Enter' || event.key === ' ') && reservationId && onOpenModal) {
          onOpenModal(reservationId);
        }
      }}
    >
      {/* Cabecera: hora */}
      <div className="reservation-card-header">
        <svg fill="none" height="12" stroke="currentColor" viewBox="0 0 24 24" width="12">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
        <span>{slot.timeRangeLabel ?? slot.time}</span>
      </div>

      {/* Cuerpo: nombre + badge */}
      <div className="reservation-card-body">
        <strong className="reservation-card-player">{slot.player ?? 'Cliente'}</strong>
        <PaymentStatusBadge status={slot.status as import('../../types').PaymentStatus} />
      </div>

      {/* Pie: acciones rápidas */}
      <div className="reservation-card-footer">
        <button
          aria-label="Ver detalles"
          className="card-action-btn"
          onClick={(event) => {
            event.stopPropagation();
            if (reservationId && onOpenModal) {
              onOpenModal(reservationId);
            }
          }}
          title="Ver detalles"
          type="button"
        >
          <svg fill="none" height="14" stroke="currentColor" viewBox="0 0 24 24" width="14">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Feedback inline */}
      {isUpdatingPayment || isCancelling ? (
        <div className="reservation-card-feedback">
          {isUpdatingPayment ? 'Actualizando...' : 'Cancelando...'}
        </div>
      ) : null}
    </div>
  );
}

export default ReservaCell;
