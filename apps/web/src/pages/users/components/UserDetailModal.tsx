import React from 'react';
import {
  XIcon, UsersIcon, ShieldIcon, TruckIcon, PhoneIcon,
  MailIcon, KeyIcon, LockIcon, CheckCircleIcon, ClockIcon,
  EditIcon, AlertTriangleIcon, TrashIcon
} from '@components/common/Icons';

interface UserDetailModalProps {
  user: any;
  onClose: () => void;
  onEdit?: (user: any) => void;
}

export default function UserDetailModal({ user, onClose, onEdit }: UserDetailModalProps) {
  const isDriver = user.role?.toLowerCase() === 'driver';
  const isAdmin = user.role?.toLowerCase() === 'admin';

  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'US';

  const activityLogs = [
    { time: 'Today, 10:42 AM', event: isDriver ? 'Completed Freight Trip (TRP-2026-00023)' : 'Approved Fuel Entry (FUEL-2026-0814)', type: 'trip' },
    { time: 'Yesterday, 06:15 PM', event: isDriver ? 'Updated trip status to In-Transit' : 'Updated Maintenance Record (MNT-2026-003)', type: 'update' },
    { time: '12 Aug 2026, 08:30 AM', event: isDriver ? 'Logged into Mobile Application' : 'Logged into Web Console (Chrome / macOS)', type: 'auth' },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: user.avatarColor || '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {user.name}
                </span>
                <span className={`badge ${
                  user.status === 'Active' ? 'badge-active' : user.status === 'Invited' ? 'badge-draft' : 'badge-inactive'
                }`} style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                  {user.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {user.email} • {user.phone || 'No phone'}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px' }}>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Assigned Role</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#f97316', marginTop: '2px', textTransform: 'capitalize' }}>
                {user.role}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                {user.accessModules || (isDriver ? 'Driver Mobile Portal' : 'All ERP Modules')}
              </div>
            </div>

            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Account Activity</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>
                {user.lastLoginHuman || 'Today, 10:42 AM'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>Online from Mobile</div>
            </div>

            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Linked Driver Profile</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>
                {isDriver ? user.name : 'N/A (Staff)'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                {isDriver ? `Vehicle: ${user.assignedVehicle || 'TN72BT7517'}` : 'System Administrator'}
              </div>
            </div>
          </div>

          {/* Linked Operational Details (if Driver) */}
          {isDriver && (
            <div className="card" style={{ padding: '14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', margin: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={14} /> Operational Fleet Linkage
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Assigned Lorry: </span>
                  <strong>{user.assignedVehicle || 'TN72BT7517 (Ashok Leyland 4220)'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Current Status: </span>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>On Trip (Chennai → Madurai)</span>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Matrix */}
          <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Assigned Permissions &amp; Access Controls
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(isAdmin
                ? ['Full Admin Rights', 'User Management', 'Fleet Operations', 'Trips Dispatch', 'Fuel Tracking', 'Expense Approvals', 'Billing & Ledger', 'Reports & Analytics', 'Audit Trail', 'System Settings']
                : isDriver
                ? ['View Assigned Trips', 'Record Fuel Receipts', 'Submit Trip Expenses', 'Driver Profile & Licences', 'Mobile Navigation']
                : ['Fleet Management', 'Trip Dispatch', 'Driver Allocations', 'Maintenance Scheduler', 'View Analytics']
              ).map((perm) => (
                <span
                  key={perm}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Activity Log (Requirement 12) */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
              Recent Audit &amp; Activity Log
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activityLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    background: 'var(--color-surface2)',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{log.event}</span>
                  </div>
                  <span style={{ color: 'var(--color-text-dim)' }}>{log.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
              >
                <EditIcon size={13} /> Edit User
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => alert(`Temporary password reset link sent to ${user.email}`)}
              style={{ fontSize: '11px' }}
            >
              🔑 Reset Password
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => alert(`Toggled active status for ${user.name}`)}
              style={{ fontSize: '11px', color: '#ef4444' }}
            >
              🚫 Deactivate
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
