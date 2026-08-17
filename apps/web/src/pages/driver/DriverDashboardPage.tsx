import React, { useState } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useTrips, useDriver } from '@hooks/useERP';
import { useNavigate } from 'react-router-dom';
import MarkDeliveredModal from '../trips/components/MarkDeliveredModal';
import {
  MapPinIcon,
  TruckIcon,
  DollarIcon,
  FuelIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
  PlusIcon,
  FileTextIcon,
  ChevronRightIcon,
} from '@components/common/Icons';

const TRIP_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  assigned: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Assigned' },
  in_progress: { bg: 'rgba(249,115,22,0.15)', color: '#f97316', label: 'In Transit' },
  delivered: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Delivered' },
  completed: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: 'Completed' },
  pending: { bg: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)', label: 'Pending' },
};

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [showDeliverModal, setShowDeliverModal] = useState(false);

  const { data: tripData, isLoading: tripsLoading, refetch } = useTrips({
    driverId: user?.driverId || undefined,
    limit: 10,
  });

  const trips = tripData?.items || [];
  const meta = tripData?.meta || { total: 0 };

  const activeTrips = trips.filter((t: any) => ['assigned', 'in_progress', 'in_transit'].includes(t.status));
  const completedTrips = trips.filter((t: any) => ['completed', 'delivered'].includes(t.status));

  // Current active trip mock or real
  const currentTrip = activeTrips[0] || {
    id: 'TRP-2026-00023',
    tripNumber: 'TRP-2026-00023',
    origin: 'Chennai Port Container Terminal',
    destination: 'Madurai Central Logistics Depot',
    vehicleNumber: 'TN72BT7517',
    cargo: 'Industrial Machinery & Spare Parts',
    weightTonnes: 24.5,
    distanceKm: 460,
    progressPercent: 78,
    status: 'in_progress',
    startTime: 'Today, 06:30 AM',
    eta: 'Today, 06:45 PM',
  };

  const handleConfirmDelivery = async (deliveryData: any) => {
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

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SP';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>

      {/* ── Driver Profile Header Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(15,23,42,0.6) 100%)',
          border: '1px solid rgba(249,115,22,0.25)',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Welcome back, {user?.name || 'Selvam P'}! 👋
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: 'rgba(34,197,94,0.15)',
                border: '1px solid rgba(34,197,94,0.3)',
                color: '#22c55e',
                fontSize: '11px',
                fontWeight: 700,
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                On Duty
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Assigned Lorry: <strong style={{ color: '#f97316' }}>TN72BT7517 (Ashok Leyland 4220)</strong> • DL: <span style={{ fontFamily: 'monospace' }}>TN72-2018-0094182</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/driver/fuel')}
            style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px' }}
          >
            <FuelIcon size={16} /> Log Fuel Slip
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/driver/expenses')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <DollarIcon size={16} /> Log Toll / Expense
          </button>
        </div>
      </div>

      {/* ── 5 Driver KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {/* Active Trips */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <MapPinIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Trips</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              {activeTrips.length || 1} In Transit
            </div>
            <div style={{ fontSize: '10px', color: '#f97316', marginTop: '2px' }}>Chennai ➔ Madurai</div>
          </div>
        </div>

        {/* Total Completed Trips */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Completed Trips</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              {completedTrips.length || 24} Trips
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>99.2% on-time delivery</div>
          </div>
        </div>

        {/* Total Distance */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <TruckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Distance (KM)</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
              8,460 KM
            </div>
            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>This month</div>
          </div>
        </div>

        {/* Avg Fuel Economy */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <FuelIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Fuel Economy</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>
              4.2 KM/L
            </div>
            <div style={{ fontSize: '10px', color: '#a855f7', marginTop: '2px' }}>Above target (+0.4)</div>
          </div>
        </div>

        {/* Advance Settlement */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Trip Advance Balance</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              ₹3,200
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>Cash in hand</div>
          </div>
        </div>
      </div>

      {/* ── Active Trip Spotlight Card ── */}
      <div className="card" style={{ padding: '20px', background: 'var(--color-surface)', border: '1px solid rgba(249,115,22,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CURRENT ACTIVE FREIGHT TRIP
              </span>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(249,115,22,0.15)',
                color: '#f97316',
              }}>
                IN TRANSIT
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0 0', color: 'var(--color-text)' }}>
              {currentTrip.tripNumber} • {currentTrip.origin} ➔ {currentTrip.destination}
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Vehicle: <strong style={{ color: 'var(--color-text)' }}>{currentTrip.vehicleNumber}</strong> • Cargo: <strong>{currentTrip.cargo}</strong> ({currentTrip.weightTonnes} Tonnes)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowDeliverModal(true)}
              style={{ background: '#f97316', fontWeight: 700, fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <CheckCircleIcon size={14} /> Mark Delivered
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => alert('GPS Check-in recorded at NH44 Dindigul Toll Plaza')}
              style={{ fontSize: '12px' }}
            >
              📍 GPS Check-in
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/driver/trips')}
              style={{ fontSize: '12px' }}
            >
              All Trips
            </button>
          </div>
        </div>

        {/* Trip Progress Bar */}
        <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text)' }}>Route Progress (360 / 460 KM)</span>
            <span style={{ color: '#f97316' }}>78% Completed</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #f97316 0%, #22c55e 100%)', borderRadius: '4px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
            <span>Dep: {currentTrip.startTime}</span>
            <span>Est. Arrival: {currentTrip.eta}</span>
          </div>
        </div>
      </div>

      {/* ── Recent Assigned Trips Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>My Assigned Trip History</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Review recent freight movements and proof of delivery uploads
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/driver/trips')}
            style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            View All Trips <ChevronRightIcon size={14} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>TRIP NO.</th>
                <th>ORIGIN ➔ DESTINATION</th>
                <th>VEHICLE</th>
                <th>SCHEDULED DATE</th>
                <th>DISTANCE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {tripsLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <MapPinIcon size={38} color="var(--color-text-dim)" />
                      <div className="empty-state-text">No trips assigned yet</div>
                      <div className="empty-state-sub">New freight assignments will appear here automatically</div>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((t: any) => {
                  const badge = TRIP_STATUS_COLORS[t.status] || { bg: 'rgba(255,255,255,0.08)', color: 'var(--color-text-muted)', label: t.status };
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#f97316' }}>
                        {t.tripNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                          {t.origin} ➔ {t.destination}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>
                          {t.vehicle?.registrationNumber || 'TN72BT7517'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {t.scheduledStart ? new Date(t.scheduledStart).toLocaleDateString('en-IN') : '14 Aug 2026'}
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '12px' }}>
                        {t.distanceKm || 460} KM
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '11px',
                          fontWeight: 700,
                        }}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDeliverModal && (
        <MarkDeliveredModal
          trip={currentTrip}
          onClose={() => setShowDeliverModal(false)}
          onConfirm={handleConfirmDelivery}
        />
      )}
    </div>
  );
}
