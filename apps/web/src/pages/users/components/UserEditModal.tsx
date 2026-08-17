import React, { useState } from 'react';
import apiClient from '@api/client';
import { useDrivers } from '@hooks/useERP';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  XIcon, UsersIcon, CheckIcon, ShieldIcon, TruckIcon,
  PhoneIcon, MailIcon, KeyIcon, LockIcon, EditIcon
} from '@components/common/Icons';

interface UserEditModalProps {
  user: any;
  onClose: () => void;
}

const ROLES_CONFIG = [
  { value: 'admin', label: 'System Admin', color: '#ef4444' },
  { value: 'manager', label: 'Fleet Manager', color: '#f97316' },
  { value: 'dispatcher', label: 'Dispatcher / Ops', color: '#3b82f6' },
  { value: 'accountant', label: 'Accountant', color: '#a855f7' },
  { value: 'driver', label: 'Driver', color: '#22c55e' },
];

export default function UserEditModal({ user, onClose }: UserEditModalProps) {
  const qc = useQueryClient();
  const { data: driverData } = useDrivers({ limit: 100 });
  const drivers = Array.isArray(driverData?.items) ? driverData.items : [];

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [role, setRole] = useState(user.role || 'driver');
  const [status, setStatus] = useState(user.status || (user.isActive ? 'Active' : 'Inactive'));
  const [linkedDriverId, setLinkedDriverId] = useState(user.linkedDriverId || '');

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiClient.patch(`/users/${user.id}`, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User account updated successfully');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      email,
      phone: phone || undefined,
      role,
      isActive: status === 'Active',
      linkedDriverId: linkedDriverId || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316',
            }}>
              <EditIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                Edit User Account
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Update contact profile, assigned role permissions, and status
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>

            <div className="form-group">
              <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun R"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. arjun@lorryerp.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543214"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">System Role <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLES_CONFIG.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Link Existing Driver (when role is Driver) */}
            {role === 'driver' && (
              <div className="form-group" style={{ background: 'rgba(34,197,94,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <label className="form-label" style={{ color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TruckIcon size={14} /> Linked Driver Profile
                </label>
                <select
                  className="form-select"
                  value={linkedDriverId}
                  onChange={(e) => setLinkedDriverId(e.target.value)}
                >
                  <option value="">-- Standalone Driver Login --</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.phone} (Lic: {d.licenseNumber || 'Verified'})
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit-edit-user-btn"
              disabled={mutation.isPending}
              style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              {mutation.isPending ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Saving Changes...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
