interface DashboardWelcomeAlertProps {
  title: string;
  description: string;
}

function DashboardWelcomeAlert({ title, description }: DashboardWelcomeAlertProps) {
  // Formateamos la fecha para mostrarla bonita en espanol.
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    // Alerta superior que cambia segun el modulo.
    <section className="welcome-alert">
      <span className="eyebrow">Dashboard Welcome Alert</span>
      <h2>{title}</h2>
      <p>
        {formattedDate} | {description}
      </p>
    </section>
  );
}

export default DashboardWelcomeAlert;
