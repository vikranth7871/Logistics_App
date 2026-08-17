import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  SearchIcon,
  CalendarIcon,
  MaximizeIcon,
  ChevronDownIcon,
  MenuIcon,
  PlusIcon,
  FileTextIcon,
  CheckCircleIcon,
  UserCheckIcon,
} from '@components/common/Icons';
import { NotificationBellButton } from '@components/notifications/NotificationPanel';

const DRIVER_NAV = [
  { label: 'My Dashboard', icon: <DashboardIcon size={18} />, to: '/driver/dashboard' },
  { label: 'My Trips', icon: <MapPinIcon size={18} />, to: '/driver/trips' },
  { label: 'My Expenses', icon: <DollarIcon size={18} />, to: '/driver/expenses' },
  { label: 'My Fuel Log', icon: <FuelIcon size={18} />, to: '/driver/fuel' },
  { label: 'My Profile', icon: <UsersIcon size={18} />, to: '/driver/profile' },
];

export default function DriverLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(true);

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
    : 'DR';

  return (
    <div className="app-shell">
      {/* ── Topbar: Full Width across the entire top ── */}
      <header className="topbar">
        {/* Topbar Left: Logo, App Title, Driver Portal Badge, Hamburger, Search */}
        <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* Logo & Title */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => navigate('/driver/dashboard')}
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
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Lorry Fleet ERP
            </span>
          </div>

          {/* Chevron Separator */}
          <span style={{ color: 'var(--color-text-dim)', fontSize: '14px', margin: '0 2px', flexShrink: 0 }}>›</span>

          {/* Portal Scope Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '12px',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            fontSize: '11px',
            color: '#22c55e',
            fontWeight: 800,
            flexShrink: 0,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
            Driver Portal
          </div>

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title="Toggle Sidebar"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface2)',
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: '4px',
            }}
          >
            <MenuIcon size={16} />
          </button>

          {/* Global Search Input */}
          <div className="global-search" style={{ position: 'relative', width: '280px', flexShrink: 0 }}>
            <SearchIcon
              size={14}
              color="var(--color-text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search trips, fuel slips, expenses..."
              style={{
                width: '100%',
                background: 'var(--color-surface2)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '7px 38px 7px 34px',
                color: 'var(--color-text)',
                fontSize: '12px',
                outline: 'none',
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

        {/* Topbar Right: Notification Bell (8), Calendar, Fullscreen, Driver Profile Dropdown */}
        <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <NotificationBellButton />

          <button
            className="topbar-icon-btn"
            title="Assigned Schedule"
            onClick={() => navigate('/driver/trips')}
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

          {/* Driver Profile Dropdown */}
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
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  {user?.name || 'Selvam P'}
                </span>
                <span style={{ fontSize: '10px', color: '#22c55e', lineHeight: 1.2, fontWeight: 700 }}>
                  Driver (Online)
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

            {/* Dropdown Menu */}
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
                  minWidth: '180px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>{user?.name || 'Selvam P'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user?.email || 'driver@lorryerp.com'}</div>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    navigate('/driver/profile');
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
                  <UsersIcon size={14} /> My Profile &amp; License
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    navigate('/driver/trips');
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
                  <MapPinIcon size={14} /> My Assigned Trips
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderTop: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <LogOutIcon size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── App Body: Driver Sidebar & Main Content ── */}
      <div className="app-body">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav" role="navigation" aria-label="Driver navigation">
            <div style={{ marginBottom: '14px' }}>
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
                MY WORK
              </div>
              {DRIVER_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  id={`nav-driver-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  {!sidebarCollapsed && item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Quick Actions Section */}
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
                <span>Driver Quick Actions</span>
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
                  <button onClick={() => navigate('/driver/fuel')} className="quick-add-btn">
                    <PlusIcon size={14} /> Log Fuel Slip
                  </button>
                  <button onClick={() => navigate('/driver/expenses')} className="quick-add-btn">
                    <PlusIcon size={14} /> Log Toll / Expense
                  </button>
                  <button onClick={() => navigate('/driver/trips')} className="quick-add-btn">
                    <MapPinIcon size={14} /> Active Trip GPS
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Driver Page Content */}
        <div className="main-content">
          <main className="page-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
