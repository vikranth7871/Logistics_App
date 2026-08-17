import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { useThemeStore } from '@store/theme.store';
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
  CalendarIcon,
  MaximizeIcon,
  LogOutIcon,
  PlusIcon,
  ChevronDownIcon,
  MenuIcon,
  SunIcon,
  MoonIcon,
} from '@components/common/Icons';
import { NotificationBellButton } from '@components/notifications/NotificationPanel';
import React, { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
  roles?: string[];
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Dashboard', icon: <DashboardIcon size={18} />, to: '/dashboard', roles: ['admin', 'manager', 'dispatcher', 'accountant'] },
      { label: 'Fleet', icon: <TruckIcon size={18} />, to: '/fleet', roles: ['admin', 'manager', 'dispatcher'] },
      { label: 'Drivers', icon: <UsersIcon size={18} />, to: '/drivers', roles: ['admin', 'manager', 'dispatcher'] },
      { label: 'Trips', icon: <MapPinIcon size={18} />, to: '/trips', roles: ['admin', 'manager', 'dispatcher'] },
      { label: 'Fuel', icon: <FuelIcon size={18} />, to: '/fuel', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Expenses', icon: <DollarIcon size={18} />, to: '/expenses', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Maintenance', icon: <WrenchIcon size={18} />, to: '/maintenance', roles: ['admin', 'manager'] },
    ],
  },
  {
    section: 'BUSINESS',
    items: [
      { label: 'Customers', icon: <BuildingIcon size={18} />, to: '/customers', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Billing', icon: <ReceiptIcon size={18} />, to: '/billing', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Payments', icon: <DollarIcon size={18} />, to: '/payments', roles: ['admin', 'manager', 'accountant'] },
      { label: 'Reports', icon: <TrendingUpIcon size={18} />, to: '/reports', roles: ['admin', 'manager', 'accountant'] },
    ],
  },
  {
    section: 'ADMIN',
    items: [
      { label: 'Users', icon: <UserCheckIcon size={18} />, to: '/users', roles: ['admin'] },
      { label: 'Roles & Permissions', icon: <UsersIcon size={18} />, to: '/roles', roles: ['admin'] },
      { label: 'Audit Logs', icon: <SearchIcon size={18} />, to: '/audit', roles: ['admin', 'manager'] },
      { label: 'Settings', icon: <WrenchIcon size={18} />, to: '/settings', roles: ['admin'] },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [quickAddOpen, setQuickAddOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SA';

  return (
    <div className="app-shell">
      {/* ── Topbar: Full Width across the entire top ── */}
      <header className="topbar">
        {/* Topbar Left: Logo, App Title, Chevron, Hamburger, Search */}
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {/* Logo & Title */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/dashboard')}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
                flexShrink: 0,
              }}
            >
              <TruckIcon size={20} color="#ffffff" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Lorry Fleet ERP
            </span>
          </div>
        </div>

        {/* Topbar Center: Universal Search (Cmd+K style) */}
        <div style={{ flex: 1, maxWidth: '420px', margin: '0 24px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <SearchIcon
              size={15}
              color="var(--color-text-muted)"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search anything..."
              style={{
                width: '100%',
                padding: '7px 40px 7px 34px',
                background: 'var(--color-surface2)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text)',
                fontSize: '13px',
                outline: 'none',
                transition: 'var(--transition)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/trips?search=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                color: 'var(--color-text-muted)',
              }}
            >
              ⌘K
            </span>
          </div>
        </div>

        {/* Topbar Right: Theme Switcher, Notification Bell, Calendar, Fullscreen, User Profile */}
        <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Theme Switcher Button */}
          <button
            className="topbar-icon-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              color: theme === 'dark' ? '#f59e0b' : '#ea580c',
            }}
          >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          <NotificationBellButton />

          <button
            className="topbar-icon-btn"
            title="Calendar"
            onClick={() => navigate('/trips')}
          >
            <CalendarIcon size={18} />
          </button>

          <button
            className="topbar-icon-btn"
            title="Fullscreen"
            onClick={toggleFullscreen}
          >
            <MaximizeIcon size={18} />
          </button>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setShowUserDropdown((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '4px 8px 4px 6px',
                borderRadius: '8px',
                background: 'transparent',
              }}
            >
              <div
                style={{
                  background: '#f97316',
                  color: '#fff',
                  fontWeight: 800,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
              >
                {initials}
              </div>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
                  {user?.name || 'System Admin'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
                  {user?.role === 'admin' ? 'Super Admin' : user?.role || 'Admin'}
                </span>
              </div>
              <ChevronDownIcon
                size={14}
                color="var(--color-text-muted)"
                style={{
                  transform: showUserDropdown ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                  marginLeft: '2px',
                }}
              />
            </div>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '6px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1000,
                  minWidth: '200px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {user?.name || 'System Admin'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {user?.email || 'admin@lorryerp.com'}
                  </div>
                </div>

                {/* Theme toggle row in dropdown */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {theme === 'dark' ? <SunIcon size={14} color="#f59e0b" /> : <MoonIcon size={14} color="#ea580c" />}
                    Theme: <strong style={{ textTransform: 'capitalize' }}>{theme} Mode</strong>
                  </span>
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-surface2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                    Toggle
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    navigate('/users');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <UserCheckIcon size={14} /> Profile &amp; Users
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    navigate('/settings');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <WrenchIcon size={14} /> System Settings
                </button>
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      handleLogout();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '10px 14px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <LogOutIcon size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── App Body: Sidebar & Page Content ── */}
      <div className="app-body">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
            {NAV_ITEMS.map(({ section, items }) => {
              const visibleItems = items.filter(
                (item) => !item.roles || item.roles.includes(user?.role || ''),
              );
              if (!visibleItems.length) return null;

              return (
                <div key={section} style={{ marginBottom: '14px' }}>
                  <div
                    className="nav-section-label"
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-text-dim)',
                      letterSpacing: '0.05em',
                      padding: '4px 12px 6px',
                    }}
                  >
                    {section}
                  </div>
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to !== '/fleet' && item.to !== '/trips'}
                      className={({ isActive }) =>
                        `nav-item${isActive ? ' active' : ''}`
                      }
                      id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      {!sidebarCollapsed && item.label}
                    </NavLink>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* Quick Add Section */}
          {!sidebarCollapsed && (
            <div className="quick-add-section" style={{ borderTop: '1px solid var(--color-border)', padding: '12px', marginTop: 'auto' }}>
              <div
                onClick={() => setQuickAddOpen(!quickAddOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  marginBottom: quickAddOpen ? '8px' : 0,
                }}
              >
                <span>Quick Add</span>
                <ChevronDownIcon
                  size={14}
                  style={{
                    transform: quickAddOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>
              {quickAddOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => navigate('/fleet?action=new')} className="quick-add-btn">
                    <PlusIcon size={14} /> Add Vehicle
                  </button>
                  <button onClick={() => navigate('/drivers?action=new')} className="quick-add-btn">
                    <PlusIcon size={14} /> Add Driver
                  </button>
                  <button onClick={() => navigate('/trips?action=new')} className="quick-add-btn">
                    <PlusIcon size={14} /> Create Trip
                  </button>
                  <button onClick={() => navigate('/fuel?action=new')} className="quick-add-btn">
                    <PlusIcon size={14} /> Fuel Entry
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        <div className="main-content">
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
