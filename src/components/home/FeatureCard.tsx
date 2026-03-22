import type { Feature } from '../../types';

interface FeatureCardProps {
  feature: Feature;
}

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    // Esta card recibe un objeto y muestra icono, titulo y descripcion.
    <article className="feature-card-custom">
      <div className="feature-icon">
        <i className={`bi bi-${feature.icon}`} />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
    </article>
  );
}

export default FeatureCard;
