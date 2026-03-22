import { useState } from 'react';
import type { NotificationItem } from '../../types';

interface NotificationsMenuProps {
  notifications: NotificationItem[];
}

function NotificationsMenu({ notifications }: NotificationsMenuProps) {
  // Controla si el menu esta abierto o cerrado.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notifications-menu">
      <button
        aria-expanded={isOpen}
        className="icon-button notifications-trigger"
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <i className="bi bi-bell" />
        <span className="notification-count">{notifications.length}</span>
      </button>

      {isOpen ? (
        <div className="notifications-panel">
          <div className="notifications-header">
            <strong>Notifications Menu</strong>
            <small>{notifications.length} alertas</small>
          </div>

          // Se pinta una tarjeta por cada notificacion.
          {notifications.map((item) => (
            <article className="notification-item-card" key={item.id}>
              <span className={`notification-tone tone-${item.tone}`}>
                <i
                  className={`bi ${
                    item.tone === 'success'
                      ? 'bi-check2-circle'
                      : item.tone === 'warning'
                        ? 'bi-exclamation-triangle'
                        : 'bi-info-circle'
                  }`}
                />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationsMenu;
