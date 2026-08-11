import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { useTrips, useCompleteTrip, useUploadDeliveryProof } from '@hooks/useERP';
import {
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PlayIcon,
  CheckIcon,
  EyeIcon,
  GaugeIcon,
  CameraIcon,
  XIcon,
} from '@components/common/Icons';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-inactive',
  assigned: 'badge-assigned',
  in_progress: 'badge-in_trip',
  delivered: 'badge-delivered',
  completed: 'badge-completed',
  cancelled: 'badge-maintenance',
};

const DRIVER_ACTIONS: Record<string, { label: string; nextStatus: string; color: string }> = {
  assigned: { label: 'Start Trip', nextStatus: 'in_progress', color: 'var(--color-primary)' },
  in_progress: { label: 'Mark Delivered', nextStatus: 'delivered', color: 'var(--color-warning)' },
  delivered: { label: 'Complete Trip', nextStatus: 'completed', color: 'var(--color-success)' },
};

export default function MyTripsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [completeModalTrip, setCompleteModalTrip] = useState<any | null>(null);

  const { data, isLoading, refetch } = useTrips({
    driverId: user?.driverId || undefined,
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  const trips = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleAction = async (trip: any) => {
    if (trip.status === 'delivered') {
      setCompleteModalTrip(trip);
      return;
    }

    setUpdatingId(trip.id);
    try {
      const { tripApi } = await import('@api/index');
      if (trip.status === 'assigned') {
        await tripApi.startTrip(trip.id);
      } else if (trip.status === 'in_progress') {
        await tripApi.deliverTrip(trip.id);
      }
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-subtitle">{meta.total} trips assigned to you</p>
        </div>
        <select
          className="form-select"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip No.</th>
                <th>Route</th>
                <th>Load</th>
                <th>Scheduled</th>
                <th>Freight (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <MapPinIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No trips found</div>
                      <div className="empty-state-sub">No trips are currently assigned to you</div>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((t: any) => {
                  const action = DRIVER_ACTIONS[t.status];
                  return (
                    <tr key={t.id}>
                      <td>
                        <Link
                          to={`/driver/trips/${t.id}`}
                          style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary)' }}
                        >
                          {t.tripNumber}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.origin}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>→ {t.destination}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px' }}>{t.loadDescription || '—'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{t.loadWeightTons ? `${t.loadWeightTons}T` : ''}</div>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {t.scheduledStart ? (
                          <>
                            <div>{new Date(t.scheduledStart).toLocaleDateString('en-IN')}</div>
                            <div style={{ color: 'var(--color-text-dim)' }}>
                              → {t.scheduledEnd ? new Date(t.scheduledEnd).toLocaleDateString('en-IN') : '—'}
                            </div>
                          </>
                        ) : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>₹{Number(t.freightAmount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${STATUS_COLORS[t.status] || 'badge-inactive'}`}>
                          {t.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {action && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(t)}
                              disabled={updatingId === t.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: action.color,
                                borderColor: action.color,
                                fontSize: '12px',
                              }}
                            >
                              {t.status === 'assigned' ? <PlayIcon size={12} /> : t.status === 'in_progress' ? <CheckCircleIcon size={12} /> : <CheckIcon size={12} />}
                              {updatingId === t.id ? 'Updating…' : action.label}
                            </button>
                          )}
                          <Link
                            to={`/driver/trips/${t.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Details"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 8px' }}
                          >
                            <EyeIcon size={14} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {trips.length} of {meta.total}</span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <button className="page-btn active">{page}</button>
                <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {completeModalTrip && (
        <CompleteTripModal
          trip={completeModalTrip}
          onClose={() => setCompleteModalTrip(null)}
          onSuccess={() => { setCompleteModalTrip(null); refetch(); }}
        />
      )}
    </div>
  );
}

function CompleteTripModal({ trip, onClose, onSuccess }: { trip: any; onClose: () => void; onSuccess: () => void }) {
  const completeMutation = useCompleteTrip();
  const uploadProofMutation = useUploadDeliveryProof();

  const [endOdometer, setEndOdometer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedFile) {
        await uploadProofMutation.mutateAsync({ id: trip.id, file: selectedFile });
      }
      await completeMutation.mutateAsync({
        id: trip.id,
        endOdometer: endOdometer ? parseFloat(endOdometer) : undefined,
      });
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">Complete Trip</span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '2px', fontFamily: 'monospace' }}>
              {trip.tripNumber} ({trip.origin} → {trip.destination})
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GaugeIcon size={16} color="var(--color-warning)" /> End Odometer Reading (km)
              </label>
              <input
                type="number"
                className="form-input"
                value={endOdometer}
                onChange={(e) => setEndOdometer(e.target.value)}
                placeholder="Enter final odometer (e.g. 45200)"
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                Optional — used to compute total trip distance driven
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CameraIcon size={16} color="var(--color-success)" /> Upload Proof of Delivery (POD)
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="form-input"
                style={{ padding: '6px' }}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                Attach signed Lorry Receipt / Proof of Delivery image or PDF
              </span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
            >
              {submitting ? 'Completing…' : '✓ Finish & Complete Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
