import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  ShieldIcon, UsersIcon, CheckIcon, KeyIcon, LockIcon,
  TruckIcon, DollarIcon, WrenchIcon, FileTextIcon, SearchIcon,
  PlusIcon, EditIcon, TrashIcon, AlertTriangleIcon, CheckCircleIcon,
  UserCheckIcon, MoreVerticalIcon
} from '@components/common/Icons';
import CreateRoleModal from './CreateRoleModal';

/* ── Grouped Module Structure ── */
const MODULE_GROUPS = [
  {
    category: 'OPERATIONS',
    modules: ['Fleet', 'Drivers', 'Trips', 'Fuel', 'Maintenance'],
  },
  {
    category: 'FINANCE',
    modules: ['Expenses', 'Customers', 'Billing', 'Payments'],
  },
  {
    category: 'ADMINISTRATION',
    modules: ['Reports', 'Users', 'Roles & Permissions', 'Audit Logs', 'Settings'],
  },
];

/* ── Pre-configured Enterprise System Roles with Granular CRUD matrix ── */
const INITIAL_ROLES = [
  {
    id: 'admin',
    name: 'System Admin',
    usersCount: 1,
    categoryBadge: 'System Role',
    color: '#ef4444',
    isSystem: true,
    description: 'Unrestricted master control across all 12 ERP modules, user provisioning, database audits, and billing configuration.',
    accessibleModulesCount: 12,
    permissionLevel: 'Full Access (Root)',
    created: 'System Default',
    createdBy: 'System Root',
    lastModified: '14 Aug 2026',
    assignedUsers: [
      { id: 'demo-u-1', name: 'System Admin', email: 'admin@lorryerp.com', status: 'Active' },
    ],
    permissions: {
      Fleet: { view: true, create: true, edit: true, delete: true },
      Drivers: { view: true, create: true, edit: true, delete: true },
      Trips: { view: true, create: true, edit: true, delete: true },
      Fuel: { view: true, create: true, edit: true, delete: true },
      Maintenance: { view: true, create: true, edit: true, delete: true },
      Expenses: { view: true, create: true, edit: true, delete: true },
      Customers: { view: true, create: true, edit: true, delete: true },
      Billing: { view: true, create: true, edit: true, delete: true },
      Payments: { view: true, create: true, edit: true, delete: true },
      Reports: { view: true, create: true, edit: true, delete: true },
      Users: { view: true, create: true, edit: true, delete: true },
      'Roles & Permissions': { view: true, create: true, edit: true, delete: true },
      'Audit Logs': { view: true, create: true, edit: true, delete: true },
      Settings: { view: true, create: true, edit: true, delete: true },
    },
  },
  {
    id: 'manager',
    name: 'Fleet Manager',
    usersCount: 1,
    categoryBadge: 'Operations',
    color: '#f97316',
    isSystem: true,
    description: 'Fleet, vehicle tracking, maintenance schedules, fuel approvals, and driver operations.',
    accessibleModulesCount: 6,
    permissionLevel: 'Operational Full',
    created: 'System Default',
    createdBy: 'System Root',
    lastModified: '14 Aug 2026',
    assignedUsers: [
      { id: 'demo-u-ops', name: 'Venkatesh S', email: 'manager@lorryerp.com', status: 'Active' },
    ],
    permissions: {
      Fleet: { view: true, create: true, edit: true, delete: false },
      Drivers: { view: true, create: true, edit: true, delete: false },
      Trips: { view: true, create: true, edit: true, delete: false },
      Fuel: { view: true, create: true, edit: true, delete: false },
      Maintenance: { view: true, create: true, edit: true, delete: false },
      Expenses: { view: true, create: true, edit: true, delete: false },
      Customers: { view: true, create: false, edit: false, delete: false },
      Billing: { view: false, create: false, edit: false, delete: false },
      Payments: { view: false, create: false, edit: false, delete: false },
      Reports: { view: true, create: false, edit: false, delete: false },
      Users: { view: false, create: false, edit: false, delete: false },
      'Roles & Permissions': { view: false, create: false, edit: false, delete: false },
      'Audit Logs': { view: true, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher / Operations',
    usersCount: 1,
    categoryBadge: 'Operations',
    color: '#3b82f6',
    isSystem: true,
    description: 'Trip dispatching, driver & vehicle assignments, and real-time delivery status updates.',
    accessibleModulesCount: 4,
    permissionLevel: 'Trip Dispatch Scope',
    created: 'System Default',
    createdBy: 'System Root',
    lastModified: '14 Aug 2026',
    assignedUsers: [
      { id: 'demo-u-disp', name: 'Ramesh Babu', email: 'dispatch@lorryerp.com', status: 'Active' },
    ],
    permissions: {
      Fleet: { view: true, create: false, edit: false, delete: false },
      Drivers: { view: true, create: false, edit: false, delete: false },
      Trips: { view: true, create: true, edit: true, delete: false },
      Fuel: { view: true, create: false, edit: false, delete: false },
      Maintenance: { view: false, create: false, edit: false, delete: false },
      Expenses: { view: false, create: false, edit: false, delete: false },
      Customers: { view: true, create: false, edit: false, delete: false },
      Billing: { view: false, create: false, edit: false, delete: false },
      Payments: { view: false, create: false, edit: false, delete: false },
      Reports: { view: false, create: false, edit: false, delete: false },
      Users: { view: false, create: false, edit: false, delete: false },
      'Roles & Permissions': { view: false, create: false, edit: false, delete: false },
      'Audit Logs': { view: false, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'accountant',
    name: 'Accountant',
    usersCount: 1,
    categoryBadge: 'Finance',
    color: '#a855f7',
    isSystem: true,
    description: 'Invoicing, customer payments, ledger reconciliations, and driver trip settlement expenses.',
    accessibleModulesCount: 5,
    permissionLevel: 'Financial Ledger Scope',
    created: 'System Default',
    createdBy: 'System Root',
    lastModified: '14 Aug 2026',
    assignedUsers: [
      { id: 'demo-u-acc', name: 'Priya Sundaram', email: 'accounts@lorryerp.com', status: 'Active' },
    ],
    permissions: {
      Fleet: { view: false, create: false, edit: false, delete: false },
      Drivers: { view: false, create: false, edit: false, delete: false },
      Trips: { view: true, create: false, edit: false, delete: false },
      Fuel: { view: true, create: true, edit: true, delete: false },
      Maintenance: { view: true, create: false, edit: false, delete: false },
      Expenses: { view: true, create: true, edit: true, delete: false },
      Customers: { view: true, create: true, edit: true, delete: false },
      Billing: { view: true, create: true, edit: true, delete: false },
      Payments: { view: true, create: true, edit: true, delete: false },
      Reports: { view: true, create: false, edit: false, delete: false },
      Users: { view: false, create: false, edit: false, delete: false },
      'Roles & Permissions': { view: false, create: false, edit: false, delete: false },
      'Audit Logs': { view: false, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
    },
  },
  {
    id: 'driver',
    name: 'Driver',
    usersCount: 5,
    categoryBadge: 'Mobile Access',
    color: '#22c55e',
    isSystem: true,
    description: 'Access to mobile driver portal for assigned trips, fuel slips, and expense receipts.',
    accessibleModulesCount: 1,
    permissionLevel: 'Mobile Driver App',
    created: 'System Default',
    createdBy: 'System Root',
    lastModified: '14 Aug 2026',
    assignedUsers: [
      { id: 'demo-u-2', name: 'Arjun R', email: 'arjun@lorryerp.com', status: 'Active' },
      { id: 'demo-u-3', name: 'Selvam P', email: 'driver@lorryerp.com', status: 'Active' },
      { id: 'demo-u-4', name: 'Muthu K', email: 'muthu@lorryerp.com', status: 'Active' },
      { id: 'demo-u-5', name: 'Karthik S', email: 'karthik@lorryerp.com', status: 'Active' },
      { id: 'demo-u-6', name: 'Ravi M', email: 'ravi@lorryerp.com', status: 'Active' },
    ],
    permissions: {
      Fleet: { view: false, create: false, edit: false, delete: false },
      Drivers: { view: false, create: false, edit: false, delete: false },
      Trips: { view: true, create: false, edit: true, delete: false },
      Fuel: { view: true, create: true, edit: false, delete: false },
      Maintenance: { view: false, create: false, edit: false, delete: false },
      Expenses: { view: true, create: true, edit: false, delete: false },
      Customers: { view: false, create: false, edit: false, delete: false },
      Billing: { view: false, create: false, edit: false, delete: false },
      Payments: { view: false, create: false, edit: false, delete: false },
      Reports: { view: false, create: false, edit: false, delete: false },
      Users: { view: false, create: false, edit: false, delete: false },
      'Roles & Permissions': { view: false, create: false, edit: false, delete: false },
      'Audit Logs': { view: false, create: false, edit: false, delete: false },
      Settings: { view: false, create: false, edit: false, delete: false },
    },
  },
];

export default function RolesTab() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState('admin');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState<any>(null);

  // Active role
  const selectedRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0];
  }, [roles, selectedRoleId]);

  // Search & Filter
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      if (typeFilter === 'system' && !r.isSystem) return false;
      if (typeFilter === 'custom' && r.isSystem) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = r.name.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchBadge = r.categoryBadge.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchBadge) return false;
      }
      return true;
    });
  }, [roles, typeFilter, search]);

  const handleSaveRole = (savedRole: any) => {
    setRoles((prev) => {
      const idx = prev.findIndex((r) => r.id === savedRole.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...savedRole };
        return copy;
      }
      return [...prev, savedRole];
    });
    setSelectedRoleId(savedRole.id);
  };

  const handleDeleteRole = (roleToDelete: any) => {
    if (roleToDelete.isSystem) {
      alert('System default roles cannot be deleted.');
      return;
    }
    if (confirm(`Are you sure you want to delete role "${roleToDelete.name}"?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
      setSelectedRoleId('admin');
      toast.success('Role deleted successfully');
    }
  };

  const handleDuplicateRole = (srcRole: any) => {
    const dup = {
      ...srcRole,
      id: `role-copy-${Date.now()}`,
      name: `${srcRole.name} (Copy)`,
      isSystem: false,
      usersCount: 0,
      assignedUsers: [],
      created: 'Custom Role',
      createdBy: 'System Admin',
      lastModified: '14 Aug 2026',
    };
    setRoles((prev) => [...prev, dup]);
    setSelectedRoleId(dup.id);
    toast.success(`Role duplicated as "${dup.name}"`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
      {/* ── Left Side: System Roles Directory ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card" style={{ padding: '14px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Access Roles ({filteredRoles.length})
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditRole(null);
                setModalOpen(true);
              }}
              style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
            >
              <PlusIcon size={12} /> Create Role
            </button>
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <div className="search-input" style={{ width: '100%' }}>
              <span className="search-icon">
                <SearchIcon size={13} color="var(--color-text-muted)" />
              </span>
              <input
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: '11px', padding: '6px 8px 6px 28px' }}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '100%', fontSize: '11px', padding: '4px 8px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>
          </div>

          {/* Roles List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredRoles.map((r) => {
              const isSelected = selectedRole.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #f97316' : '1px solid var(--color-border)',
                    borderLeft: isSelected ? '4px solid #f97316' : '1px solid var(--color-border)',
                    background: isSelected ? 'rgba(249,115,22,0.12)' : 'var(--color-surface2)',
                    boxShadow: isSelected ? '0 0 10px rgba(249,115,22,0.15)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 800, fontSize: '13px', color: isSelected ? '#f97316' : 'var(--color-text)' }}>
                      {r.name}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: r.categoryBadge === 'System Role' ? 'rgba(239,68,68,0.15)' : r.categoryBadge === 'Operations' ? 'rgba(249,115,22,0.15)' : r.categoryBadge === 'Finance' ? 'rgba(168,85,247,0.15)' : 'rgba(34,197,94,0.15)',
                        color: r.categoryBadge === 'System Role' ? '#ef4444' : r.categoryBadge === 'Operations' ? '#f97316' : r.categoryBadge === 'Finance' ? '#a855f7' : '#22c55e',
                      }}
                    >
                      {r.categoryBadge}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginBottom: '4px' }}>
                    {r.usersCount} user{r.usersCount !== 1 ? 's' : ''} assigned • {r.permissionLevel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Side: Role Detail & RBAC Permission Matrix ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>

          {/* Role Header Banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: 'var(--color-text)' }}>
                  {selectedRole.name}
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: selectedRole.categoryBadge === 'System Role' ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
                    color: selectedRole.categoryBadge === 'System Role' ? '#ef4444' : '#f97316',
                  }}
                >
                  {selectedRole.categoryBadge}
                </span>
                {selectedRole.isSystem && (
                  <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <LockIcon size={12} /> System Default
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                {selectedRole.description}
              </p>
            </div>

            {/* Actions Group */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditRole(selectedRole);
                  setModalOpen(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
              >
                <EditIcon size={12} /> Edit Role
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleDuplicateRole(selectedRole)}
                style={{ fontSize: '11px' }}
              >
                Duplicate
              </button>
              {!selectedRole.isSystem && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleDeleteRole(selectedRole)}
                  style={{ color: '#ef4444', fontSize: '11px' }}
                >
                  <TrashIcon size={12} /> Delete
                </button>
              )}
            </div>
          </div>

          {/* Role Summary Metadata Card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            background: 'var(--color-surface2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            marginBottom: '16px',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>USERS ASSIGNED</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text)', marginTop: '2px' }}>
                {selectedRole.usersCount} User{selectedRole.usersCount !== 1 ? 's' : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>ACCESSIBLE MODULES</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#f97316', marginTop: '2px' }}>
                {selectedRole.accessibleModulesCount || Object.values(selectedRole.permissions || {}).filter((p: any) => p?.view).length} / 12
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>PERMISSION LEVEL</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                {selectedRole.permissionLevel}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>LAST MODIFIED</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-dim)', marginTop: '2px' }}>
                {selectedRole.lastModified}
              </div>
            </div>
          </div>

          {/* Grouped Permission Matrix Table */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Module Permissions Matrix
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                Granular View, Create, Edit, Delete access
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {MODULE_GROUPS.map((group) => (
                <div key={group.category} style={{ background: 'var(--color-surface2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#f97316',
                    letterSpacing: '0.05em',
                  }}>
                    {group.category}
                  </div>

                  <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <th style={{ textAlign: 'left', padding: '6px 12px' }}>MODULE</th>
                        <th style={{ width: '70px', padding: '6px' }}>VIEW</th>
                        <th style={{ width: '70px', padding: '6px' }}>CREATE</th>
                        <th style={{ width: '70px', padding: '6px' }}>EDIT</th>
                        <th style={{ width: '70px', padding: '6px' }}>DELETE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.modules.map((mod) => {
                        const perm = (selectedRole.permissions as any)?.[mod] || { view: false, create: false, edit: false, delete: false };
                        return (
                          <tr key={mod} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{mod}</td>
                            <td style={{ textAlign: 'center' }}>
                              {perm.view ? <span style={{ color: '#22c55e', fontWeight: 800 }}>✓</span> : <span style={{ color: 'var(--color-text-dim)' }}>✕</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {perm.create ? <span style={{ color: '#22c55e', fontWeight: 800 }}>✓</span> : <span style={{ color: 'var(--color-text-dim)' }}>✕</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {perm.edit ? <span style={{ color: '#22c55e', fontWeight: 800 }}>✓</span> : <span style={{ color: 'var(--color-text-dim)' }}>✕</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {perm.delete ? <span style={{ color: '#22c55e', fontWeight: 800 }}>✓</span> : <span style={{ color: 'var(--color-text-dim)' }}>✕</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Users Section */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned Users ({selectedRole.assignedUsers?.length || 0})
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Opening User Assignment manager for ${selectedRole.name}...`)}
                style={{ fontSize: '11px' }}
              >
                Manage Assigned Users
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedRole.assignedUsers?.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', padding: '10px' }}>
                  No users currently assigned to this role.
                </div>
              ) : (
                selectedRole.assignedUsers.map((u: any) => (
                  <div
                    key={u.id || u.email}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--color-surface2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{u.name}</span>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px', fontSize: '11px' }}>{u.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 700 }}>● {u.status || 'Active'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Create / Edit Role Modal ── */}
      {modalOpen && (
        <CreateRoleModal
          editRole={editRole}
          onClose={() => {
            setModalOpen(false);
            setEditRole(null);
          }}
          onSave={handleSaveRole}
        />
      )}
    </div>
  );
}
