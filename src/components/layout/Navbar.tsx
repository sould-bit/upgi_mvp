import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  // Este estado abre o cierra el menu en pantallas pequeñas
  const [mobileOpen, setMobileOpen] = useState(false);

  // Cada vez que cambiamos de ruta cerramos el menu movil.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <nav className="site-navbar container">
        <Link className="brand" to="/">
          <span className="brand-mark">U</span>
          <span className="brand-copy">
            <strong>UPGI</strong>
            <small>ultimate padel</small>
          </span>
        </Link>

        <button
          aria-expanded={mobileOpen}
          aria-label="Abrir menu principal"
          className="nav-toggle"
          onClick={() => setMobileOpen((value) => !value)}
          type="button"
        >
          <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} />
        </button>

        <div className={`nav-links-wrapper ${mobileOpen ? 'is-open' : ''}`}>
          <div className="nav-links">
            {/* NavLink marca automaticamente la ruta activa */}
            <NavLink className={({ isActive }) => `nav-link-custom ${isActive ? 'is-active' : ''}`} end to="/">
              Inicio
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link-custom ${isActive ? 'is-active' : ''}`} to="/reservas">
              Reservas
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link-custom ${isActive ? 'is-active' : ''}`} to="/login">
              Login
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link-custom ${isActive ? 'is-active' : ''}`} to="/register">
              Registro
            </NavLink>
          </div>

          <Link className="btn btn-outline-primary rounded-pill px-4" to="/admin/dashboard">
            Ir al admin
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
