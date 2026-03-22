import type { NotificationItem } from '../../types';
import AdminSearchBox from './AdminSearchBox';
import NotificationsMenu from './NotificationsMenu';

interface AdminTopbarProps {
  notifications: NotificationItem[];
  onSearch: (value: string) => void;
}

function AdminTopbar({ notifications, onSearch }: AdminTopbarProps) {
  return (
    // Barra superior del admin con buscador, alertas y perfil.
    <header className="admin-topbar">
      <AdminSearchBox onSearch={onSearch} />

      <div className="admin-topbar-actions">
        <NotificationsMenu notifications={notifications} />

        <div className="admin-profile">
          <span className="profile-avatar">AU</span>
          <div>
            <strong>Admin UPGI</strong>
            <small>Administrador</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
