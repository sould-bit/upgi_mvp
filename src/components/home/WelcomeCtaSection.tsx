import { Link } from 'react-router-dom';

function WelcomeCtaSection() {
  return (
    // CTA para llevar al usuario al login o a reservas.
    <section className="welcome-cta-section">
      <div className="container cta-panel">
        <div>
          <span className="eyebrow">WelcomeCtaSection</span>
          <h2>Bienvenido a UPGI</h2>
          <p>
            Accede al sistema para revisar historial, pagos y disponibilidad o reserva tu
            cancha de inmediato.
          </p>
        </div>

        <div className="cta-actions">
          <Link className="btn btn-primary rounded-pill px-4" to="/login">
            Iniciar sesion
          </Link>
          <Link className="btn btn-light rounded-pill px-4" to="/reservas">
            Reservar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WelcomeCtaSection;
