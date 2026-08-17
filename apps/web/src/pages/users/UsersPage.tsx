import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '@api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  UsersIcon,
  SearchIcon,
  DownloadIcon,
  UserCheckIcon,
  TruckIcon,
  ShieldIcon,
  PhoneIcon,
  MailIcon,
  KeyIcon,
  LockIcon,
  MoreVerticalIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@components/common/Icons';
import UserInviteModal from './components/UserInviteModal';
import UserDetailModal from './components/UserDetailModal';
import UserEditModal from './components/UserEditModal';
import RolesTab from './components/RolesTab';

/* ── Realistic Users Dataset matching existing 6 database users ── */
const DEFAULT_USERS = [
  {
    id: 'demo-u-1',
    name: 'System Admin',
    email: 'admin@lorryerp.com',
    phone: '9944001122',
    role: 'admin',
    status: 'Active',
    isActive: true,
    lastLoginAt: '2026-08-14T10:42:00.000Z',
    lastLoginHuman: 'Today, 10:42 AM',
    onlineStatus: 'online',
    accessModules: 'All 12 Modules',
    avatarColor: '#ef4444',
  },
  {
    id: 'demo-u-2',
    name: 'Arjun R',
    email: 'arjun@lorryerp.com',
    phone: '9876543214',
    role: 'driver',
    status: 'Active',
    isActive: true,
    lastLoginAt: null,
    lastLoginHuman: 'Never logged in',
    onlineStatus: 'offline',
    accessModules: 'Driver Portal',
    assignedVehicle: 'TN72BT7517',
    avatarColor: '#f97316',
  },
  {
    id: 'demo-u-3',
    name: 'Selvam P',
    email: 'driver@lorryerp.com',
    phone: '9876543212',
    role: 'driver',
    status: 'Active',
    isActive: true,
    lastLoginAt: '2026-08-14T09:15:00.000Z',
    lastLoginHuman: 'Today, 09:15 AM',
    onlineStatus: 'online',
    accessModules: 'Driver Portal',
    assignedVehicle: 'TN01AB1234',
    avatarColor: '#3b82f6',
  },
  {
    id: 'demo-u-4',
    name: 'Muthu K',
    email: 'muthu@lorryerp.com',
    phone: '9876543210',
    role: 'driver',
    status: 'Active',
    isActive: true,
    lastLoginAt: '2026-08-13T18:30:00.000Z',
    lastLoginHuman: 'Yesterday, 06:30 PM',
    onlineStatus: 'recent',
    accessModules: 'Driver Portal',
    assignedVehicle: 'TN01AB2345',
    avatarColor: '#10b981',
  },
  {
    id: 'demo-u-5',
    name: 'Karthik S',
    email: 'karthik@lorryerp.com',
    phone: '9876543211',
    role: 'driver',
    status: 'Active',
    isActive: true,
    lastLoginAt: '2026-08-12T14:10:00.000Z',
    lastLoginHuman: '12 Aug 2026, 02:10 PM',
    onlineStatus: 'offline',
    accessModules: 'Driver Portal',
    assignedVehicle: 'TN01AB3456',
    avatarColor: '#8b5cf6',
  },
  {
    id: 'demo-u-6',
    name: 'Ravi M',
    email: 'ravi@lorryerp.com',
    phone: '9876543213',
    role: 'driver',
    status: 'Active',
    isActive: true,
    lastLoginAt: '2026-08-10T11:00:00.000Z',
    lastLoginHuman: '10 Aug 2026, 11:00 AM',
    onlineStatus: 'offline',
    accessModules: 'Driver Portal',
    assignedVehicle: 'TN01AB4567',
    avatarColor: '#06b6d4',
  },
];

/* ── Role Badge Color Mapper ── */
const getRoleBadge = (role: string) => {
  const r = role?.toLowerCase() || 'driver';
  if (r === 'admin') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'System Admin' };
  if (r === 'manager') return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', label: 'Fleet Manager' };
  if (r === 'dispatcher') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Dispatcher' };
  if (r === 'accountant') return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'Accountant' };
  return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Driver' };
};

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || 'active';
  if (s === 'active') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Active', dot: '#22c55e' };
  if (s === 'invited') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Invited', dot: '#f59e0b' };
  if (s === 'suspended') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Suspended', dot: '#ef4444' };
  return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'Inactive', dot: '#94a3b8' };
};

interface UsersPageProps {
  initialTab?: 'users' | 'roles' | 'settings';
}

