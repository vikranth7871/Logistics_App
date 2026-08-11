import React, { useState } from 'react';
import { useDriver, useVehicles, useAssignDriverVehicle, useTrips } from '@hooks/useERP';
import {
  UsersIcon,
  TruckIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  MapPinIcon,
  CheckIcon,
} from '@components/common/Icons';

interface Props {
  driverId: string;
  onClose: () => void;
  onEdit?: () => void;
}

export default function DriverDetailModal({ driverId, onClose, onEdit }: Props) {
  const { data: driver, isLoading } = useDriver(driverId);
  const { data: vehicleData } = useVehicles({ limit: 100 });
  const assignMutation = useAssignDriverVehicle();

  const { data: tripData } = useTrips({ driverId, limit: 10 });
  const driverTrips = tripData?.items || [];

  const vehicles = vehicleData?.items || [];
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  if (isLoading || !driver) {
    return (
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  const licDays = driver.licenseExpiry
    ? Math.ceil((new Date(driver.licenseExpiry).getTime() - Date.now()) / 86_400_000)
    : null;

  const currentVehicle = vehicles.find((v: any) => v.id === driver.assignedVehicleId);

  const handleAssignVehicle = async (vId: string) => {
    await assignMutation.mutateAsync({ driverId, vehicleId: vId });
    setSelectedVehicleId('');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px' }} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '18px',
              }}
            >
              {driver.name ? driver.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{driver.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                {driver.phone} • {driver.email || 'No email attached'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onEdit && (
              <button className="btn btn-secondary btn-sm" onClick={onEdit}>
                Edit Profile
              </button>
            )}
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <XIcon size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '16px' }}>
          {/* Driver Status & License Badge Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              background: 'var(--color-surface-hover)',
              padding: '14px',
              borderRadius: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>Status</div>
              <span className={`badge badge-${driver.status}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                {driver.status?.replace('_', ' ')}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>License Category</div>
              <div style={{ fontWeight: 600, fontSize: '14px', marginTop: '2px' }}>
                {driver.licenseType || 'Standard'} ({driver.licenseNumber || 'N/A'})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>License Validity</div>
              {licDays !== null ? (
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px', color: licDays < 0 ? 'var(--color-danger)' : licDays <= 60 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                  {new Date(driver.licenseExpiry).toLocaleDateString('en-IN')} ({licDays < 0 ? 'Expired' : `${licDays} days left`})
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', marginTop: '2px' }}>Not recorded</div>
              )}
            </div>
          </div>

          {/* Assigned Lorry Vehicle Panel */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={18} color="var(--color-primary)" /> Assigned Vehicle
              </span>
              {currentVehicle && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleAssignVehicle('')}
                  disabled={assignMutation.isPending}
                  style={{ color: 'var(--color-danger)' }}
                >
                  Unassign Vehicle
                </button>
              )}
            </div>

            {currentVehicle ? (
              <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{currentVehicle.registrationNumber}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                    {currentVehicle.make} {currentVehicle.model} • {currentVehicle.capacityTons} Tons Capacity
                  </div>
                </div>
                <span className={`badge badge-${currentVehicle.status}`}>{currentVehicle.status?.replace('_', ' ')}</span>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ flex: 1 }}
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                >
                  <option value="">-- Assign a Vehicle --</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.make} {v.model}) - {v.status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!selectedVehicleId || assignMutation.isPending}
                  onClick={() => handleAssignVehicle(selectedVehicleId)}
                >
                  Assign
                </button>
              </div>
            )}
          </div>

          {/* App Account & Contact Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-dim)' }}>
                APP LOGIN & ACCOUNT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircleIcon size={18} color="var(--color-success)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{driver.email || `${driver.phone}@lorryerp.com`}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>Driver Role Active</div>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '8px', color: 'var(--color-text-dim)' }}>
                EMERGENCY CONTACT
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{driver.emergencyContactName || '—'}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>{driver.emergencyContactPhone || '—'}</div>
            </div>
          </div>

          {/* Recent Trip History */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPinIcon size={16} /> Recent Trips Driven ({driverTrips.length})
            </div>
            {driverTrips.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', padding: '12px', background: 'var(--color-surface-hover)', borderRadius: '6px' }}>
                No trips recorded for this driver yet.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Trip No.</th>
                      <th>Route</th>
                      <th>Freight (₹)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverTrips.map((t: any) => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{t.tripNumber}</td>
                        <td>{t.origin} → {t.destination}</td>
                        <td style={{ fontWeight: 500 }}>₹{Number(t.freightAmount || 0).toLocaleString('en-IN')}</td>
                        <td><span className={`badge badge-${t.status}`}>{t.status?.replace('_', ' ')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
