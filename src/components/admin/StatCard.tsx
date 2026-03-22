import type { StatData } from '../../types';

interface StatCardProps {
  stat: StatData;
}

function StatCard({ stat }: StatCardProps) {
  return (
    // Card pequena para mostrar un KPI.
    <article className="stat-card-custom">
      <div className={`stat-icon tone-${stat.tone}`}>
        <i className={`bi bi-${stat.icon}`} />
      </div>
      <strong>{stat.value}</strong>
      <span>{stat.label}</span>
      {stat.variation ? <small>{stat.variation}</small> : null}
    </article>
  );
}

export default StatCard;
