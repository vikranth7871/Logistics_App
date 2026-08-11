import React, { useState } from 'react';
import apiClient from '@api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PlusIcon, UsersIcon, XIcon } from '@components/common/Icons';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'driver', label: 'Driver' },
];

const ROLE_BADGES: Record<string, string> = {
  admin: 'badge-maintenance',
  manager: 'badge-in_trip',
  accountant: 'badge-assigned',
  dispatcher: 'badge-delivered',
  driver: 'badge-active',
};

export default function UsersPage() {
  const [page] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => apiClient.get('/users', { params: { page, limit: 20 } }).then(r => r.data.data),
  });

  const users = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{meta.total} system users</p>
        </div>
        <button
          className="btn btn-primary"
          id="add-user-btn"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Invite User
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <UsersIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No users found</div>
                  </div>
                </td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id}>
                    <td><div style={{ fontWeight: 600 }}>{u.name}</div></td>
                    <td style={{ fontSize: '12px' }}>{u.email}</td>
                    <td style={{ fontSize: '12px' }}>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGES[u.role] || ''}`} style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <UserFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function UserFormModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'dispatcher', password: 'Welcome@123456',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/users', data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error creating user'),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UsersIcon size={18} /> Invite New User
          </span>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Name" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@company.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input className="form-input" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Inviting…' : 'Invite User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
