import { useParams, Link } from 'react-router-dom';
import { useTrip, useStartTrip, useDeliverTrip, useCompleteTrip, useUploadDeliveryProof, useUpdateTrip } from '@hooks/useERP';
import { useState, useEffect } from 'react';
import {
  TruckIcon,
  CheckCircleIcon,
  MapPinIcon,
  GaugeIcon,
  CameraIcon,
  EyeIcon,
  FileTextIcon,
  XIcon,
  ChevronLeftIcon,
  CheckIcon,
} from '@components/common/Icons';

const STATUS_STEPS = ['draft', 'assigned', 'in_progress', 'delivered', 'completed'];

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-draft',
  assigned: 'badge-assigned',
  in_progress: 'badge-in_trip',
  delivered: 'badge-delivered',
  completed: 'badge-completed',
  cancelled: 'badge-maintenance',
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: trip, isLoading, isError } = useTrip(id!);
  const startMutation = useStartTrip();
  const deliverMutation = useDeliverTrip();
  const completeMutation = useCompleteTrip();
  const updateMutation = useUpdateTrip();
  const uploadProofMutation = useUploadDeliveryProof();

  const [odometer, setOdometer] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (trip) {
      const existing = trip.status === 'assigned' ? trip.startOdometer : trip.endOdometer || trip.startOdometer;
      if (existing && !odometer) {
        setOdometer(String(existing));
      }
    }
  }, [trip]);

  const handleSaveOdometer = async () => {
    if (!odometer || !trip) return;
    const val = parseFloat(odometer);
    if (trip.status === 'assigned') {
      await updateMutation.mutateAsync({ id: id!, data: { startOdometer: val } });
    } else {
      await updateMutation.mutateAsync({ id: id!, data: { endOdometer: val } });
    }
  };

  if (isLoading) return <div className="spinner-page"><div className="spinner" /></div>;

  if (isError || !trip) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
          <XIcon size={40} color="var(--color-danger)" />
        </div>
        <div className="empty-state-text">Trip not found</div>
        <Link to="/trips" className="btn btn-secondary" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeftIcon size={14} /> Back to Trips
        </Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(trip.status);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadProofMutation.mutateAsync({ id: id!, file });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <Link to="/trips">Trips</Link> → {trip.tripNumber}
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ fontFamily: 'monospace' }}>{trip.tripNumber}</h1>
            <span className={`badge ${STATUS_COLORS[trip.status] || ''}`}>
              {trip.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="page-subtitle">
            {trip.origin} → {trip.destination}
          </p>
        </div>

        {/* Action buttons based on status */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {trip.status === 'assigned' && (
            <button
              className="btn btn-primary"
              id="start-trip-btn"
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate({ id: id!, odometer: odometer ? parseFloat(odometer) : undefined })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <TruckIcon size={16} /> Start Trip
            </button>
          )}
          {trip.status === 'in_progress' && (
            <button
              className="btn btn-primary"
              id="deliver-trip-btn"
              disabled={deliverMutation.isPending}
              onClick={() => deliverMutation.mutate(id!)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-warning)', borderColor: 'var(--color-warning)' }}
            >
              <CheckCircleIcon size={16} /> Mark Delivered
            </button>
          )}
          {trip.status === 'delivered' && (
            <button
              className="btn btn-primary"
              id="complete-trip-btn"
              disabled={completeMutation.isPending}
              onClick={() => completeMutation.mutate({ id: id!, endOdometer: odometer ? parseFloat(odometer) : undefined })}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
            >
              <CheckIcon size={16} /> Complete Trip
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      {trip.status !== 'cancelled' && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStep;
              const active = idx === currentStep;
              return (
                <div key={step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '28px', height: '28px',
                      borderRadius: '50%',
                      background: done ? 'var(--color-primary)' : 'var(--color-surface2)',
                      border: `2px solid ${done ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 700,
                      color: done ? 'white' : 'var(--color-text-muted)',
                      boxShadow: active ? '0 0 0 4px var(--color-primary-dim)' : 'none',
                      transition: 'all 0.2s',
                    }}>
                      {done ? <CheckIcon size={14} /> : idx + 1}
                    </div>
                    <div style={{
                      fontSize: '11px', fontWeight: active ? 600 : 400,
                      color: done ? 'var(--color-text)' : 'var(--color-text-muted)',
                      textTransform: 'capitalize',
                    }}>
                      {step.replace('_', ' ')}
                    </div>
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div style={{
                      flex: 0.5, height: '2px',
                      background: idx < currentStep ? 'var(--color-primary)' : 'var(--color-border)',
                      margin: '0 0 20px',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Trip details */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPinIcon size={18} color="var(--color-primary)" /> Trip Details
          </div>
          <InfoRow label="Origin" value={trip.origin} />
          <InfoRow label="Destination" value={trip.destination} />
          <InfoRow label="Freight" value={trip.freightAmount ? `₹${Number(trip.freightAmount).toLocaleString('en-IN')}` : '—'} />
          <InfoRow label="Load" value={trip.loadDescription || '—'} />
          <InfoRow label="Weight" value={trip.loadWeightTons ? `${trip.loadWeightTons} Tons` : '—'} />
          <InfoRow label="Scheduled Start" value={trip.scheduledStart ? new Date(trip.scheduledStart).toLocaleString('en-IN') : '—'} />
          <InfoRow label="Actual Start" value={trip.actualStart ? new Date(trip.actualStart).toLocaleString('en-IN') : '—'} />
          <InfoRow label="Start Odometer" value={trip.startOdometer ? `${trip.startOdometer.toLocaleString()} km` : '—'} />
          <InfoRow label="End Odometer" value={trip.endOdometer ? `${trip.endOdometer.toLocaleString()} km` : '—'} />
          <InfoRow label="Distance" value={trip.distanceKm ? `${trip.distanceKm} km` : '—'} />
        </div>

        {/* Assignment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TruckIcon size={18} color="var(--color-info)" /> Assignment
            </div>
            <InfoRow label="Vehicle" value={trip.vehicle?.registrationNumber || 'Unassigned'} />
            <InfoRow label="Driver" value={trip.driver?.name || 'Unassigned'} />
            <InfoRow label="Customer" value={trip.customer?.name || '—'} />
          </div>

          {/* Odometer input for transitions */}
          {['assigned', 'in_progress', 'delivered', 'completed'].includes(trip.status) && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GaugeIcon size={18} color="var(--color-warning)" />
                {trip.status === 'assigned' ? 'Start Odometer Reading' : 'End Odometer Reading'}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  className="form-input"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder={trip.status === 'assigned' ? 'Start odometer (km)' : 'End odometer (km)'}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={updateMutation.isPending || !odometer}
                  onClick={handleSaveOdometer}
                  style={{ whiteSpace: 'nowrap', padding: '8px 14px', height: '38px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <GaugeIcon size={14} /> {updateMutation.isPending ? 'Saving…' : 'Save Reading'}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Used to calculate total trip distance & fleet metrics
              </p>
            </div>
          )}

          {/* Delivery proof */}
          {['delivered', 'completed'].includes(trip.status) && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CameraIcon size={18} color="var(--color-success)" /> Delivery Proof
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trip.deliveryProofUrl ? (
                  <div>
                    <a
                      href={trip.deliveryProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <EyeIcon size={14} /> View Uploaded Proof
                    </a>
                  </div>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No delivery proof uploaded</div>
                )}

                {/* Upload proof button */}
                <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', width: 'fit-content' }}>
                  <CameraIcon size={14} /> {uploading ? 'Uploading...' : trip.deliveryProofUrl ? 'Replace Proof' : 'Upload Proof (POD)'}
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {trip.notes && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-title" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextIcon size={18} color="var(--color-text-muted)" /> Notes
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{trip.notes}</p>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
