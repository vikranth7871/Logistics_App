import React from 'react';
import { useAuthStore } from '@store/auth.store';
import { useDriver } from '@hooks/useERP';
import { UsersIcon, TruckIcon, CheckCircleIcon, AlertCircleIcon } from '@components/common/Icons';

export default function MyProfilePage() {
  const { user } = useAuthStore();
  const driverId = user?.driverId;

  const { data: driver, isLoading } = useDriver(driverId || '');

  const licDays = driver?.licenseExpiry
    ? Math.ceil((new Date(driver.licenseExpiry).getTime() - Date.now()) / 86_400_000)
    : null;

  if (isLoading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div className="spinner" />
        <div style={{ marginTop: '12px', color: 'var(--color-text-dim)' }}>Loading your profile…</div>
      </div>
    );
  }

  if (!driver && !isLoading) {
    return (
      <div className="empty-state" style={{ padding: '60px' }}>
        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
          <UsersIcon size={48} color="var(--color-text-dim)" />
        </div>
        <div className="empty-state-text">Profile not linked</div>
        <div className="empty-state-sub">
          Your user account is not linked to a driver profile yet.<br />
          Please contact your admin.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
      {/* Profile Header Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)',
          }}>
            {driver?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '22px', fontWeight: 700 }}>{driver?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
              {driver?.email || user?.email}
            </div>
            <div style={{ marginTop: '8px' }}>
              <span className={`badge badge-${driver?.status}`}>{driver?.status?.replace('_', ' ')}</span>
            </div>
          </div>
          {driver?.assignedVehicleId && (
            <div style={{
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '8px', padding: '10px 16px', textAlign: 'center',
            }}>
              <TruckIcon size={20} color="var(--color-primary)" />
              <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px' }}>Vehicle Assigned</div>
            </div>
          )}
        </div>
      </div>

      {/* License Details */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TruckIcon size={16} color="var(--color-primary)" /> License Information
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoRow label="License Number" value={driver?.licenseNumber || '—'} />
          <InfoRow label="License Category" value={driver?.licenseType || '—'} />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>License Expiry</div>
            {licDays !== null ? (
              <div>
                <div style={{ fontWeight: 600 }}>{new Date(driver?.licenseExpiry).toLocaleDateString('en-IN')}</div>
                <div style={{
                  fontSize: '12px', marginTop: '2px',
                  color: licDays < 0 ? 'var(--color-danger)' : licDays <= 60 ? 'var(--color-warning)' : 'var(--color-success)',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  {licDays < 0
                    ? <><AlertCircleIcon size={12} /> Expired</>
                    : licDays <= 60
                    ? <><AlertCircleIcon size={12} /> Expiring in {licDays} days</>
                    : <><CheckCircleIcon size={12} /> Valid · {licDays} days left</>}
                </div>
              </div>
            ) : <div style={{ fontWeight: 500 }}>—</div>}
          </div>
          <InfoRow label="Joining Date" value={driver?.joiningDate ? new Date(driver.joiningDate).toLocaleDateString('en-IN') : '—'} />
        </div>
      </div>

      {/* Contact Details */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '16px' }}>Contact Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoRow label="Phone" value={driver?.phone || '—'} />
          <InfoRow label="Email / Login Handle" value={driver?.email || user?.email || '—'} />
          <InfoRow label="Address" value={driver?.address || '—'} />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="card" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px', color: 'var(--color-warning)' }}>
          Emergency Contact
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <InfoRow label="Name" value={driver?.emergencyContactName || '—'} />
          <InfoRow label="Phone" value={driver?.emergencyContactPhone || '—'} />
        </div>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', textAlign: 'center', padding: '4px 0' }}>
        To update your profile details, contact your fleet manager or admin.
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontWeight: 500, fontSize: '14px' }}>{value}</div>
    </div>
  );
}
