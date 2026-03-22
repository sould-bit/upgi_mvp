function Footer() {
  return (
    // Footer sencillo con datos de contacto y parte legal.
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">U</span>
            <span className="brand-copy">
              <strong>UPGI</strong>
              <small>ultimate padel</small>
            </span>
          </div>
          <p className="footer-copy">
            Plataforma academica para gestionar reservas, clientes y operaciones del club.
          </p>
        </div>

        <div>
          <h5>Contacto</h5>
          <p>info@upgi.com</p>
          <p>+57 300 000 0000</p>
        </div>

        <div>
          <h5>Legal</h5>
          <p>Terminos de servicio</p>
          <p>Politica de privacidad</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
