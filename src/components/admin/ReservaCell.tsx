import type { CourtSlot } from '../../types';
import PaymentStatusBadge from './PaymentStatusBadge';

interface ReservaCellProps {
  slot: CourtSlot;
}

function ReservaCell({ slot }: ReservaCellProps) {
  // Si el espacio esta libre no mostramos jugador ni badge.
  if (slot.status === 'Libre') {
    return <span className="free-slot">Libre</span>;
  }

  return (
    // Si ya esta ocupado mostramos el nombre y el estado de pago.
    <div className="reservation-cell">
      <strong>{slot.player}</strong>
      <PaymentStatusBadge status={slot.status} />
    </div>
  );
}

export default ReservaCell;
