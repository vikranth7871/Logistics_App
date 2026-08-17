import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  XIcon, CheckCircleIcon, MapPinIcon, TruckIcon,
  UsersIcon, FileTextIcon, ClockIcon,
  CheckIcon, AlertTriangleIcon, CameraIcon
} from '@components/common/Icons';

interface MarkDeliveredModalProps {
  trip: any;
  onClose: () => void;
  onConfirm: (data: {
    tripId: string;
    endOdometer: number;
    deliveredAt: string;
    receiverName?: string;
    podFile?: File | null;
    notes?: string;
  }) => Promise<void> | void;
}

export default function MarkDeliveredModal({ trip, onClose, onConfirm }: MarkDeliveredModalProps) {
  const startOdo = Number(trip.startOdometer || trip.startOdometerKm || 84200);
  const estimatedDist = Number(trip.distanceKm || 460);

  const [endOdometer, setEndOdometer] = useState<string>(String(startOdo + estimatedDist));
  const [deliveredAt, setDeliveredAt] = useState<string>(new Date().toISOString().slice(0, 16));
  const [receiverName, setReceiverName] = useState('');
  const [notes, setNotes] = useState('All cargo received in good condition, seal verified.');
  const [podFile, setPodFile] = useState<File | null>(null);
  const [podPreview, setPodPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const odoNum = parseFloat(endOdometer);
  const distanceCovered = !isNaN(odoNum) && odoNum >= startOdo ? odoNum - startOdo : 0;
  const isOdometerValid = !isNaN(odoNum) && odoNum >= startOdo;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPodFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPodPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOdometerValid) {
      alert(`End odometer reading (${odoNum} KM) must be greater than or equal to start odometer (${startOdo} KM)`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        tripId: trip.id,
        endOdometer: odoNum,
        deliveredAt,
        receiverName: receiverName.trim() || undefined,
        podFile,
        notes: notes.trim() || undefined,
      });
      toast.success(`Trip ${trip.tripNumber} marked as Delivered!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircleIcon size={22} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                Confirm Delivery &amp; POD Upload
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Trip #{trip.tripNumber || trip.id} • {trip.origin} ➔ {trip.destination}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Trip Snapshot Banner */}
            <div style={{
              background: 'var(--color-surface2)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
            }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>LORRY VEHICLE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                  {trip.vehicle?.registrationNumber || trip.vehicleNumber || 'TN72BT7517'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>ASSIGNED DRIVER</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                  {trip.driver?.name || trip.driverName || 'Arjun R'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>START ODOMETER</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f97316', marginTop: '2px' }}>
                  {startOdo.toLocaleString('en-IN')} KM
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>ESTIMATED DISTANCE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>
                  {estimatedDist} KM
                </div>
              </div>
            </div>

            {/* Odometer Inputs & Auto-Calculation */}
            <div style={{ background: 'rgba(249,115,22,0.06)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Final / Delivery Odometer (KM) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    className="form-input"
                    value={endOdometer}
                    onChange={(e) => setEndOdometer(e.target.value)}
                    placeholder="e.g. 84680"
                    style={{ fontSize: '14px', fontWeight: 700, color: '#f97316' }}
                  />
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Start reading: {startOdo} KM
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>Delivery Timestamp</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    required
                    value={deliveredAt}
                    onChange={(e) => setDeliveredAt(e.target.value)}
                  />
                </div>
              </div>

              {/* Calculated Distance Tag */}
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', background: 'var(--color-surface2)', padding: '6px 12px', borderRadius: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Trip Distance Covered:</span>
                <span style={{ fontWeight: 800, color: isOdometerValid ? '#22c55e' : '#ef4444' }}>
                  {isOdometerValid ? `${distanceCovered.toLocaleString('en-IN')} KM` : 'Invalid Odometer reading'}
                </span>
              </div>
            </div>

            {/* Proof of Delivery (POD) Upload Box */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Proof of Delivery (POD) / Signed LR Copy</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Photo or PDF Challan</span>
              </label>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                background: 'var(--color-surface2)',
                cursor: 'pointer',
                position: 'relative',
              }}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />

                {podPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <img
                      src={podPreview}
                      alt="POD Preview"
                      style={{ height: '60px', width: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>✓ {podFile?.name || 'pod_signed.jpg'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Click to replace document</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(249,115,22,0.15)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CameraIcon size={18} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                      Click or drag signed Delivery Challan / LR Slip photo
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      Supports JPG, PNG, PDF up to 10MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Consignee Info & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Received By (Consignee Name)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sundar Logistics In-Charge"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unloading Remarks / Condition</label>
                <input
                  type="text"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit-mark-delivered-btn"
              disabled={isSubmitting || !isOdometerValid}
              style={{
                background: '#f97316',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Recording Delivery...
                </>
              ) : (
                <>
                  <CheckCircleIcon size={16} /> Confirm &amp; Mark Delivered
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
