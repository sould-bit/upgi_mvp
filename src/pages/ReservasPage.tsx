import { useState } from 'react';
import ReservaDetailsSection from '../components/reservas/ReservaDetailsSection';
import ReservaFormSection from '../components/reservas/ReservaFormSection';
import ReservasHeaderSection from '../components/reservas/ReservasHeaderSection';
import type { ReservationFormData, ReservationSummary } from '../types';

// Valores iniciales del formulario para que cargue con algo base. estos valores seran modificados una vez tengamos datos reales.
const reservationDefaults: ReservationFormData = {
  venue: '',
  court: '',
  date: '',
  startTime: '08:00',
  endTime: '09:00',
  players: 4
};

// Opciones quemadas para la demo.
const venueOptions = ['Sede Centro', 'Sede Norte', 'Sede Sur'];

const courtOptions = ['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4'];

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

// Precio por cancha para calcular el total de la reserva.
const courtRateByName: Record<string, number> = {
  'Cancha 1': 42000,
  'Cancha 2': 42000,
  'Cancha 3': 46000,
  'Cancha 4': 50000
};

function ReservasPage() {
  // Aqui guardamos lo que el usuario va escribiendo.
  const [formData, setFormData] = useState<ReservationFormData>(reservationDefaults);
  const [notice, setNotice] = useState('');

  // Este handler sirve para actualizar cualquier campo sin repetir logica.
  const handleFieldChange = <K extends keyof ReservationFormData>(
    field: K,
    value: ReservationFormData[K]
  ) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setNotice('');
  };

  // Con esto calculamos duracion y precio segun las horas seleccionadas.
  const startIndex = timeOptions.indexOf(formData.startTime);
  const endIndex = timeOptions.indexOf(formData.endTime);
  const duration = startIndex >= 0 && endIndex > startIndex ? endIndex - startIndex : 0;
  const rate = courtRateByName[formData.court] ?? 0;
  const total = duration * rate;

  // Este resumen se manda al componente del costado.
  const summary: ReservationSummary = {
    availability:
      formData.venue && formData.court && duration > 0 ? 'Disponible' : 'Completa los datos',
    durationLabel: duration > 0 ? `${duration} hora(s)` : 'No definido',
    totalPriceLabel: total > 0 ? `$${total.toLocaleString('es-CO')}` : '$0'
  };

  // Simula el envio del formulario antes de conectarlo a una API real.
  const handleSubmit = () => {
    if (!formData.venue || !formData.court || !formData.date || summary.availability !== 'Disponible') {
      setNotice('Completa la seleccion para dejar la reserva lista para enviar a la API.');
      return;
    }

    setNotice('Reserva lista. Este formulario ya esta preparado para conectarse a la base de datos.');
  };

  // Devuelve todo al estado inicial.
  const handleReset = () => {
    setFormData(reservationDefaults);
    setNotice('');
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
