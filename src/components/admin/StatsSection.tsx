import type { StatData } from '../../types';
import StatCard from './StatCard';

interface StatsSectionProps {
  stats: StatData[];
}

function StatsSection({ stats }: StatsSectionProps) {
  return (
    // Esta seccion agrupa todas las metricas del dashboard.
    <section>
      <div className="section-heading mb-3">
        <span className="eyebrow">StatsSection</span>
        <h2>Metricas del negocio</h2>
      </div>

      <div className="stats-grid">
        {/* Cada dato se convierte en una card */}
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}

export default StatsSection;
