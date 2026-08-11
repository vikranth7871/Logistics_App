import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import toast from 'react-hot-toast';
import {
  DashboardIcon,
  MapPinIcon,
  DollarIcon,
  FuelIcon,
  UsersIcon,
  TruckIcon,
  LogOutIcon,
  BellIcon,
} from '@components/common/Icons';
import { NotificationBellButton } from '@components/notifications/NotificationPanel';

const DRIVER_NAV = [
  { label: 'My Dashboard', icon: <DashboardIcon size={18} />, to: '/driver/dashboard' },
  { label: 'My Trips', icon: <MapPinIcon size={18} />, to: '/driver/trips' },
  { label: 'My Expenses', icon: <DollarIcon size={18} />, to: '/driver/expenses' },
  { label: 'My Fuel Log', icon: <FuelIcon size={18} />, to: '/driver/fuel' },
  { label: 'My Profile', icon: <UsersIcon size={18} />, to: '/driver/profile' },
];

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/driver/dashboard': { title: 'My Dashboard', sub: 'Your personal trip & performance overview' },
  '/driver/trips': { title: 'My Trips', sub: 'Trips assigned to you' },
  '/driver/expenses': { title: 'My Expenses', sub: 'Your trip expense claims' },
  '/driver/fuel': { title: 'My Fuel Log', sub: 'Fuel entries for your vehicle' },
  '/driver/profile': { title: 'My Profile', sub: 'Your driver profile & license details' },
};

export default function DriverLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const pageInfo = PAGE_TITLES[pathname] || { title: 'Driver Portal', sub: '' };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'D';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TruckIcon size={22} color="var(--color-primary)" />
          </div>
          <div>
            <div className="sidebar-logo-text">Driver Portal</div>
            <div className="sidebar-logo-sub">Lorry Fleet ERP</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" role="navigation" aria-label="Driver navigation">
          <div className="nav-section-label">My Work</div>
          {DRIVER_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={handleLogout}
            title="Click to logout"
            role="button"
            id="sidebar-logout-btn"
            style={{ cursor: 'pointer' }}
          >
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>Driver</div>
            </div>
            <LogOutIcon size={16} style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{pageInfo.title}</div>
            {pageInfo.sub && <div className="topbar-breadcrumb">{pageInfo.sub}</div>}
          </div>
          <div className="topbar-actions">
            <NotificationBellButton />
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
