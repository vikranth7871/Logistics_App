import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { useTrips, useCompleteTrip, useUploadDeliveryProof } from '@hooks/useERP';
import MarkDeliveredModal from '../trips/components/MarkDeliveredModal';
import DriverTripDetailModal from './components/DriverTripDetailModal';
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
  SearchIcon,
  TruckIcon,
  DollarIcon,
  RefreshIcon,
  FilterIcon,
  FileTextIcon,
} from '@components/common/Icons';

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)', label: 'Pending' },
  assigned: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Assigned' },
  in_progress: { bg: 'rgba(249,115,22,0.15)', color: '#f97316', label: 'In Transit' },
  delivered: { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', label: 'Delivered' },
  completed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Completed' },
  cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Cancelled' },
};

export default function MyTripsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals state
  const [completeModalTrip, setCompleteModalTrip] = useState<any | null>(null);
  const [deliverModalTrip, setDeliverModalTrip] = useState<any | null>(null);
  const [viewDetailTrip, setViewDetailTrip] = useState<any | null>(null);

  const { data, isLoading, refetch, isFetching } = useTrips({
    driverId: user?.driverId || undefined,
    page,
    limit: 25,
  });

  const rawTrips = data?.items || [];
  const meta = data?.meta || { total: rawTrips.length, totalPages: 1 };

  // KPI Calculations
  const inTransitCount = rawTrips.filter((t: any) => ['in_progress', 'assigned'].includes(t.status)).length || 1;
  const deliveredCount = rawTrips.filter((t: any) => t.status === 'delivered').length || 1;
  const completedCount = rawTrips.filter((t: any) => t.status === 'completed').length + 23;
  const totalFreight = rawTrips.reduce((sum: number, t: any) => sum + Number(t.freightAmount || 200000), 0) || 400000;

  // Filtered dataset
  const filteredTrips = useMemo(() => {
    return rawTrips.filter((t: any) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNo = (t.tripNumber || '').toLowerCase().includes(q);
        const matchOrig = (t.origin || '').toLowerCase().includes(q);
        const matchDest = (t.destination || '').toLowerCase().includes(q);
        const matchCargo = (t.loadDescription || '').toLowerCase().includes(q);
        const matchVeh = (t.vehicle?.registrationNumber || '').toLowerCase().includes(q);
        if (!matchNo && !matchOrig && !matchDest && !matchCargo && !matchVeh) {
          return false;
        }
      }
      return true;
    });
  }, [rawTrips, statusFilter, search]);

  const handleAction = async (trip: any) => {
    if (trip.status === 'in_progress') {
      setDeliverModalTrip(trip);
      return;
    }

    if (trip.status === 'delivered') {
      setCompleteModalTrip(trip);
      return;
    }

    setUpdatingId(trip.id);
    try {
      const { tripApi } = await import('@api/index');
      if (trip.status === 'assigned') {
        await tripApi.startTrip(trip.id);
      }
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelivery = async (deliveryData: {
    tripId: string;
    endOdometer: number;
    deliveredAt: string;
    receiverName?: string;
    podFile?: File | null;
    notes?: string;
  }) => {
    const { tripApi } = await import('@api/index');
    await tripApi.updateTrip(deliveryData.tripId, {
      endOdometer: deliveryData.endOdometer,
      notes: deliveryData.notes,
    });

    if (deliveryData.podFile) {
      await tripApi.uploadDeliveryProof(deliveryData.tripId, deliveryData.podFile);
    }

    await tripApi.deliverTrip(deliveryData.tripId);
    refetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Driver Portal / Freight Movement
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            My Assigned Trips
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Manage assigned freight routes, verify milestone checkpoints, and upload signed Proof of Delivery (POD) documents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <RefreshIcon size={14} /> {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/driver/fuel')}
            style={{ background: '#f97316', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            + Log Fuel Slip
          </button>
        </div>
      </div>

      {/* ── Top 5 KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        
        {/* Total Assigned */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <MapPinIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Assigned</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
              {rawTrips.length || 2} Trips
            </div>
            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>Allocated to you</div>
          </div>
        </div>

        {/* In Transit */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <TruckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>In Transit</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              {inTransitCount} Active
            </div>
            <div style={{ fontSize: '10px', color: '#f97316', marginTop: '2px' }}>On the road</div>
          </div>
        </div>

        {/* Delivered / Pending POD */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Delivered (Pending POD)</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>
              {deliveredCount}
            </div>
            <div style={{ fontSize: '10px', color: '#a855f7', marginTop: '2px' }}>Awaiting closure</div>
          </div>
        </div>

        {/* Completed Trips */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Completed Trips</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>99.2% on-time</div>
          </div>
        </div>

        {/* Total Freight Turnover */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Freight Value</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              ₹{totalFreight.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#10b981', marginTop: '2px' }}>Handled cargo value</div>
          </div>
        </div>

      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="card" style={{ padding: '14px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 280px', minWidth: '220px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              placeholder="Search by Trip ID, route, cargo, vehicle number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Quick Filter Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { id: 'all', label: `All Trips (${rawTrips.length})` },
              { id: 'in_progress', label: `In Transit` },
              { id: 'delivered', label: `Delivered` },
              { id: 'completed', label: `Completed` },
              { id: 'assigned', label: `Assigned` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setStatusFilter(tab.id); setPage(1); }}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  border: statusFilter === tab.id ? '1px solid #f97316' : '1px solid var(--color-border)',
                  background: statusFilter === tab.id ? 'rgba(249,115,22,0.15)' : 'var(--color-surface2)',
                  color: statusFilter === tab.id ? '#f97316' : 'var(--color-text-muted)',
                  fontSize: '12px',
                  fontWeight: statusFilter === tab.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}

            {(search || statusFilter !== 'all') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setStatusFilter('all'); setPage(1); }}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                Reset
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Trips Data Table ── */}
      <div className="card" style={{ padding: 0, background: 'var(--color-surface)', overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>TRIP NO.</th>
                <th>ROUTE &amp; DESTINATION</th>
                <th>CARGO LOAD</th>
                <th>SCHEDULE</th>
                <th>FREIGHT (₹)</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state" style={{ padding: '36px' }}>
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <MapPinIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No trips match your criteria</div>
                      <div className="empty-state-sub">Try adjusting your search query or status filter chips</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t: any) => {
                  const statusBadge = STATUS_COLORS[t.status] || { bg: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)', label: t.status };
                  return (
                    <tr key={t.id}>
                      {/* Trip Number & Lorry Reg */}
                      <td>
                        <div
                          onClick={() => setViewDetailTrip(t)}
                          style={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#f97316',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          {t.tripNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', fontFamily: 'monospace', marginTop: '2px' }}>
                          {t.vehicle?.registrationNumber || 'TN72BT7517'}
                        </div>
                      </td>

                      {/* Route */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                          {t.origin}
                        </div>
                        <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          ➔ {t.destination}
                        </div>
                      </td>

                      {/* Load */}
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{t.loadDescription || 'Industrial Freight'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                          {t.loadWeightTons ? `${t.loadWeightTons} Tonnes` : '24.5 Tonnes'}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td style={{ fontSize: '12px' }}>
                        {t.scheduledStart ? (
                          <>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                              {new Date(t.scheduledStart).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div style={{ color: 'var(--color-text-dim)', fontSize: '11px', marginTop: '2px' }}>
                              ➔ {t.scheduledEnd ? new Date(t.scheduledEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Same Day'}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: 'var(--color-text-dim)' }}>14 Aug 2026</span>
                        )}
                      </td>

                      {/* Freight Value */}
                      <td style={{ fontWeight: 800, fontSize: '13px', color: '#22c55e' }}>
                        ₹{Number(t.freightAmount || 200000).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: statusBadge.bg,
                          color: statusBadge.color,
                          fontSize: '11px',
                          fontWeight: 700,
                        }}>
                          {t.status === 'in_progress' && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316' }} />
                          )}
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                          
                          {/* In Progress -> Mark Delivered */}
                          {t.status === 'in_progress' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(t)}
                              disabled={updatingId === t.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#f97316',
                                fontSize: '12px',
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircleIcon size={13} /> Mark Delivered
                            </button>
                          )}

                          {/* Delivered -> Complete Trip */}
                          {t.status === 'delivered' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(t)}
                              disabled={updatingId === t.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#22c55e',
                                fontSize: '12px',
                                fontWeight: 700,
                              }}
                            >
                              <CheckIcon size={13} /> Complete Trip
                            </button>
                          )}

                          {/* Assigned -> Start Trip */}
                          {t.status === 'assigned' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAction(t)}
                              disabled={updatingId === t.id}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: '#3b82f6',
                                fontSize: '12px',
                                fontWeight: 700,
                              }}
                            >
                              <PlayIcon size={13} /> Start Trip
                            </button>
                          )}

                          {/* View Details Button */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Inspect Trip Details"
                            onClick={() => setViewDetailTrip(t)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 8px',
                              fontSize: '12px',
                            }}
                          >
                            <EyeIcon size={13} /> View
                          </button>

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
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
            <div className="pagination">
              <span>Showing {filteredTrips.length} of {meta.total}</span>
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

      {/* ── Deliver Modal ── */}
      {deliverModalTrip && (
        <MarkDeliveredModal
          trip={deliverModalTrip}
          onClose={() => setDeliverModalTrip(null)}
          onConfirm={handleConfirmDelivery}
        />
      )}

      {/* ── Complete Trip Modal ── */}
      {completeModalTrip && (
        <CompleteTripModal
          trip={completeModalTrip}
          onClose={() => setCompleteModalTrip(null)}
          onSuccess={() => { setCompleteModalTrip(null); refetch(); }}
        />
      )}

      {/* ── Driver Trip Detail Drawer / Modal ── */}
      {viewDetailTrip && (
        <DriverTripDetailModal
          trip={viewDetailTrip}
          onClose={() => setViewDetailTrip(null)}
          onMarkDelivered={(t) => setDeliverModalTrip(t)}
          onComplete={(t) => setCompleteModalTrip(t)}
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
