import React, { useState } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useTrips } from '@hooks/useERP';
import { MapPinIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, PlayIcon } from '@components/common/Icons';

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-inactive',
  assigned: 'badge-assigned',
  in_progress: 'badge-in_trip',
  delivered: 'badge-active',
  completed: 'badge-active',
  cancelled: 'badge-maintenance',
};

const DRIVER_ACTIONS: Record<string, { label: string; nextStatus: string; color: string }> = {
  assigned: { label: 'Start Trip', nextStatus: 'in_progress', color: 'var(--color-primary)' },
  in_progress: { label: 'Mark Delivered', nextStatus: 'delivered', color: 'var(--color-success)' },
};

export default function MyTripsPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useTrips({
    driverId: (user as any)?.driverId || undefined,
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  const trips = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleAction = async (trip: any) => {
    const action = DRIVER_ACTIONS[trip.status];
    if (!action) return;
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
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {t.tripNumber}
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
                        {action ? (
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
                            {t.status === 'assigned' ? <PlayIcon size={12} /> : <CheckCircleIcon size={12} />}
                            {updatingId === t.id ? 'Updating…' : action.label}
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>—</span>
                        )}
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
    </div>
  );
}
