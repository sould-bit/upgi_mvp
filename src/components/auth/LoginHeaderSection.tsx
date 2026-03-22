function LoginHeaderSection() {
  return (
    // Parte visual del login para explicar para que sirve entrar al sistema.
    <section className="login-header-card">
      <span className="eyebrow">Login HeaderSection</span>
      <h1>Accede a tu cuenta y mantente al dia con tu actividad.</h1>
      <p>
        Inicia sesion para revisar historial de reservas, pagos y novedades del club desde
        una sola vista.
      </p>

      <ul className="benefit-list">
        <li>Consulta reservas activas y partidos anteriores.</li>
        <li>Valida pagos pendientes antes de tu proxima visita.</li>
        <li>Conecta este formulario luego con la API de autenticacion.</li>
      </ul>
    </section>
  );
}

export default LoginHeaderSection;
