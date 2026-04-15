import { useEffect, useRef } from 'react';
import type { AdminReservation, EditablePaymentStatus } from '../../types';
import PaymentStatusBadge from './PaymentStatusBadge';

interface ReservationModalProps {
  reservation: AdminReservation | null;
  isOpen: boolean;
  isUpdatingPayment: boolean;
  isCancelling: boolean;
  onClose: () => void;
  onStatusChange: (reservationId: number, status: EditablePaymentStatus) => Promise<void>;
  onCancel: (reservationId: number) => Promise<void>;
}

const paymentStatuses: EditablePaymentStatus[] = ['Sin pagar', 'Abonado', 'Pagado'];

function ReservationModal({
  reservation,
  isOpen,
  isUpdatingPayment,
  isCancelling,
  onClose,
  onStatusChange,
  onCancel
}: ReservationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !reservation) {
    return null;
  }

  const whatsappNumber = reservation.usuario.telefono?.replace(/\D/g, '') ?? '';
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola ${reservation.usuario.nombre ?? 'cliente'}, te contactamos desde UPGI respecto a tu reserva del ${reservation.fecha} (${reservation.hora_inicio.slice(0, 5)} - ${reservation.hora_fin.slice(0, 5)}) en ${reservation.cancha.nombre ?? 'la cancha'}.`)}`
    : null;

  const handleCancel = () => {
    const confirmed = window.confirm(
      `¿Cancelar la reserva de ${reservation.usuario.nombre ?? `Reserva #${reservation.id}`} en ${reservation.cancha.nombre ?? 'Cancha'}? Esta acción no se puede deshacer.`
    );
    if (confirmed) {
      void onCancel(reservation.id);
    }
  };

  return (
    <div
      aria-hidden="true"
      className="reservation-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="reservation-modal" ref={modalRef}>
        {/* Header */}
        <div className="reservation-modal-header">
          <div>
            <h2 className="reservation-modal-title">
              Reserva: {reservation.cancha.nombre ?? 'Cancha'}
            </h2>
            <p className="reservation-modal-subtitle">
              {reservation.fecha} &bull; {reservation.hora_inicio.slice(0, 5)} — {reservation.hora_fin.slice(0, 5)}
            </p>
          </div>
          <button
            aria-label="Cerrar"
            className="btn-close reservation-modal-close"
            onClick={onClose}
            type="button"
          />
        </div>

        {/* Body */}
        <div className="reservation-modal-body">
          {/* Sección Cliente */}
          <section className="reservation-modal-section">
            <h3 className="reservation-modal-section-title">
              <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Cliente
            </h3>

            <div className="reservation-modal-client-info">
              <div className="client-avatar">
                {reservation.usuario.nombre
                  ?.split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase() ?? '')
                  .join('') || '??'}
              </div>
              <div className="client-details">
                <strong className="client-name">{reservation.usuario.nombre ?? 'Sin nombre'}</strong>
                <span className="client-email">{reservation.usuario.email ?? 'Sin email'}</span>
                {reservation.usuario.telefono ? (
                  <span className="client-phone">
                    {reservation.usuario.telefono}
                    {whatsappUrl ? (
                      <a
                        className="btn btn-sm btn-whatsapp ms-2"
                        href={whatsappUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <svg fill="currentColor" height="14" viewBox="0 0 24 24" width="14">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                      </a>
                    ) : null}
                  </span>
                ) : (
                  <span className="client-phone text-muted">Sin teléfono</span>
                )}
              </div>
            </div>
          </section>

          {/* Sección Pago */}
          <section className="reservation-modal-section">
            <h3 className="reservation-modal-section-title">
              <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              Pago
            </h3>

            <div className="reservation-payment-details">
              <div className="payment-price">
                <span className="payment-price-label">Valor de la reserva</span>
                <span className="payment-price-value">
                  ${reservation.precio_total.toLocaleString('es-CO')}
                </span>
              </div>

              <div className="payment-status-pills">
                <span className="payment-pills-label">Estado de pago:</span>
                <div className="payment-pills-group">
                  {paymentStatuses.map((status) => {
                    const isActive = reservation.estado_pago === status;
                    const isDisabled = isUpdatingPayment || isCancelling || reservation.estado_pago === 'Pagado';

                    return (
                      <button
                        key={status}
                        className={`payment-pill pill-${status.toLowerCase().replace(/\s+/g, '-')} ${isActive ? 'pill-active' : ''} ${isDisabled && !isActive ? 'pill-disabled' : ''}`}
                        disabled={isDisabled}
                        onClick={() => {
                          if (!isActive && !isDisabled) {
                            void onStatusChange(reservation.id, status);
                          }
                        }}
                        type="button"
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isUpdatingPayment ? (
                <div className="modal-feedback">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Actualizando estado de pago...
                </div>
              ) : null}
            </div>
          </section>

          {/* Sección Info adicional */}
          <section className="reservation-modal-section reservation-modal-meta">
            <div className="meta-item">
              <span className="meta-label">Cancha</span>
              <span className="meta-value">{reservation.cancha.nombre ?? 'N/A'} {reservation.cancha.tipo ? `(${reservation.cancha.tipo})` : ''}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Fecha</span>
              <span className="meta-value">{reservation.fecha}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Horario</span>
              <span className="meta-value">
                {reservation.hora_inicio.slice(0, 5)} — {reservation.hora_fin.slice(0, 5)}
              </span>
            </div>
            {reservation.created_at ? (
              <div className="meta-item">
                <span className="meta-label">Creada</span>
                <span className="meta-value">
                  {new Date(reservation.created_at).toLocaleString('es-CO')}
                </span>
              </div>
            ) : null}
          </section>
        </div>

        {/* Footer con acciones */}
        <div className="reservation-modal-footer">
          <button
            className="btn btn-danger"
            disabled={isCancelling || isUpdatingPayment || reservation.estado_pago === 'Pagado'}
            onClick={handleCancel}
            type="button"
          >
            {isCancelling ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Cancelando...
              </>
            ) : (
              <>
                <svg fill="none" height="16" stroke="currentColor" viewBox="0 0 24 24" width="16">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Cancelar Reserva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationModal;
