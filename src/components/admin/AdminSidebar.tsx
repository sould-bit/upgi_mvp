import { NavLink } from 'react-router-dom';

// Opciones del menu lateral del admin.
const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Reservas', to: '/admin/reservas' },
  { label: 'Canchas', to: '/admin/canchas' },
  { label: 'Inventario', to: '/admin/inventario' },
  { label: 'Reportes Avanzados', to: '/admin/reportes' },
  { label: 'Configuracion', to: '/admin/configuracion' }
];

function AdminSidebar() {
  return (
    // Sidebar fijo para moverse por los modulos del panel.
    <aside className="admin-sidebar">
      <div className="brand">
        <span className="brand-mark">U</span>
        <span className="brand-copy">
          <strong>UPGI</strong>
          <small>panel admin</small>
        </span>
      </div>

      <nav className="admin-sidebar-nav">
        {/* Se crea un enlace por cada item del arreglo */}
        {adminNavItems.map((item) => (
          <NavLink
            className={({ isActive }) => `admin-side-link ${isActive ? 'is-active' : ''}`}
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-help-card">
        <strong>AdminSidebar</strong>
        <p>Navegacion persistente para explorar dashboard, reservas, canchas, reportes y configuracion.</p>
      </div>
    </aside>
  );
}

export default AdminSidebar;
