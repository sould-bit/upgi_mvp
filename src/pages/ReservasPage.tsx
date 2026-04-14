import { useEffect, useMemo, useState } from 'react';
import { ApiError, createReservation, fetchAvailability, fetchCourts } from '../lib/api';
import { getStoredSession } from '../lib/session';
import ReservaDetailsSection from '../components/reservas/ReservaDetailsSection';
import ReservaFormSection from '../components/reservas/ReservaFormSection';
import ReservasHeaderSection from '../components/reservas/ReservasHeaderSection';
import type { Court, ReservationFormData, ReservationSummary } from '../types';

// Valores iniciales del formulario para que cargue con algo base. estos valores seran modificados una vez tengamos datos reales.
const reservationDefaults: ReservationFormData = {
  venue: '',
  court: '',
  date: '',
  startTime: '08:00',
  endTime: '09:00',
  players: 4
};

const venueOptions = ['Complejo UPGI'];

// Horarios posibles para escoger inicio y fin.
const timeOptions = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00'
];

function ReservasPage() {
  const session = getStoredSession();
  const [formData, setFormData] = useState<ReservationFormData>(reservationDefaults);
  const [courts, setCourts] = useState<Court[]>([]);
  const [notice, setNotice] = useState('');
  const [isLoadingCourts, setIsLoadingCourts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('Elegí una cancha, fecha y horario para consultar disponibilidad.');
  const [availabilityPrice, setAvailabilityPrice] = useState<number | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCourts = async () => {
      try {
        const response = await fetchCourts();

        if (!isMounted) {
          return;
        }

        const activeCourts = response.canchas.filter((court) => court.is_active);
        setCourts(activeCourts);
        setFormData((current) => ({
          ...current,
          venue: current.venue || venueOptions[0]
        }));
      } catch (error) {
        if (isMounted) {
          setNotice(error instanceof Error ? error.message : 'No fue posible cargar las canchas.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCourts(false);
        }
      }
    };

    void loadCourts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = <K extends keyof ReservationFormData>(
    field: K,
    value: ReservationFormData[K]
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setNotice('');
  };

  const selectedCourt = useMemo(
    () => courts.find((court) => court.nombre === formData.court) ?? null,
    [courts, formData.court]
  );

  const courtOptions = useMemo(() => courts.map((court) => court.nombre), [courts]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedCourt || !formData.date || !formData.startTime || !formData.endTime) {
        setIsAvailable(false);
        setAvailabilityPrice(null);
        setAvailabilityMessage('Elegí una cancha, fecha y horario para consultar disponibilidad.');
        return;
      }

      if (timeOptions.indexOf(formData.endTime) <= timeOptions.indexOf(formData.startTime)) {
        setIsAvailable(false);
        setAvailabilityPrice(null);
        setAvailabilityMessage('La hora final debe ser mayor a la hora inicial.');
        return;
      }

      try {
        const params = new URLSearchParams({
          fecha: formData.date,
          hora_inicio: `${formData.startTime}:00`,
          hora_fin: `${formData.endTime}:00`
        });
        const response = await fetchAvailability(selectedCourt.id, params);
        setIsAvailable(response.disponible);
        setAvailabilityPrice(response.precio_total ?? null);
        setAvailabilityMessage(response.mensaje ?? (response.disponible ? 'Disponible' : 'No disponible'));
      } catch (error) {
        setIsAvailable(false);
        setAvailabilityPrice(null);
        setAvailabilityMessage(error instanceof Error ? error.message : 'No se pudo consultar disponibilidad.');
      }
    };

    void checkAvailability();
  }, [formData.date, formData.endTime, formData.startTime, selectedCourt]);

  const startIndex = timeOptions.indexOf(formData.startTime);
  const endIndex = timeOptions.indexOf(formData.endTime);
  const duration = startIndex >= 0 && endIndex > startIndex ? endIndex - startIndex : 0;
  const rate = selectedCourt?.precio_hora ?? 0;
  const total = duration * rate;

  const summary: ReservationSummary = {
    availability: availabilityMessage,
    durationLabel: duration > 0 ? `${duration} hora(s)` : 'No definido',
    totalPriceLabel: `$${(availabilityPrice ?? total).toLocaleString('es-CO')}`
  };

  const handleSubmit = async () => {
    if (!selectedCourt || !formData.venue || !formData.date || !isAvailable) {
      setNotice('Completá la selección y validá disponibilidad antes de enviar la reserva.');
      return;
    }

    if (!session?.accessToken) {
      setNotice('Primero iniciá sesión para registrar la reserva en la API.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReservation({
        cancha_id: selectedCourt.id,
        fecha: formData.date,
        hora_inicio: `${formData.startTime}:00`,
        hora_fin: `${formData.endTime}:00`,
        jugadores: formData.players
      });

      setNotice(`${response.message} Reserva #${response.reserva.id} registrada correctamente.`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setNotice('Tu sesión no es válida o venció. Volvé a iniciar sesión.');
      } else {
        setNotice(error instanceof Error ? error.message : 'No fue posible crear la reserva.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(reservationDefaults);
    setNotice('');
    setAvailabilityPrice(null);
    setAvailabilityMessage('Elegí una cancha, fecha y horario para consultar disponibilidad.');
    setIsAvailable(false);
  };

  return (
    <>
      <ReservasHeaderSection />

      <section className="section-shell">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-7">
              {/* Formulario principal */}
              <ReservaFormSection
                courtOptions={courtOptions}
                formData={formData}
                onFieldChange={handleFieldChange}
                onReset={handleReset}
                onSubmit={handleSubmit}
                timeOptions={timeOptions}
                venueOptions={venueOptions}
              />

              {isLoadingCourts ? <div className="alert alert-secondary mt-3">Cargando canchas desde la API...</div> : null}
              {!session?.accessToken ? (
                <div className="alert alert-warning mt-3">Iniciá sesión para poder confirmar reservas contra la API.</div>
              ) : null}
              {isSubmitting ? <div className="alert alert-info mt-3">Registrando reserva en la API...</div> : null}
              {notice ? <div className="alert alert-info mt-3">{notice}</div> : null}
            </div>

            <div className="col-lg-5">
              {/* Resumen de lo que va escogiendo el usuario */}
              <ReservaDetailsSection formData={formData} summary={summary} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ReservasPage;
