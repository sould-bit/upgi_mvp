import FeatureCard from '../components/home/FeatureCard';
import HeroSection from '../components/home/HeroSection';
import WelcomeCtaSection from '../components/home/WelcomeCtaSection';
import type { Feature } from '../types';

// Estas son las ventajas que mostramos en la home.
const featureList: Feature[] = [
  {
    icon: 'calendar-check',
    title: 'Reservas inteligentes',
    description: 'Gestiona la disponibilidad de las canchas y confirma partidos en pocos pasos.'
  },
  {
    icon: 'graph-up-arrow',
    title: 'Metricas accionables',
    description: 'Visualiza KPIs del negocio y detecta rapidamente horas pico, ocupacion y pagos.'
  },
  {
    icon: 'people',
    title: 'Experiencia centralizada',
    description: 'Conecta clientes, administradores y operaciones en una sola interfaz clara.'
  }
];

function HomePage() {
  return (
    <>
      {/* Parte principal de bienvenida */}
      <HeroSection />
      <WelcomeCtaSection />

      <section className="section-shell">
        <div className="container">
          <div className="section-heading text-center">
            <span className="eyebrow">FeatureCard</span>
            <h2>Todo lo que necesitas para gestionar tu club</h2>
            <p>
              La evidencia deja cada ventaja del negocio como un componente reutilizable y
              facil de extender.
            </p>
          </div>

          <div className="row g-4">
            {/* Con map pintamos una card por cada ventaja */}
            {featureList.map((feature) => (
              <div className="col-md-4" key={feature.title}>
                <FeatureCard feature={feature} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
