import React from 'react';
import { useAuthStore } from '@store/auth.store';
import { useTrips, useDriver } from '@hooks/useERP';
import { MapPinIcon, TruckIcon, DollarIcon, FuelIcon, CheckCircleIcon } from '@components/common/Icons';

const TRIP_STATUS_COLORS: Record<string, string> = {
  assigned: 'badge-assigned',
  in_progress: 'badge-in_trip',
  delivered: 'badge-active',
  completed: 'badge-active',
  pending: 'badge-inactive',
};

export default function DriverDashboardPage() {
  const { user } = useAuthStore();

  // Fetch this driver's trips using their driverId (stored in user object or linked)
  const { data: tripData, isLoading: tripsLoading } = useTrips({
    driverId: (user as any)?.driverId || undefined,
    limit: 5,
  });

  const trips = tripData?.items || [];
  const meta = tripData?.meta || { total: 0 };

  const activeTrips = trips.filter((t: any) => ['assigned', 'in_progress'].includes(t.status));
  const completedTrips = trips.filter((t: any) => ['completed', 'delivered'].includes(t.status));
  const totalFreight = trips.reduce((sum: number, t: any) => sum + Number(t.freightAmount || 0), 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'D'}
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</div>
          <div style={{ fontSize: '13px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
            Here's your personal driving summary for recent trips.
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KpiCard
          label="Total Trips"
          value={meta.total}
          icon={<MapPinIcon size={22} color="var(--color-primary)" />}
          color="rgba(99,102,241,0.12)"
        />
        <KpiCard
          label="Active Trips"
          value={activeTrips.length}
          icon={<TruckIcon size={22} color="var(--color-warning)" />}
          color="rgba(245,158,11,0.12)"
        />
        <KpiCard
          label="Completed"
          value={completedTrips.length}
          icon={<CheckCircleIcon size={22} color="var(--color-success)" />}
          color="rgba(16,185,129,0.12)"
        />
        <KpiCard
          label="Total Freight Value"
          value={`₹${totalFreight.toLocaleString('en-IN')}`}
          icon={<DollarIcon size={22} color="var(--color-info)" />}
          color="rgba(59,130,246,0.12)"
          isText
        />
      </div>

      {/* Recent Trips */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>Recent Trips</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
            Your last {trips.length} assigned trips
          </div>
        </div>
        <div className="table-wrapper">
          {tripsLoading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" /></div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <MapPinIcon size={40} color="var(--color-text-dim)" />
              </div>
              <div className="empty-state-text">No trips assigned yet</div>
              <div className="empty-state-sub">Contact your manager to get trips assigned</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Trip No.</th>
                  <th>Route</th>
                  <th>Scheduled Start</th>
                  <th>Freight (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)' }}>{t.tripNumber}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.origin}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>→ {t.destination}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {t.scheduledStart ? new Date(t.scheduledStart).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(t.freightAmount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${TRIP_STATUS_COLORS[t.status] || 'badge-inactive'}`}>
                        {t.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label, value, icon, color, isText = false,
}: {
  label: string; value: any; icon: React.ReactNode; color: string; isText?: boolean;
}) {
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
          <div style={{ fontSize: isText ? '20px' : '28px', fontWeight: 700, marginTop: '6px' }}>{value}</div>
        </div>
        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
