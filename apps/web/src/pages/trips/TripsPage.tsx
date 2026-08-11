import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrips, useCreateTrip, useVehicles, useDrivers, useCustomers } from '@hooks/useERP';
import {
  PlusIcon,
  SearchIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  FileTextIcon,
  CheckCircleIcon,
  TruckIcon,
  PackageIcon,
  CheckIcon,
  AlertCircleIcon,
  EyeIcon,
} from '@components/common/Icons';
import React from 'react';

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-draft',
  assigned: 'badge-assigned',
  in_progress: 'badge-in_trip',
  delivered: 'badge-delivered',
  completed: 'badge-completed',
  cancelled: 'badge-maintenance',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <FileTextIcon size={14} />,
  assigned: <CheckCircleIcon size={14} />,
  in_progress: <TruckIcon size={14} />,
  delivered: <PackageIcon size={14} />,
  completed: <CheckIcon size={14} />,
  cancelled: <AlertCircleIcon size={14} />,
};

export default function TripsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useTrips({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const trips = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Management</h1>
          <p className="page-subtitle">{meta.total} trips total</p>
        </div>
        <button
          className="btn btn-primary"
          id="new-trip-btn"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> New Trip
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={16} color="var(--color-text-muted)" />
          </span>
          <input
            type="text"
            placeholder="Search by trip no., origin or destination…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="trip-search"
          />
        </div>

        <select
          className="form-select"
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          id="trip-status-filter"
        >
          <option value="">All Statuses</option>
          {['draft', 'assigned', 'in_progress', 'delivered', 'completed', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip No.</th>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Customer</th>
                <th>Freight</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <MapPinIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No trips found</div>
                      <div className="empty-state-sub">Create your first trip to get started</div>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((t: any) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/trips/${t.id}`} style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {t.tripNumber}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 500 }}>{t.origin}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>→ {t.destination}</div>
                    </td>
                    <td style={{ fontSize: '12px' }}>{t.vehicle?.registrationNumber || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{t.driver?.name || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{t.customer?.name || '—'}</td>
                    <td style={{ fontSize: '12px', fontWeight: 500 }}>
                      {t.freightAmount ? `₹${Number(t.freightAmount).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {t.scheduledStart ? new Date(t.scheduledStart).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[t.status] || ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {STATUS_ICONS[t.status]} {t.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/trips/${t.id}`} className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}>
                        <EyeIcon size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {trips.length} of {meta.total}</span>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <button className="page-btn active">{page}</button>
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= meta.totalPages}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && <TripFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function TripFormModal({ onClose }: { onClose: () => void }) {
  const mutation = useCreateTrip();
  const { data: vehicleData } = useVehicles({ page: 1, limit: 100 });
  const { data: driverData } = useDrivers({ page: 1, limit: 100 });
  const { data: customerData } = useCustomers({ page: 1, limit: 100 });

  const vehicles = Array.isArray(vehicleData?.items)
    ? vehicleData.items
    : Array.isArray(vehicleData)
    ? vehicleData
    : [];

  const drivers = Array.isArray(driverData?.items)
    ? driverData.items
    : Array.isArray(driverData)
    ? driverData
    : [];

  const customers = Array.isArray(customerData?.items)
    ? customerData.items
    : Array.isArray(customerData)
    ? customerData
    : [];

  const [form, setForm] = useState({
    origin: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    customerId: '',
    scheduledStart: '',
    scheduledEnd: '',
    freightAmount: '',
    loadDescription: '',
    loadWeightTons: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({
      ...form,
      vehicleId: form.vehicleId || undefined,
      driverId: form.driverId || undefined,
      customerId: form.customerId || undefined,
      freightAmount: form.freightAmount ? parseFloat(form.freightAmount) : undefined,
      loadWeightTons: form.loadWeightTons ? parseFloat(form.loadWeightTons) : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <span className="modal-title">Create New Trip</span>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Route */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Origin *</label>
                <input className="form-input" required value={form.origin} onChange={(e) => set('origin', e.target.value)} placeholder="e.g. Chennai Port" />
              </div>
              <div className="form-group">
                <label className="form-label">Destination *</label>
                <input className="form-input" required value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="e.g. Coimbatore Estate" />
              </div>
            </div>

            {/* Vehicle & Driver Selection */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assign Vehicle</label>
                <select className="form-select" value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.make} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Driver</label>
                <select className="form-select" value={form.driverId} onChange={(e) => set('driverId', e.target.value)}>
                  <option value="">-- Select Driver --</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Customer */}
            <div className="form-group">
              <label className="form-label">Customer</label>
              <select className="form-select" value={form.customerId} onChange={(e) => set('customerId', e.target.value)}>
                <option value="">-- Select Customer (Optional) --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Timings */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Scheduled Start</label>
                <input type="datetime-local" className="form-input" value={form.scheduledStart} onChange={(e) => set('scheduledStart', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Scheduled End</label>
                <input type="datetime-local" className="form-input" value={form.scheduledEnd} onChange={(e) => set('scheduledEnd', e.target.value)} />
              </div>
            </div>

            {/* Freight & Cargo */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Freight Amount (₹)</label>
                <input type="number" className="form-input" value={form.freightAmount} onChange={(e) => set('freightAmount', e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Load Weight (Tons)</label>
                <input type="number" step="0.5" className="form-input" value={form.loadWeightTons} onChange={(e) => set('loadWeightTons', e.target.value)} placeholder="e.g. 20" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Load Description</label>
              <textarea className="form-textarea" rows={2} value={form.loadDescription} onChange={(e) => set('loadDescription', e.target.value)} placeholder="What cargo is being transported…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="create-trip-btn" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
