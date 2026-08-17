import { useParams, Link } from 'react-router-dom';
import { useTrip, useStartTrip, useDeliverTrip, useCompleteTrip, useUploadDeliveryProof, useUpdateTrip } from '@hooks/useERP';
import { useState, useEffect } from 'react';
import MarkDeliveredModal from './components/MarkDeliveredModal';
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
  DownloadIcon,
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
  const [showProofModal, setShowProofModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);

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

  const handleConfirmDelivery = async (data: {
    tripId: string;
    endOdometer: number;
    deliveredAt: string;
    receiverName?: string;
    podFile?: File | null;
    notes?: string;
  }) => {
    // 1. Update trip end odometer & notes
    await updateMutation.mutateAsync({
      id: data.tripId,
      data: {
        endOdometer: data.endOdometer,
        notes: data.notes || trip?.notes,
      },
    });

    // 2. Upload POD if file provided
    if (data.podFile) {
      await uploadProofMutation.mutateAsync({
        id: data.tripId,
        file: data.podFile,
      });
    }

    // 3. Mark delivered
    await deliverMutation.mutateAsync(data.tripId);
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
              onClick={() => setShowDeliverModal(true)}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trip.deliveryProofUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Thumbnail preview */}
                    <div
                      onClick={() => setShowProofModal(true)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        maxHeight: '160px',
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Click to view full size"
                    >
                      {trip.deliveryProofUrl.startsWith('data:application/pdf') || trip.deliveryProofUrl.toLowerCase().includes('.pdf') ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-primary)' }}>
                          <FileTextIcon size={36} />
                          <div style={{ fontSize: '12px', marginTop: '6px', fontWeight: 600 }}>PDF Document Attached</div>
                        </div>
                      ) : (
                        <img
                          src={trip.deliveryProofUrl}
                          alt="POD Preview"
                          style={{ width: '100%', maxHeight: '160px', objectFit: 'cover' }}
                        />
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowProofModal(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <EyeIcon size={14} /> View Full Proof
                      </button>
                      <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <CameraIcon size={14} /> {uploading ? 'Uploading...' : 'Replace Proof'}
                        <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>No delivery proof uploaded</div>
                    <label className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', width: 'fit-content' }}>
                      <CameraIcon size={14} /> {uploading ? 'Uploading...' : 'Upload Proof (POD)'}
                      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                )}
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

      {/* Proof Lightbox Modal */}
      {showProofModal && trip.deliveryProofUrl && (
        <ProofModal url={trip.deliveryProofUrl} onClose={() => setShowProofModal(false)} />
      )}

      {/* Mark Delivered Modal */}
      {showDeliverModal && (
        <MarkDeliveredModal
          trip={trip}
          onClose={() => setShowDeliverModal(false)}
          onConfirm={handleConfirmDelivery}
        />
      )}
    </div>
  );
}

function ProofModal({ url, onClose }: { url: string; onClose: () => void }) {
  const isPdf = url.startsWith('data:application/pdf') || url.toLowerCase().includes('.pdf');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '750px', width: '90%' }}>
        <div className="modal-header">
          <span className="modal-title">Delivery Proof (POD)</span>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <div
          className="modal-body"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            background: '#0a0a0c',
            borderRadius: '8px',
            minHeight: '300px',
          }}
        >
          {isPdf ? (
            <iframe src={url} style={{ width: '100%', height: '520px', border: 'none' }} title="Delivery Proof PDF" />
          ) : (
            <img
              src={url}
              alt="Delivery Proof POD"
              style={{ maxWidth: '100%', maxHeight: '520px', borderRadius: '6px', objectFit: 'contain' }}
            />
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <a
            href={url}
            download="delivery-proof"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <DownloadIcon size={14} /> Download File
          </a>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
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
