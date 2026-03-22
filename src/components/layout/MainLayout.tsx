import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

function MainLayout() {
  return (
    // Layout principal para las paginas publicas.
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        {/* Outlet pinta la pagina segun la ruta actual */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
