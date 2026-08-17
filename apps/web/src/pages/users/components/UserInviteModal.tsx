import React, { useState } from 'react';
import apiClient from '@api/client';
import { useDrivers } from '@hooks/useERP';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  XIcon, UsersIcon, CheckIcon, ShieldIcon, TruckIcon,
  PhoneIcon, MailIcon, KeyIcon, LockIcon
} from '@components/common/Icons';

interface UserInviteModalProps {
  onClose: () => void;
}

const ROLES_CONFIG = [
  {
    value: 'admin',
    label: 'System Admin',
    desc: 'Full unrestricted system access, user management, audit logs, and configuration.',
    modules: 'All 12 Modules (Unrestricted)',
    color: '#ef4444',
  },
  {
    value: 'manager',
    label: 'Fleet Manager',
    desc: 'Manage vehicles, drivers, trips, fuel tracking, maintenance schedules, and analytics.',
    modules: 'Fleet, Drivers, Trips, Fuel, Maintenance, Reports (6 Modules)',
    color: '#f97316',
  },
  {
    value: 'dispatcher',
    label: 'Dispatcher / Ops',
    desc: 'Assign vehicles & drivers, dispatch freight trips, and monitor real-time tracking.',
    modules: 'Trips, Fleet, Drivers (3 Modules)',
    color: '#3b82f6',
  },
  {
    value: 'accountant',
    label: 'Accountant',
    desc: 'Manage customer invoices, freight payments, driver expenses, and financial ledger.',
    modules: 'Customers, Billing, Payments, Expenses, Reports (5 Modules)',
    color: '#a855f7',
  },
  {
    value: 'driver',
    label: 'Driver',
    desc: 'Mobile driver app access for viewing assigned trips, fuel entry, and expense uploads.',
    modules: 'Driver Mobile Portal Only',
    color: '#22c55e',
  },
];

export default function UserInviteModal({ onClose }: UserInviteModalProps) {
  const qc = useQueryClient();
  const { data: driverData } = useDrivers({ limit: 100 });
  const drivers = Array.isArray(driverData?.items) ? driverData.items : [];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('driver');
  const [linkedDriverId, setLinkedDriverId] = useState('');
  const [password, setPassword] = useState('Welcome@123456');
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [requirePasswordReset, setRequirePasswordReset] = useState(true);

  // Auto-fill Driver info if linking driver
  const handleDriverLinkChange = (driverId: string) => {
    setLinkedDriverId(driverId);
    if (driverId) {
      const selected = drivers.find((d: any) => d.id === driverId);
      if (selected) {
        if (!name) setName(selected.name);
        if (!phone) setPhone(selected.phone || '');
        if (!email && selected.phone) setEmail(`driver_${selected.phone.slice(-4)}@lorryerp.com`);
      }
    }
  };

  const selectedRoleConfig = ROLES_CONFIG.find((r) => r.value === role) || ROLES_CONFIG[0];

  const mutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/users', data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User account created and invitation sent');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error creating user account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      email,
      phone: phone || undefined,
      role,
      password,
      linkedDriverId: linkedDriverId || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
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
              <UsersIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                Invite System User
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Provision ERP credentials, security role, and driver profile linking
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>

            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label">System Role &amp; Access Level <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {ROLES_CONFIG.map((r) => {
                  const active = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '8px',
                        border: active ? `2px solid ${r.color}` : '1px solid var(--color-border)',
                        background: active ? 'var(--color-surface2)' : 'var(--color-surface)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '12px', color: active ? r.color : 'var(--color-text)' }}>
                        {r.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Access Capability Badge */}
            <div style={{
              background: 'var(--color-surface2)',
              borderRadius: '8px',
              padding: '10px 14px',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
            }}>
              <div style={{ fontWeight: 700, color: selectedRoleConfig.color, marginBottom: '2px' }}>
                {selectedRoleConfig.label} Access Capabilities:
              </div>
              <div style={{ color: 'var(--color-text-muted)' }}>
                {selectedRoleConfig.desc}
              </div>
              <div style={{ color: 'var(--color-text)', marginTop: '4px', fontWeight: 600 }}>
                Assigned Scope: {selectedRoleConfig.modules}
              </div>
            </div>

            {/* Link Existing Driver (when role is Driver) */}
            {role === 'driver' && (
              <div className="form-group" style={{ background: 'rgba(34,197,94,0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <label className="form-label" style={{ color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TruckIcon size={14} /> Link Existing Driver Profile (Recommended)
                </label>
                <select
                  className="form-select"
                  value={linkedDriverId}
                  onChange={(e) => handleDriverLinkChange(e.target.value)}
                >
                  <option value="">-- Create Standalone Driver User --</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.phone} (Lic: {d.licenseNumber || 'Verified'})
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Connecting an existing driver auto-links their vehicle assignments, trips, and mobile payroll.
                </div>
              </div>
            )}

            {/* Basic Info */}
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

            {/* Security Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <div className="form-group">
                <label className="form-label">Initial Temp Password</label>
                <input
                  type="text"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={sendInviteEmail}
                    onChange={(e) => setSendInviteEmail(e.target.checked)}
                  />
                  <span>Send invitation email with login credentials immediately</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={requirePasswordReset}
                    onChange={(e) => setRequirePasswordReset(e.target.checked)}
                  />
                  <span>Require password change upon first login</span>
                </label>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit-invite-user-btn"
              disabled={mutation.isPending}
              style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              {mutation.isPending ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
