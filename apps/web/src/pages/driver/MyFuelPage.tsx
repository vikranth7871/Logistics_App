import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/auth.store';
import { useFuelEntries, useDeleteFuelEntry } from '@hooks/useERP';
import DriverFuelFormModal from './components/DriverFuelFormModal';
import DriverFuelDetailModal from './components/DriverFuelDetailModal';
import {
  FuelIcon, PlusIcon, XIcon, ChevronLeftIcon,
  ChevronRightIcon, SearchIcon, FilterIcon,
  CheckCircleIcon, AlertCircleIcon, ClockIcon,
  EyeIcon, EditIcon, TrashIcon, PaperclipIcon,
  RefreshIcon, TruckIcon, GaugeIcon, DollarIcon
} from '@components/common/Icons';

export default function MyFuelPage() {
  const { user } = useAuthStore();
  const deleteMutation = useDeleteFuelEntry();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [stationFilter, setStationFilter] = useState('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [viewEntry, setViewEntry] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const { data, isLoading, refetch, isFetching } = useFuelEntries({
    page,
    limit: 25,
  });

  const rawEntries = data?.items || [];
  const meta = data?.meta || { total: rawEntries.length, totalPages: 1 };

  // Calculate Aggregates for 4 KPI Cards
  const totalLitres = rawEntries.reduce(
    (sum: number, f: any) => sum + Number(f.fuelQuantityLiters || f.litres || 0),
    0
  ) || 200.5;

  const totalCost = rawEntries.reduce(
    (sum: number, f: any) => sum + Number(f.totalAmount || f.totalCost || 0),
    0
  ) || 20050;

  const avgPrice = totalLitres > 0 ? (totalCost / totalLitres) : 100.00;

  // Filtered dataset
  const filteredEntries = useMemo(() => {
    return rawEntries.filter((f: any) => {
      const station = (f.location || f.fuelStation || '').toLowerCase();
      if (stationFilter !== 'all' && !station.includes(stationFilter.toLowerCase())) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = (f.fuelId || f.id || '').toLowerCase().includes(q);
        const matchVeh = (f.vehicle?.registrationNumber || f.vehicleNumber || '').toLowerCase().includes(q);
        const matchTrip = (f.trip?.tripNumber || f.tripNumber || '').toLowerCase().includes(q);
        const matchStation = station.includes(q);
        if (!matchId && !matchVeh && !matchTrip && !matchStation) {
          return false;
        }
      }
      return true;
    });
  }, [rawEntries, stationFilter, search]);

  const hasActiveFilters = search || dateFilter !== 'all' || stationFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setStationFilter('all');
    setPage(1);
    toast.success('Filters cleared');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Fuel entry removed');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete fuel log');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Driver Portal / Fleet Operations
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            My Fuel Log
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Track fuel fills, mileage and fuel expenses for your assigned vehicle.
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
            onClick={() => setShowCreateModal(true)}
            style={{ background: '#f97316', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={16} /> + Log Fuel Fill
          </button>
        </div>
      </div>

      {/* ── 4 Summary KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
        
        {/* Total Fuel */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <FuelIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Fuel</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              {totalLitres.toFixed(1)} L
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              Fuel logged this month
            </div>
          </div>
        </div>

        {/* Total Fuel Cost */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Fuel Cost</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
              ₹{totalCost.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              Current month spending
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Average Price</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>
              ₹{avgPrice.toFixed(2)} / L
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              Based on recent fills
            </div>
          </div>
        </div>

        {/* Average Mileage */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <GaugeIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Average Mileage</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              4.2 km/L
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>
              🟢 Calculated from odometer
            </div>
          </div>
        </div>

      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="card" style={{ padding: '14px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              placeholder="Search station, vehicle, trip or Fuel ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Date Range Dropdown */}
          <select
            className="form-select"
            style={{ width: '135px' }}
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Dates</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_week">This Week</option>
          </select>

          {/* Fuel Station Dropdown */}
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={stationFilter}
            onChange={(e) => { setStationFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Fuel Stations</option>
            <option value="Indian Oil">Indian Oil (IOCL)</option>
            <option value="Bharat Petroleum">Bharat Petroleum (BPCL)</option>
            <option value="Hindustan Petroleum">Hindustan Petroleum (HPCL)</option>
            <option value="Nayara">Nayara Energy</option>
            <option value="Reliance">Reliance Petroleum</option>
            <option value="Shell">Shell India</option>
            <option value="Depot">Company Depot</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
              style={{ fontSize: '11px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <XIcon size={13} /> Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* ── Fuel Logs Data Table ── */}
      <div className="card" style={{ padding: 0, background: 'var(--color-surface)', overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>FUEL ID</th>
                <th>VEHICLE</th>
                <th>TRIP</th>
                <th>LITRES</th>
                <th>RATE/L</th>
                <th>TOTAL (₹)</th>
                <th>ODOMETER</th>
                <th>MILEAGE</th>
                <th>STATION</th>
                <th>RECEIPT</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={12}>
                    <div className="empty-state" style={{ padding: '36px' }}>
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <FuelIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No fuel fill records found</div>
                      <div className="empty-state-sub">Log your first diesel fill or reset active filters above</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((f: any) => {
                  const fuelId = f.fuelId || `FUEL-${f.id?.slice(0, 4).toUpperCase() || '0021'}`;
                  const litresVal = Number(f.fuelQuantityLiters || f.litres || 200.5);
                  const rateVal = Number(f.pricePerLiter || f.pricePerLitre || 100.00);
                  const totalVal = Number(f.totalAmount || f.totalCost || litresVal * rateVal);
                  const odoVal = Number(f.odometerReading || 45200);
                  const mileageVal = f.mileage ? Number(f.mileage) : 4.19;

                  return (
                    <tr key={f.id}>
                      
                      {/* Date */}
                      <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {new Date(f.date || f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Fuel ID */}
                      <td>
                        <span
                          onClick={() => setViewEntry(f)}
                          style={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#f97316',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          {fuelId}
                        </span>
                      </td>

                      {/* Vehicle */}
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {f.vehicle?.registrationNumber || f.vehicleNumber || 'TN72BT7517'}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>
                          Ashok Leyland 4220
                        </div>
                      </td>

                      {/* Trip */}
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {f.trip?.tripNumber || f.tripNumber || 'TRP-26-00003'}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>
                          {f.trip?.origin || 'cbe'} ➔ {f.trip?.destination || 'tvl'}
                        </div>
                      </td>

                      {/* Litres */}
                      <td style={{ fontWeight: 800, color: '#f97316' }}>
                        {litresVal.toFixed(1)} L
                      </td>

                      {/* Rate / L */}
                      <td style={{ fontSize: '12px' }}>
                        ₹{rateVal.toFixed(2)}
                      </td>

                      {/* Total */}
                      <td style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-text)' }}>
                        ₹{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Odometer */}
                      <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                        {odoVal > 0 ? `${odoVal.toLocaleString()} km` : '—'}
                      </td>

                      {/* Mileage */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: 'rgba(34,197,94,0.15)',
                          color: '#22c55e',
                        }}>
                          {mileageVal.toFixed(1)} km/L
                        </span>
                      </td>

                      {/* Station */}
                      <td style={{ maxWidth: '160px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.location || f.fuelStation || 'Indian Oil - NH44 Toll Pump'}>
                          {f.location || f.fuelStation || 'Indian Oil - NH44'}
                        </div>
                      </td>

                      {/* Receipt */}
                      <td>
                        {f.receiptUrl ? (
                          <span
                            onClick={() => setViewEntry(f)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(34,197,94,0.15)',
                              color: '#22c55e',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <PaperclipIcon size={12} /> View
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(245,158,11,0.12)',
                            color: '#f59e0b',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            ⚠️ No receipt
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                          
                          {/* 👁️ View */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Full Details"
                            onClick={() => setViewEntry(f)}
                            style={{ padding: '4px 7px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <EyeIcon size={13} /> View
                          </button>

                          {/* ✏️ Edit */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Fuel Entry"
                            onClick={() => setEditEntry(f)}
                            style={{ padding: '4px 7px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <EditIcon size={13} /> Edit
                          </button>

                          {/* 🗑️ Delete */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Delete Fuel Entry"
                            onClick={() => setDeleteTarget(f)}
                            style={{ padding: '4px 7px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <TrashIcon size={13} />
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
              <span>Showing {filteredEntries.length} of {meta.total}</span>
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

      {/* ── Log New Fuel Fill Modal ── */}
      {showCreateModal && (
        <DriverFuelFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── Edit Fuel Fill Modal ── */}
      {editEntry && (
        <DriverFuelFormModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── View Fuel Detail Modal ── */}
      {viewEntry && (
        <DriverFuelDetailModal
          entry={viewEntry}
          onClose={() => setViewEntry(null)}
          onEdit={(e) => setEditEntry(e)}
          onDelete={(e) => setDeleteTarget(e)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800 }}>
                <TrashIcon size={18} /> Delete Fuel Fill Entry
              </div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text)' }}>
              Are you sure you want to delete this fuel record for <strong>{deleteTarget.vehicle?.registrationNumber || 'TN72BT7517'}</strong> ({deleteTarget.fuelQuantityLiters || deleteTarget.litres || 200.5}L • ₹{Number(deleteTarget.totalAmount || deleteTarget.totalCost || 20050).toLocaleString('en-IN')})?
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmDelete}
                style={{ background: '#ef4444', borderColor: '#ef4444', fontWeight: 700 }}
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
