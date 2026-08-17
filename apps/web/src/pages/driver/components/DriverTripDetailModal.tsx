import React from 'react';
import {
  XIcon, MapPinIcon, TruckIcon, UsersIcon,
  DollarIcon, FuelIcon, CalendarIcon, FileTextIcon,
  CheckCircleIcon, CheckIcon, DownloadIcon, CameraIcon,
  EyeIcon, ShieldIcon
} from '@components/common/Icons';

interface DriverTripDetailModalProps {
  trip: any;
  onClose: () => void;
  onMarkDelivered?: (trip: any) => void;
  onComplete?: (trip: any) => void;
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  assigned: { label: 'Assigned', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  in_progress: { label: 'In Transit', bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  delivered: { label: 'Delivered', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  completed: { label: 'Completed', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  cancelled: { label: 'Cancelled', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
};

export default function DriverTripDetailModal({ trip, onClose, onMarkDelivered, onComplete }: DriverTripDetailModalProps) {
  if (!trip) return null;

  const statusInfo = STATUS_LABELS[trip.status] || {
    label: trip.status?.replace('_', ' ') || 'Unknown',
    bg: 'rgba(255,255,255,0.08)',
    color: 'var(--color-text)',
  };

  const startOdo = trip.startOdometer || 84200;
  const endOdo = trip.endOdometer || (trip.status === 'completed' || trip.status === 'delivered' ? startOdo + (trip.distanceKm || 460) : null);
  const distanceCovered = endOdo ? endOdo - startOdo : (trip.distanceKm || 460);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TruckIcon size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace', color: '#f97316' }}>
                  {trip.tripNumber}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: statusInfo.bg,
                  color: statusInfo.color,
                }}>
                  {statusInfo.label}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {trip.origin} ➔ {trip.destination}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          
          {/* Route & Cargo Banner */}
          <div style={{
            background: 'var(--color-surface2)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                ORIGIN (LOADING POINT)
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPinIcon size={16} color="#f97316" /> {trip.origin}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                DESTINATION (UNLOADING)
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPinIcon size={16} color="#22c55e" /> {trip.destination}
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Assigned Lorry</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px', fontFamily: 'monospace' }}>
                {trip.vehicle?.registrationNumber || trip.vehicleNumber || 'TN72BT7517'}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Cargo Load</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
                {trip.loadDescription || 'Industrial Cargo'} ({trip.loadWeightTons ? `${trip.loadWeightTons}T` : '24.5T'})
              </div>
            </div>

            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Freight Amount</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>
                ₹{Number(trip.freightAmount || 200000).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Odometer & Timeline Details */}
          <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarIcon size={15} color="#f97316" /> Trip Timeline &amp; Odometer
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Start Odometer: </span>
                <strong style={{ color: '#f97316' }}>{startOdo.toLocaleString('en-IN')} KM</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>End Odometer: </span>
                <strong style={{ color: endOdo ? '#22c55e' : 'var(--color-text-dim)' }}>
                  {endOdo ? `${endOdo.toLocaleString('en-IN')} KM` : 'In Progress'}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Total Distance: </span>
                <strong>{distanceCovered} KM</strong>
              </div>
            </div>

            {trip.scheduledStart && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                Scheduled Departure: <strong>{new Date(trip.scheduledStart).toLocaleDateString('en-IN')}</strong> • Estimated Arrival: <strong>{trip.scheduledEnd ? new Date(trip.scheduledEnd).toLocaleDateString('en-IN') : 'Same Day'}</strong>
              </div>
            )}
          </div>

          {/* Proof of Delivery (POD) Viewer */}
          {trip.deliveryProofUrl ? (
            <div style={{ background: 'rgba(34,197,94,0.06)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircleIcon size={16} /> Verified Proof of Delivery (POD)
                </div>
                <a
                  href={trip.deliveryProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <DownloadIcon size={13} /> View / Download LR
                </a>
              </div>
              <div style={{ textAlign: 'center', padding: '8px', background: 'var(--color-surface)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <img
                  src={trip.deliveryProofUrl}
                  alt="POD document"
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CameraIcon size={20} color="var(--color-text-muted)" />
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Proof of Delivery (POD) will be captured and uploaded upon marking delivery.
              </div>
            </div>
          )}

          {/* Driver Notes */}
          {trip.notes && (
            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>DELIVERY REMARKS</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '4px' }}>
                {trip.notes}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {trip.status === 'in_progress' && onMarkDelivered && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onMarkDelivered(trip);
                }}
                style={{ background: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircleIcon size={16} /> Mark Delivered &amp; Upload POD
              </button>
            )}

            {trip.status === 'delivered' && onComplete && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onComplete(trip);
                }}
                style={{ background: '#22c55e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckIcon size={16} /> Finish &amp; Complete Trip
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
