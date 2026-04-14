import type { AdminProfile, NotificationItem } from '../../types';
import AdminSearchBox from './AdminSearchBox';
import NotificationsMenu from './NotificationsMenu';

interface AdminTopbarProps {
  notifications: NotificationItem[];
  onSearch: (value: string) => void;
  profile: AdminProfile;
}

function AdminTopbar({ notifications, onSearch, profile }: AdminTopbarProps) {
  return (
    // Barra superior del admin con buscador, alertas y perfil.
    <header className="admin-topbar">
      <AdminSearchBox onSearch={onSearch} />

      <div className="admin-topbar-actions">
        <NotificationsMenu notifications={notifications} />

        <div className="admin-profile">
          <span className="profile-avatar">{profile.initials}</span>
          <div>
            <strong>{profile.name}</strong>
            <small>{profile.role}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
