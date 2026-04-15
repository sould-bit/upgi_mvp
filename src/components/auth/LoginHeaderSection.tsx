type AuthHeaderMode = 'login' | 'register';

interface LoginHeaderSectionProps {
  mode?: AuthHeaderMode;
}

function LoginHeaderSection({ mode = 'login' }: LoginHeaderSectionProps) {
  const isRegisterMode = mode === 'register';

  return (
    // Parte visual del login para explicar para que sirve entrar al sistema.
    <section className="login-header-card">
      <span className="eyebrow">{isRegisterMode ? 'Register HeaderSection' : 'Login HeaderSection'}</span>
      <h1>
        {isRegisterMode
          ? 'Crea tu cuenta y empeza a gestionar tus reservas en minutos.'
          : 'Accede a tu cuenta y mantente al dia con tu actividad.'}
      </h1>
      <p>
        {isRegisterMode
          ? 'Registrate para operar con datos reales, reservar canchas y seguir tu actividad desde una sola vista.'
          : 'Inicia sesion para revisar historial de reservas, pagos y novedades del club desde una sola vista.'}
      </p>

      <ul className="benefit-list">
        {isRegisterMode ? (
          <>
            <li>Activa tu cuenta para reservar canchas con disponibilidad real.</li>
            <li>Guarda tus datos para agilizar cada nueva reserva.</li>
            <li>Inicia sesion despues del registro para ingresar al flujo completo.</li>
          </>
        ) : (
          <>
            <li>Consulta reservas activas y partidos anteriores.</li>
            <li>Valida pagos pendientes antes de tu proxima visita.</li>
            <li>Registrate o inicia sesion para operar reservas reales contra la API.</li>
          </>
        )}
      </ul>
    </section>
  );
}

export default LoginHeaderSection;
