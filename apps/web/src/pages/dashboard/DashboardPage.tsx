import { useFleetSummary, useTripSummary, useExpiringDocuments } from '@hooks/useERP';
import {
  TruckIcon,
  CheckCircleIcon,
  MapPinIcon,
  WrenchIcon,
  AlertTriangleIcon,
  ClockIcon,
  ZapIcon,
  FuelIcon,
  DollarIcon,
  ReceiptIcon,
  TrendingUpIcon,
} from '@components/common/Icons';
import React from 'react';

const KPI_ICONS: Record<string, React.ReactNode> = {
  total: <TruckIcon size={20} color="var(--color-primary)" />,
  active: <CheckCircleIcon size={20} color="var(--color-success)" />,
  in_trip: <MapPinIcon size={20} color="var(--color-info)" />,
  maintenance: <WrenchIcon size={20} color="var(--color-danger)" />,
};

export default function DashboardPage() {
  const fleet = useFleetSummary();
  const trips = useTripSummary();
  const expiring = useExpiringDocuments(30);

  return (
    <div>
      {/* ── Fleet KPIs ─────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Overview</h1>
          <p className="page-subtitle">Live status of all vehicles</p>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ClockIcon size={14} /> {new Date().toLocaleTimeString('en-IN')}
        </span>
      </div>

      {/* Fleet stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {fleet.isLoading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : (['total', 'active', 'in_trip', 'maintenance'] as const).map((key) => (
              <div className="stat-card" key={key}>
                <div
                  className="stat-icon"
                  style={{
                    background: key === 'in_trip'
                      ? 'rgba(59,130,246,0.15)'
                      : key === 'maintenance'
                      ? 'rgba(239,68,68,0.15)'
                      : key === 'active'
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(249,115,22,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {KPI_ICONS[key]}
                </div>
                <div className="stat-info">
                  <div className="stat-value">{fleet.data?.[key] ?? 0}</div>
                  <div className="stat-label" style={{ textTransform: 'capitalize' }}>
                    {key.replace('_', ' ')} Vehicles
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Trips + alerts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Active trips */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPinIcon size={18} color="var(--color-info)" /> Active Trips
            </span>
            <a href="/trips" style={{ fontSize: '12px' }}>View all →</a>
          </div>
          {trips.isLoading ? (
            <div className="spinner-page"><div className="spinner" /></div>
          ) : (
            <div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-info)' }}>
                {trips.data?.inProgress ?? 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {trips.data?.assigned ?? 0} assigned · {trips.data?.delivered ?? 0} delivered today
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>{trips.data?.draft ?? 0}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Draft</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)' }}>
                    {trips.data?.completedToday ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Done Today</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expiring docs alert */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangleIcon size={18} color="var(--color-warning)" /> Expiring Documents (30 days)
            </span>
            <a href="/fleet" style={{ fontSize: '12px' }}>Fleet →</a>
          </div>
          {expiring.isLoading ? (
            <div className="spinner-page"><div className="spinner" /></div>
          ) : expiring.data?.length === 0 ? (
            <div style={{ color: 'var(--color-success)', fontSize: '13px', padding: '12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon size={16} /> All documents are up to date
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {expiring.data?.slice(0, 5).map((doc: any) => {
                const daysLeft = Math.ceil(
                  (new Date(doc.expiryDate).getTime() - Date.now()) / 86_400_000,
                );
                return (
                  <div
                    key={doc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--color-surface2)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>
                        {doc.vehicle?.registrationNumber} — {doc.type}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Expires {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <span
                      className={`badge badge-${daysLeft <= 7 ? 'maintenance' : 'assigned'}`}
                    >
                      {daysLeft}d
                    </span>
                  </div>
                );
              })}
              {(expiring.data?.length || 0) > 5 && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', paddingTop: '4px' }}>
                  + {expiring.data!.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ZapIcon size={18} color="var(--color-primary)" /> Quick Actions
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { label: 'New Trip', href: '/trips', icon: <MapPinIcon size={16} /> },
            { label: 'Fuel Entry', href: '/fuel', icon: <FuelIcon size={16} /> },
            { label: 'Expense', href: '/expenses', icon: <DollarIcon size={16} /> },
            { label: 'Invoice', href: '/billing', icon: <ReceiptIcon size={16} /> },
            { label: 'View Reports', href: '/reports', icon: <TrendingUpIcon size={16} /> },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="btn btn-secondary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {action.icon} {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card" style={{ opacity: 0.4 }}>
      <div className="stat-icon" style={{ background: 'var(--color-surface2)' }} />
      <div className="stat-info">
        <div style={{ height: '32px', width: '60px', background: 'var(--color-surface2)', borderRadius: '4px', marginBottom: '6px' }} />
        <div style={{ height: '12px', width: '100px', background: 'var(--color-surface2)', borderRadius: '4px' }} />
      </div>
    </div>
  );
}
