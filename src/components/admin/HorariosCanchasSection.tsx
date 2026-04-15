import { useState } from 'react';
import type { AdminReservation, EditablePaymentStatus, ScheduleRow } from '../../types';
import HorariosTable from './HorariosTable';
import PaymentStatusBadge from './PaymentStatusBadge';
import ReservationModal from './ReservationModal';
import StatusLegend from './StatusLegend';

interface HorariosCanchasSectionProps {
  searchTerm: string;
  rows: ScheduleRow[];
  paidReservations: AdminReservation[];
  isUpdatingPayment: (reservationId?: number) => boolean;
  isCancellingReservation: (reservationId?: number) => boolean;
  onStatusChange: (reservationId: number, status: EditablePaymentStatus) => Promise<void>;
  onCancelReservation: (reservationId: number) => Promise<void>;
  onQuickReserve?: (courtName: string, time: string) => void;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
}

function HorariosCanchasSection({
  rows,
  paidReservations,
  searchTerm,
  isUpdatingPayment,
  isCancellingReservation,
  onStatusChange,
  onCancelReservation,
  onQuickReserve,
  selectedDate,
  onSelectedDateChange
}: HorariosCanchasSectionProps) {
  // Modal de detalle de reserva.
  const [modalReservationId, setModalReservationId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRows = rows.filter((row) => {
    if (!searchTerm) {
      return true;
    }

    return (
      row.time.toLowerCase().includes(searchTerm) ||
      row.slots.some((slot) =>
        [slot.court, slot.player ?? '', slot.status].join(' ').toLowerCase().includes(searchTerm)
      )
    );
  });

  // Filtrar solo las de la fecha seleccionada para trazabilidad.
  const filteredPaidReservations = paidReservations
    .filter((reservation) => reservation.fecha === selectedDate)
    .filter((reservation) => {
      if (!searchTerm) {
        return true;
      }

      return [
        reservation.cancha.nombre ?? 'Cancha',
        reservation.usuario.nombre ?? reservation.usuario.email ?? `Reserva #${reservation.id}`,
        reservation.hora_inicio,
        reservation.hora_fin
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm);
    })
    .sort((left, right) => `${right.fecha}T${right.hora_inicio}`.localeCompare(`${left.fecha}T${left.hora_inicio}`));

  const openModal = (reservationId: number) => {
    setModalReservationId(reservationId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalReservationId(null);
  };

  // Obtener la reserva completa para el modal desde paidReservations o rows.
  const getModalReservation = (): AdminReservation | null => {
    if (!modalReservationId) {
      return null;
    }

    // Buscar en paidReservations.
    const fromPaid = paidReservations.find((r) => r.id === modalReservationId);
    if (fromPaid) {
      return fromPaid;
    }

    // Buscar en rows por reservationId.
    for (const row of rows) {
      const slot = row.slots.find((s) => s.reservationId === modalReservationId);
      if (slot && slot.player) {
        // Reconstruir un AdminReservation mínimo para el modal.
        return {
          id: slot.reservationId!,
          usuario: {
            nombre: slot.player,
            email: undefined
          },
          cancha: {
            nombre: slot.court
          },
          fecha: selectedDate,
          hora_inicio: slot.timeRangeLabel?.split(' - ')[0] ?? slot.time ?? '',
          hora_fin: slot.timeRangeLabel?.split(' - ')[1] ?? '',
          estado_pago: slot.status,
          precio_total: 0
        };
      }
    }

    return null;
  };

  const modalReservation = getModalReservation();

  return (
    <>
      <section className="panel-card">
        <div className="section-heading">
          <span className="eyebrow">Horarios CanchasSection</span>
          <h2>Ocupación por hora y cancha</h2>
          <p>Hacé click en una tarjeta para ver detalles o en + para reservar rápido.</p>
        </div>

        {/* Controles: date picker */}
        <div className="horarios-controls">
          <div className="horarios-date-picker">
            <label className="form-label mb-1" htmlFor="horarios-date">
              Día:
            </label>
            <input
              className="form-control form-control-sm"
              id="horarios-date"
              onChange={(event) => onSelectedDateChange(event.target.value)}
              type="date"
              value={selectedDate}
            />
          </div>
        </div>

          {filteredRows.length > 0 ? (
            <HorariosTable
              isCancellingReservation={isCancellingReservation}
              isUpdatingPayment={isUpdatingPayment}
              onCancelReservation={onCancelReservation}
              onOpenModal={openModal}
              onQuickReserve={onQuickReserve ?? (() => {})}
              onStatusChange={onStatusChange}
              rows={filteredRows}
            />
        ) : (
          <div className="alert alert-light border mb-0">No hay reservas para los filtros actuales.</div>
        )}

        {/* Bloque de trazabilidad */}
        <div className="paid-traceability-block">
          <h3>
            <svg fill="none" height="18" stroke="currentColor" viewBox="0 0 24 24" width="18">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Reservas pagadas — {filteredPaidReservations.length} para {selectedDate}
          </h3>
          {filteredPaidReservations.length > 0 ? (
            <div className="paid-traceability-list">
              {filteredPaidReservations.map((reservation) => (
                <article
                  className="paid-traceability-item"
                  key={reservation.id}
                  onClick={() => openModal(reservation.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      openModal(reservation.id);
                    }
                  }}
                >
                  <div className="paid-traceability-info">
                    <strong>
                      {reservation.usuario.nombre ?? reservation.usuario.email ?? `Reserva #${reservation.id}`}
                    </strong>
                    <span className="paid-traceability-meta">
                      {reservation.cancha.nombre ?? 'Cancha'} &bull; {reservation.hora_inicio.slice(0, 5)} —{' '}
                      {reservation.hora_fin.slice(0, 5)}
                    </span>
                  </div>
                  <PaymentStatusBadge status="Pagado" />
                </article>
              ))}
            </div>
          ) : (
            <div className="alert alert-light border mb-0">
              Sin reservas pagadas para este día.
            </div>
          )}
        </div>

        <StatusLegend />
      </section>

      {/* Modal de detalle */}
      <ReservationModal
        isCancelling={modalReservationId ? isCancellingReservation(modalReservationId) : false}
        isOpen={isModalOpen}
        isUpdatingPayment={modalReservationId ? isUpdatingPayment(modalReservationId) : false}
        onCancel={onCancelReservation}
        onClose={closeModal}
        onStatusChange={onStatusChange}
        reservation={modalReservation}
      />
    </>
  );
}

export default HorariosCanchasSection;
