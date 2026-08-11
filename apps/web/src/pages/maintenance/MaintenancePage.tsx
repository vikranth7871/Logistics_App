import React, { useState } from 'react';
import apiClient from '@api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PlusIcon, WrenchIcon, XIcon } from '@components/common/Icons';

const TYPES = [
  { value: 'servicing', label: 'Routine Servicing' },
  { value: 'repair', label: 'Repair' },
  { value: 'tyre_replacement', label: 'Tyre Replacement' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'breakdown', label: 'Breakdown' },
];

const STATUS_BADGES: Record<string, string> = {
  scheduled: 'badge-assigned',
  in_progress: 'badge-in_trip',
  completed: 'badge-active',
  cancelled: 'badge-inactive',
};

export default function MaintenancePage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', page],
    queryFn: () => apiClient.get('/maintenance', { params: { page, limit: 20 } }).then(r => r.data.data),
  });

  const records = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Maintenance</h1>
          <p className="page-subtitle">{meta.total} servicing & repair logs</p>
        </div>
        <button
          className="btn btn-primary"
          id="add-maintenance-btn"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Schedule Maintenance
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Vendor / Service Station</th>
                <th>Odometer (km)</th>
                <th>Cost (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <WrenchIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No maintenance records</div>
                    <div className="empty-state-sub">Log servicing, repairs and tyre replacements</div>
                  </div>
                </td></tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '12px' }}>{new Date(r.serviceDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 600, fontSize: '12px' }}>{r.vehicle?.registrationNumber || '—'}</td>
                    <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                      {TYPES.find(t => t.value === r.type)?.label || r.type}
                    </td>
                    <td style={{ fontSize: '12px' }}>{r.vendorName || '—'}</td>
                    <td>{r.odometerReading ? `${Number(r.odometerReading).toLocaleString()} km` : '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
                      ₹{Number(r.cost || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGES[r.status] || ''}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <MaintenanceFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function MaintenanceFormModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    vehicleId: '', type: 'servicing', status: 'scheduled',
    serviceDate: new Date().toISOString().split('T')[0],
    odometerReading: '', cost: '', vendorName: '', invoiceNumber: '', description: '',
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/maintenance', data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance'] });
      qc.invalidateQueries({ queryKey: ['fleet'] });
      toast.success('Maintenance scheduled');
      onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error scheduling maintenance'),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      odometerReading: form.odometerReading ? parseFloat(form.odometerReading) : undefined,
      cost: form.cost ? parseFloat(form.cost) : 0,
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <WrenchIcon size={18} /> Schedule Maintenance
          </span>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle ID *</label>
                <input className="form-input" required placeholder="Vehicle UUID" value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Service Date *</label>
                <input type="date" className="form-input" required value={form.serviceDate} onChange={e => set('serviceDate', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Maintenance Type</label>
                <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress (Veh. Maintenance)</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vendor / Service Center</label>
                <input className="form-input" value={form.vendorName} onChange={e => set('vendorName', e.target.value)} placeholder="e.g. TVS Workshop" />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated / Total Cost (₹)</label>
                <input type="number" className="form-input" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="5000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Servicing details, replaced parts…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