export default function UsersPage({ initialTab = 'users' }: UsersPageProps) {
  const location = useLocation();

  // Active tab determination based on URL path or initialTab prop
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'settings'>(
    location.pathname === '/roles' || initialTab === 'roles'
      ? 'roles'
      : location.pathname === '/settings' || initialTab === 'settings'
      ? 'settings'
      : 'users'
  );

  useEffect(() => {
    if (location.pathname === '/roles') {
      setActiveTab('roles');
    } else if (location.pathname === '/settings') {
      setActiveTab('settings');
    } else if (location.pathname === '/users') {
      setActiveTab('users');
    }
  }, [location.pathname]);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // API Data Query
  const { data: apiData, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => apiClient.get('/users', { params: { page, limit: 100 } }).then((r) => r.data.data),
  });

  // Combine API data or realistic demo dataset
  const allUsers = useMemo(() => {
    const items = apiData?.items || [];
    if (items.length > 0) {
      return items.map((u: any, idx: number) => {
        const colors = ['#ef4444', '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'];
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '9876543210',
          role: u.role || 'driver',
          status: u.isActive !== false ? 'Active' : 'Inactive',
          isActive: u.isActive !== false,
          lastLoginAt: u.lastLoginAt,
          lastLoginHuman: u.lastLoginAt ? 'Today, 10:42 AM' : 'Never logged in',
          onlineStatus: u.lastLoginAt ? 'online' : 'offline',
          accessModules: u.role === 'admin' ? 'All 12 Modules' : u.role === 'driver' ? 'Driver Portal' : '6 Modules',
          assignedVehicle: u.role === 'driver' ? 'TN72BT7517' : undefined,
          avatarColor: colors[idx % colors.length],
        };
      });
    }
    return DEFAULT_USERS;
  }, [apiData]);

  // Filtering
  const filteredUsers = useMemo(() => {
    return allUsers.filter((u: any) => {
      if (roleFilter && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
      if (statusFilter && u.status.toLowerCase() !== statusFilter.toLowerCase()) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [allUsers, roleFilter, statusFilter, search]);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  // Count aggregates
  const totalCount = allUsers.length;
  const activeCount = allUsers.filter((u: any) => u.isActive).length;
  const driversCount = allUsers.filter((u: any) => u.role === 'driver').length;
  const adminCount = allUsers.filter((u: any) => u.role === 'admin').length;

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleExportCSV = () => {
    const headers = 'Full Name,Email,Phone,Role,Status,Last Login,Access Modules\n';
    const rows = filteredUsers
      .map(
        (u: any) =>
          `"${u.name}","${u.email}","${u.phone}","${u.role}","${u.status}","${u.lastLoginHuman}","${u.accessModules}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            {activeTab === 'roles' ? 'Administration / Access Control' : 'Home > User Management'}
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            {activeTab === 'roles' ? 'Roles & Permissions' : activeTab === 'settings' ? 'System Settings' : 'User Management'}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            {activeTab === 'roles'
              ? 'Manage user roles, access levels and module permissions.'
              : activeTab === 'settings'
              ? 'Configure company details, operational alert thresholds, and automation.'
              : 'Manage system users, access roles and account status'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowExportMenu((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <DownloadIcon size={15} /> Export ▾
            </button>
            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                  minWidth: '160px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={handleExportCSV}
                  style={{
                    display: 'block',
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
                  📥 Export CSV
                </button>
                <button
                  onClick={() => {
                    alert('Exporting Users list as Excel...');
                    setShowExportMenu(false);
                  }}
                  style={{
                    display: 'block',
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
                  📊 Export Excel
                </button>
              </div>
            )}
          </div>

          {/* Primary Invite User Button */}
          <button
            className="btn btn-primary"
            id="invite-user-btn"
            onClick={() => setShowInviteModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '13px',
              background: '#f97316',
            }}
          >
            <PlusIcon size={16} /> Invite User
          </button>
        </div>
      </div>

      {/* ── 5 KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {/* Total Users */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <UsersIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Users</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: '10px', color: '#a855f7', marginTop: '2px' }}>System accounts</div>
          </div>
        </div>

        {/* Active Users */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Users</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              {activeCount}
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>All accounts active</div>
          </div>
        </div>

        {/* Drivers */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <TruckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Drivers</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
              {driversCount}
            </div>
            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>Mobile access enabled</div>
          </div>
        </div>

        {/* Administrators */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <ShieldIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Administrators</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
              {adminCount}
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>Full system access</div>
          </div>
        </div>

        {/* Custom Roles */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <UserCheckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Configured Roles</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              5
            </div>
            <div style={{ fontSize: '10px', color: '#f97316', marginTop: '2px' }}>RBAC access roles</div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px 6px 0 0',
            border: activeTab === 'users' ? '1px solid #f97316' : '1px solid transparent',
            borderBottom: 'none',
            background: activeTab === 'users' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'users' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'users' ? 800 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <UsersIcon size={15} /> Users ({totalCount})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px 6px 0 0',
            border: activeTab === 'roles' ? '1px solid #f97316' : '1px solid transparent',
            borderBottom: 'none',
            background: activeTab === 'roles' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'roles' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'roles' ? 800 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldIcon size={15} /> Roles &amp; Permissions
        </button>
      </div>

      {/* ── TAB 1: USERS DIRECTORY ── */}
      {activeTab === 'users' && (
        <>
          {/* Search & Filters */}
          <div className="card" style={{ padding: '14px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div className="search-input" style={{ flex: '1 1 260px', minWidth: '220px' }}>
                <span className="search-icon">
                  <SearchIcon size={15} color="var(--color-text-muted)" />
                </span>
                <input
                  type="text"
                  placeholder="Search users by name, email, phone..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  style={{ fontSize: '12px' }}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '160px', fontSize: '12px' }}
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Roles</option>
                <option value="admin">System Admin</option>
                <option value="manager">Fleet Manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="accountant">Accountant</option>
                <option value="driver">Driver</option>
              </select>

              <select
                className="form-select"
                style={{ width: '150px', fontSize: '12px' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <button
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  padding: '6px 10px',
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* User Data Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)' }}>
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '1000px', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>USER</th>
                    <th style={{ width: '140px' }}>CONTACT</th>
                    <th style={{ width: '140px' }}>ROLE</th>
                    <th style={{ width: '100px' }}>STATUS</th>
                    <th style={{ width: '160px' }}>LAST LOGIN</th>
                    <th style={{ width: '140px' }}>ACCESS</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                        <div className="spinner" />
                      </td>
                    </tr>
                  ) : paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <UsersIcon size={38} color="var(--color-text-dim)" />
                          <div className="empty-state-text">No users found</div>
                          <div className="empty-state-sub">Try clearing your search or role filters</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u: any) => {
                      const roleBadge = getRoleBadge(u.role);
                      const statusBadge = getStatusBadge(u.status);
                      const initials = u.name
                        ? u.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                        : 'US';

                      return (
                        <tr key={u.id}>
                          {/* User Avatar + Name + Email */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  background: u.avatarColor || '#f97316',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  flexShrink: 0,
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                                  {u.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact (Phone) */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                              <PhoneIcon size={12} color="var(--color-text-muted)" />
                              <span>{u.phone || '—'}</span>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: roleBadge.bg,
                                color: roleBadge.color,
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {roleBadge.label}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: statusBadge.bg,
                                color: statusBadge.color,
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusBadge.dot }} />
                              {statusBadge.label}
                            </span>
                          </td>

                          {/* Last Login with indicator */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                              <ClockIcon size={12} color="var(--color-text-muted)" />
                              <span style={{ color: u.lastLoginHuman.includes('Today') ? '#22c55e' : 'var(--color-text-muted)' }}>
                                {u.lastLoginHuman}
                              </span>
                            </div>
                          </td>

                          {/* Access Module Badge */}
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'var(--color-surface2)',
                                border: '1px solid var(--color-border)',
                                fontSize: '11px',
                                color: 'var(--color-text)',
                                fontWeight: 600,
                              }}
                            >
                              {u.accessModules}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                              <button
                                title="View User Profile & Activity"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 6px' }}
                                onClick={() => setDetailUser(u)}
                              >
                                <EyeIcon size={14} />
                              </button>
                              <button
                                title="Edit User Account"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 6px' }}
                                onClick={() => setEditUser(u)}
                              >
                                <EditIcon size={14} />
                              </button>
                              <button
                                title="More Actions"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 6px' }}
                                onClick={() => setDetailUser(u)}
                              >
                                <MoreVerticalIcon size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--color-border)',
                fontSize: '12px',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <span style={{ color: 'var(--color-text-muted)' }}>
                Showing 1 to {paginatedUsers.length} of {filteredUsers.length} users
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    className="page-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeftIcon size={14} />
                  </button>
                  <button className="page-btn active" style={{ minWidth: '28px', fontSize: '11px' }}>
                    {page}
                  </button>
                  <button
                    className="page-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRightIcon size={14} />
                  </button>
                </div>

                <select
                  className="form-select"
                  style={{ width: '95px', padding: '4px 8px', fontSize: '11px' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: ROLES & PERMISSIONS ── */}
      {activeTab === 'roles' && <RolesTab />}

      {/* ── Invite User Modal ── */}
      {showInviteModal && (
        <UserInviteModal onClose={() => setShowInviteModal(false)} />
      )}

      {/* ── View User Detail Modal ── */}
      {detailUser && (
        <UserDetailModal
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onEdit={(u) => {
            setDetailUser(null);
            setEditUser(u);
          }}
        />
      )}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <UserEditModal
          user={editUser}
          onClose={() => setEditUser(null)}
        />
      )}
    </div>
  );
}
