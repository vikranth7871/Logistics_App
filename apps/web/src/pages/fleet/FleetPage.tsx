import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles, useDeleteVehicle } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import VehicleFormModal from './components/VehicleFormModal';
import { PlusIcon, SearchIcon, TruckIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, TrashIcon } from '@components/common/Icons';

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-active',
  in_trip: 'badge-in_trip',
  maintenance: 'badge-maintenance',
  inactive: 'badge-inactive',
};

export default function FleetPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canManage = ['admin', 'manager'].includes(user?.role || '');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useVehicles({
    page,
    limit: 20,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const deleteMutation = useDeleteVehicle();

  const vehicles = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const handleDelete = (id: string, reg: string) => {
    if (window.confirm(`Remove vehicle ${reg}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fleet Management</h1>
          <p className="page-subtitle">{meta.total} vehicles registered</p>
        </div>
        {canManage && (
          <button
            className="btn btn-primary"
            id="add-vehicle-btn"
            onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={16} /> Add Vehicle
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={16} color="var(--color-text-muted)" />
          </span>
          <input
            type="text"
            placeholder="Search by reg. number…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="vehicle-search"
          />
        </div>

        <select
          className="form-select"
          style={{ width: '160px' }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          id="vehicle-status-filter"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_trip">In Trip</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reg. Number</th>
                <th>Make / Model</th>
                <th>Year</th>
                <th>Capacity</th>
                <th>Odometer</th>
                <th>Insurance Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <TruckIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No vehicles found</div>
                      <div className="empty-state-sub">Add your first vehicle to get started</div>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((v: any) => (
                  <tr key={v.id}>
                    <td>
                      <Link to={`/fleet/${v.id}`} style={{ fontWeight: 600 }}>
                        {v.registrationNumber}
                      </Link>
                    </td>
                    <td>{[v.make, v.model].filter(Boolean).join(' ') || '—'}</td>
                    <td>{v.year || '—'}</td>
                    <td>{v.capacityTons ? `${v.capacityTons}T` : '—'}</td>
                    <td>{v.currentOdometer ? `${v.currentOdometer.toLocaleString()} km` : '—'}</td>
                    <td>
                      {v.insuranceExpiry ? (
                        <ExpiryLabel date={v.insuranceExpiry} />
                      ) : (
                        <span style={{ color: 'var(--color-text-dim)', fontSize: '12px' }}>Not set</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[v.status] || 'badge-inactive'}`}>
                        {v.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <Link
                          to={`/fleet/${v.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                        >
                          <EyeIcon size={15} /> View
                        </Link>
                        {isAdmin && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDelete(v.id, v.registrationNumber)}
                            disabled={deleteMutation.isPending}
                            title="Delete Vehicle"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', color: 'var(--color-danger)' }}
                          >
                            <TrashIcon size={15} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {vehicles.length} of {meta.total}</span>
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

      {/* Add Vehicle Modal */}
      {showForm && <VehicleFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ExpiryLabel({ date }: { date: string }) {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
  const color = days < 0 ? 'var(--color-danger)' : days <= 30 ? 'var(--color-warning)' : 'var(--color-text-muted)';
  return (
    <div>
      <div style={{ fontSize: '12px' }}>{new Date(date).toLocaleDateString('en-IN')}</div>
      <div style={{ fontSize: '11px', color }}>
        {days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days}d left`}
      </div>
    </div>
  );
}
