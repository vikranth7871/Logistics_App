import React, { useState } from 'react';
import { useUpdateDriver } from '@hooks/useERP';
import { XIcon } from '@components/common/Icons';

interface Props {
  driver: any;
  onClose: () => void;
}

export default function DriverEditModal({ driver, onClose }: Props) {
  const updateMutation = useUpdateDriver(driver.id);

  const [form, setForm] = useState({
    name: driver.name || '',
    phone: driver.phone || '',
    email: driver.email || '',
    licenseNumber: driver.licenseNumber || '',
    licenseType: driver.licenseType || 'HMV',
    licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
    joiningDate: driver.joiningDate ? new Date(driver.joiningDate).toISOString().split('T')[0] : '',
    status: driver.status || 'active',
    emergencyContactName: driver.emergencyContactName || '',
    emergencyContactPhone: driver.emergencyContactPhone || '',
    notes: driver.notes || '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({
      ...form,
      licenseExpiry: form.licenseExpiry || undefined,
      joiningDate: form.joiningDate || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '580px' }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="modal-title">Edit Driver Details</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-input"
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  className="form-input"
                  required
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="on_trip">On Trip</option>
                  <option value="on_leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input
                  className="form-input"
                  value={form.licenseNumber}
                  onChange={(e) => set('licenseNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Category</label>
                <select
                  className="form-select"
                  value={form.licenseType}
                  onChange={(e) => set('licenseType', e.target.value)}
                >
                  {['LMV', 'HMV', 'HTV', 'HAZMAT'].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.licenseExpiry}
                  onChange={(e) => set('licenseExpiry', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emergency Contact Name</label>
                <input
                  className="form-input"
                  value={form.emergencyContactName}
                  onChange={(e) => set('emergencyContactName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone</label>
                <input
                  className="form-input"
                  value={form.emergencyContactPhone}
                  onChange={(e) => set('emergencyContactPhone', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
