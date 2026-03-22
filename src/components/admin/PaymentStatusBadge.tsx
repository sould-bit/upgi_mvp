import type { PaymentStatus } from '../../types';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  // Convertimos el texto del estado en una clase CSS valida.
  return <span className={`payment-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`}>{status}</span>;
}

export default PaymentStatusBadge;
