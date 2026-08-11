import React, { useState } from 'react';
import { useDrivers, useCreateDriver, useDeleteDriver } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon,
  SearchIcon,
  UsersIcon,
  TruckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  TrashIcon,
  EditIcon,
  EyeIcon,
} from '@components/common/Icons';
import DriverDetailModal from './components/DriverDetailModal';
import DriverEditModal from './components/DriverEditModal';

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-active',
  on_trip: 'badge-in_trip',
  on_leave: 'badge-assigned',
  inactive: 'badge-inactive',
};

export default function DriversPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canManage = ['admin', 'manager'].includes(user?.role || '');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [viewDriverId, setViewDriverId] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);

  const { data, isLoading } = useDrivers({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const deleteMutation = useDeleteDriver();

  const drivers = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleDeleteDriver = (d: any) => {
    if (window.confirm(`Are you sure you want to remove driver ${d.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(d.id);
    }
  };

  return (
    <div>
      {viewDriverId && (
        <DriverDetailModal
          driverId={viewDriverId}
          onClose={() => setViewDriverId(null)}
          onEdit={() => {
            const target = drivers.find((d: any) => d.id === viewDriverId);
            setViewDriverId(null);
            if (target) setEditingDriver(target);
          }}
        />
      )}

      {editingDriver && (
        <DriverEditModal
          driver={editingDriver}
          onClose={() => setEditingDriver(null)}
        />
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Management</h1>
          <p className="page-subtitle">{meta.total} drivers registered</p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary"
            id="add-driver-btn"
            onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={16} /> Add Driver
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={16} color="var(--color-text-muted)" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone or license…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="driver-search"
          />
        </div>

        <select
          className="form-select"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          id="driver-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_trip">On Trip</option>
          <option value="on_leave">On Leave</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>License No.</th>
                <th>License Type</th>
                <th>License Expiry</th>
                <th>Assigned Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <UsersIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No drivers found</div>
                      <div className="empty-state-sub">Add your first driver to start assigning trips</div>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((d: any) => {
                  const licDays = d.licenseExpiry
                    ? Math.ceil((new Date(d.licenseExpiry).getTime() - Date.now()) / 86_400_000)
                    : null;

                  return (
                    <tr key={d.id}>
                      <td>
                        <div
                          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--color-primary)' }}
                          onClick={() => setViewDriverId(d.id)}
                        >
                          {d.name}
                        </div>
                        {d.email && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{d.email}</div>}
                      </td>
                      <td>{d.phone}</td>
                      <td>{d.licenseNumber || '—'}</td>
                      <td>{d.licenseType || '—'}</td>
                      <td>
                        {licDays !== null ? (
                          <div>
                            <div style={{ fontSize: '12px' }}>
                              {new Date(d.licenseExpiry).toLocaleDateString('en-IN')}
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: licDays < 0 ? 'var(--color-danger)' : licDays <= 60 ? 'var(--color-warning)' : 'var(--color-text-muted)',
                            }}>
                              {licDays < 0 ? 'Expired' : `${licDays}d left`}
                            </div>
                          </div>
                        ) : '—'}
                      </td>
                      <td>
                        {d.assignedVehicleId ? (
                          <span style={{ fontSize: '12px', color: 'var(--color-info)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <TruckIcon size={14} /> Assigned
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>None</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[d.status] || 'badge-inactive'}`}>
                          {d.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setViewDriverId(d.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <EyeIcon size={14} /> View
                          </button>
                          {canManage && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingDriver(d)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <EditIcon size={14} /> Edit
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteDriver(d)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-danger)' }}
                            >
                              <TrashIcon size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {drivers.length} of {meta.total}</span>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <button className="page-btn active">{page}</button>
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && <DriverFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function DriverFormModal({ onClose }: { onClose: () => void }) {
  const mutation = useCreateDriver();
  const [form, setForm] = useState({
    name: '', phone: '', email: '', licenseNumber: '',
    licenseExpiry: '', licenseType: 'HMV', joiningDate: '',
    address: '', emergencyContactName: '', emergencyContactPhone: '', notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync(form);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <span className="modal-title">Add New Driver</span>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" required value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email (For App Login)</label>
                <input type="email" className="form-input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="e.g. driver@lorryerp.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input type="date" className="form-input" value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)} />
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input className="form-input" value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">License Type</label>
                <select className="form-select" value={form.licenseType} onChange={(e) => set('licenseType', e.target.value)}>
                  {['LMV', 'HMV', 'HTV', 'HAZMAT'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input type="date" className="form-input" value={form.licenseExpiry} onChange={(e) => set('licenseExpiry', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input className="form-input" value={form.emergencyContactName} onChange={(e) => set('emergencyContactName', e.target.value)} placeholder="Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone</label>
                <input className="form-input" value={form.emergencyContactPhone} onChange={(e) => set('emergencyContactPhone', e.target.value)} placeholder="Phone" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
