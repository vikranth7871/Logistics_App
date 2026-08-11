import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import toast from 'react-hot-toast';
import {
  DashboardIcon,
  TruckIcon,
  UsersIcon,
  MapPinIcon,
  FuelIcon,
  DollarIcon,
  WrenchIcon,
  BuildingIcon,
  ReceiptIcon,
  TrendingUpIcon,
  UserCheckIcon,
  SearchIcon,
  BellIcon,
  LogOutIcon,
} from '@components/common/Icons';
import React from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  roles?: string[];
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Operations',
    items: [
      { label: 'Dashboard', icon: <DashboardIcon size={18} />, to: '/dashboard' },
      { label: 'Fleet', icon: <TruckIcon size={18} />, to: '/fleet' },
      { label: 'Drivers', icon: <UsersIcon size={18} />, to: '/drivers' },
      { label: 'Trips', icon: <MapPinIcon size={18} />, to: '/trips' },
      { label: 'Fuel', icon: <FuelIcon size={18} />, to: '/fuel' },
      { label: 'Expenses', icon: <DollarIcon size={18} />, to: '/expenses' },
      { label: 'Maintenance', icon: <WrenchIcon size={18} />, to: '/maintenance' },
    ],
  },
  {
    section: 'Business',
    items: [
      { label: 'Customers', icon: <BuildingIcon size={18} />, to: '/customers' },
      { label: 'Billing', icon: <ReceiptIcon size={18} />, to: '/billing' },
      { label: 'Reports', icon: <TrendingUpIcon size={18} />, to: '/reports' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'Users', icon: <UserCheckIcon size={18} />, to: '/users', roles: ['admin'] },
      { label: 'Audit Logs', icon: <SearchIcon size={18} />, to: '/audit', roles: ['admin', 'manager'] },
    ],
  },
];

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard': { title: 'Dashboard', sub: "Today's fleet overview" },
  '/fleet': { title: 'Fleet Management', sub: 'Vehicles, documents & status' },
  '/drivers': { title: 'Driver Management', sub: 'Driver profiles & assignments' },
  '/trips': { title: 'Trip Management', sub: 'Trip lifecycle & tracking' },
  '/fuel': { title: 'Fuel Management', sub: 'Fuel entries & efficiency' },
  '/expenses': { title: 'Expense Management', sub: 'All expense records' },
  '/maintenance': { title: 'Vehicle Maintenance', sub: 'Servicing & repair logs' },
  '/customers': { title: 'Customers', sub: 'Customer profiles & balances' },
  '/billing': { title: 'Billing & Payments', sub: 'Invoices & payment tracking' },
  '/reports': { title: 'Reports & Analytics', sub: 'Revenue, expenses & performance' },
  '/users': { title: 'User Management', sub: 'Roles & access control' },
  '/audit': { title: 'Audit Logs', sub: 'System activity trail' },
};

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const pathname = window.location.pathname;
  const pageInfo = PAGE_TITLES[pathname] || { title: 'Lorry Fleet ERP', sub: '' };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <TruckIcon size={22} color="var(--color-primary)" />
          </div>
          <div>
            <div className="sidebar-logo-text">Lorry Fleet</div>
            <div className="sidebar-logo-sub">ERP System</div>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map(({ section, items }) => {
            const visibleItems = items.filter(
              (item) => !item.roles || item.roles.includes(user?.role || ''),
            );
            if (!visibleItems.length) return null;

            return (
              <div key={section}>
                <div className="nav-section-label">{section}</div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item${isActive ? ' active' : ''}`
                    }
                    id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="nav-item-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout" role="button" id="sidebar-logout-btn">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
            <LogOutIcon size={16} style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }} />
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-title">{pageInfo.title}</div>
            {pageInfo.sub && <div className="topbar-breadcrumb">{pageInfo.sub}</div>}
          </div>

          <div className="topbar-actions">
            <button className="notif-btn" id="notifications-btn" aria-label="Notifications">
              <BellIcon size={18} />
              <span className="notif-dot" />
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
