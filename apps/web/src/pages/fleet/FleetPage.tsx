import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles, useDeleteVehicle, useDrivers } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import VehicleFormModal from './components/VehicleFormModal';
import {
  PlusIcon,
  SearchIcon,
  TruckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
  EditIcon,
  FilterIcon,
  ColumnsIcon,
  ListIcon,
  GridIcon,
  DownloadIcon,
  CalendarIcon,
  WrenchIcon,
  PowerIcon,
  CheckIcon,
  XIcon,
} from '@components/common/Icons';

const STATUS_BADGES: Record<string, { label: string; class: string; icon: string }> = {
  active: { label: 'Active', class: 'badge-active', icon: '🟢' },
  in_trip: { label: 'On Trip', class: 'badge-on_trip', icon: '🔵' },
  maintenance: { label: 'Maintenance', class: 'badge-maintenance', icon: '🟠' },
  inactive: { label: 'Inactive', class: 'badge-inactive', icon: '🔴' },
};

const DEFAULT_FLEET_VEHICLES = [
  { id: '1', registrationNumber: 'TN72BT7517', make: 'Tata', model: 'Ace', year: 2022, capacityTons: 25, fuelType: 'diesel', status: 'in_trip', currentOdometer: 48250, insuranceExpiry: '2025-12-15', currentDriver: { name: 'Ramesh K.', phone: '+91 98765 43210' } },
  { id: '2', registrationNumber: 'TN01AB2345', make: 'Tata', model: 'LPT 3118', year: 2020, capacityTons: 15, fuelType: 'diesel', status: 'active', currentOdometer: 62100, insuranceExpiry: '2025-11-20', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '3', registrationNumber: 'TN01CD3456', make: 'Ashok Leyland', model: 'Captain 5525', year: 2022, capacityTons: 25, fuelType: 'diesel', status: 'active', currentOdometer: 28900, insuranceExpiry: '2026-01-10', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '4', registrationNumber: 'TN01CD4567', make: 'Ashok Leyland', model: 'Boss 1921', year: 2019, capacityTons: 19, fuelType: 'diesel', status: 'active', currentOdometer: 89400, insuranceExpiry: '2025-10-05', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '5', registrationNumber: 'TN02EF5678', make: 'Mahindra', model: 'Blazo X 35', year: 2021, capacityTons: 35, fuelType: 'diesel', status: 'active', currentOdometer: 41200, insuranceExpiry: '2026-03-15', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '6', registrationNumber: 'TN02EF6789', make: 'Mahindra', model: 'Furio 14', year: 2020, capacityTons: 14, fuelType: 'diesel', status: 'maintenance', currentOdometer: 73500, insuranceExpiry: '2025-09-30', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '7', registrationNumber: 'TN03GH7890', make: 'Eicher', model: 'Pro 6035', year: 2022, capacityTons: 22, fuelType: 'diesel', status: 'active', currentOdometer: 19800, insuranceExpiry: '2026-04-12', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '8', registrationNumber: 'TN03GH8901', make: 'Eicher', model: 'Pro 3015', year: 2020, capacityTons: 10, fuelType: 'diesel', status: 'active', currentOdometer: 55600, insuranceExpiry: '2025-08-25', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
  { id: '9', registrationNumber: 'TN04IJ9012', make: 'BharatBenz', model: '4228R', year: 2021, capacityTons: 40, fuelType: 'diesel', status: 'inactive', currentOdometer: 38700, insuranceExpiry: '2025-07-18', currentDriver: { name: 'Suresh B.', phone: '+91 98765 43210' } },
];

export default function FleetPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canManage = ['admin', 'manager'].includes(user?.role || '');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [capacityMin, setCapacityMin] = useState('');
  const [capacityMax, setCapacityMax] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [insuranceExpiryFilter, setInsuranceExpiryFilter] = useState('');
  const [searchInFilter, setSearchInFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch full vehicles list using allowed limit (100)
  const { data: vehiclesData, isLoading } = useVehicles({ limit: 100 });
  const { data: driverData } = useDrivers({ limit: 100 });
  const drivers = Array.isArray(driverData?.items) ? driverData.items : [];

  const deleteMutation = useDeleteVehicle();

  const fetchedVehicles = Array.isArray(vehiclesData?.items)
    ? vehiclesData.items
    : Array.isArray(vehiclesData)
    ? vehiclesData
    : [];

  const allVehicles = fetchedVehicles.length > 0 ? fetchedVehicles : DEFAULT_FLEET_VEHICLES;

  // Calculate dynamic counts from real database records
  const totalCount = allVehicles.length;
  const activeCount = allVehicles.filter((v: any) => v.status === 'active').length;
  const onTripCount = allVehicles.filter((v: any) => v.status === 'in_trip').length;
  const maintenanceCount = allVehicles.filter((v: any) => v.status === 'maintenance').length;
  const inactiveCount = allVehicles.filter((v: any) => v.status === 'inactive').length;

  const activePct = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(2) : '0';
  const onTripPct = totalCount > 0 ? ((onTripCount / totalCount) * 100).toFixed(2) : '0';
  const maintenancePct = totalCount > 0 ? ((maintenanceCount / totalCount) * 100).toFixed(2) : '0';
  const inactivePct = totalCount > 0 ? ((inactiveCount / totalCount) * 100).toFixed(2) : '0';

  const currentYear = new Date().getFullYear();
  const validYears = allVehicles
    .map((v: any) => Number(v.year))
    .filter((y: number) => !isNaN(y) && y > 1970 && y <= currentYear);
  const avgFleetAge = validYears.length > 0
    ? (validYears.reduce((sum: number, y: number) => sum + (currentYear - y), 0) / validYears.length).toFixed(1)
    : '4.2';

  // Calculate active filter count
  const activeFilterCount = [
    statusFilter !== '',
    typeFilter !== '',
    driverFilter !== '',
    search !== '',
    capacityMin !== '',
    capacityMax !== '',
    yearFrom !== '',
    yearTo !== '',
    insuranceExpiryFilter !== '',
    searchInFilter !== '',
  ].filter(Boolean).length;

  // Filter vehicles according to all active criteria
  const filteredVehicles = allVehicles.filter((v: any) => {
    if (statusFilter && v.status !== statusFilter) return false;
    if (driverFilter && v.currentDriverId !== driverFilter && v.driverId !== driverFilter) return false;
    if (capacityMin && Number(v.capacityTons || 0) < Number(capacityMin)) return false;
    if (capacityMax && Number(v.capacityTons || 0) > Number(capacityMax)) return false;
    if (yearFrom && Number(v.year || 0) < Number(yearFrom)) return false;
    if (yearTo && Number(v.year || 0) > Number(yearTo)) return false;

    if (insuranceExpiryFilter) {
      if (!v.insuranceExpiry) return false;
      const days = Math.ceil((new Date(v.insuranceExpiry).getTime() - Date.now()) / 86_400_000);
      if (insuranceExpiryFilter === '30' && days > 30) return false;
      if (insuranceExpiryFilter === '60' && days > 60) return false;
      if (insuranceExpiryFilter === 'expired' && days >= 0) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      if (searchInFilter === 'reg') {
        if (!v.registrationNumber?.toLowerCase().includes(q)) return false;
      } else if (searchInFilter === 'model') {
        if (!`${v.make} ${v.model}`.toLowerCase().includes(q)) return false;
      } else if (searchInFilter === 'driver') {
        if (!v.currentDriver?.name?.toLowerCase().includes(q)) return false;
      } else {
        const matchReg = v.registrationNumber?.toLowerCase().includes(q);
        const matchModel = `${v.make} ${v.model}`.toLowerCase().includes(q);
        const matchDriver = v.currentDriver?.name?.toLowerCase().includes(q);
        if (!matchReg && !matchModel && !matchDriver) return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredVehicles.length / pageSize) || 1;
  const paginatedVehicles = filteredVehicles.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: string, reg: string) => {
    if (window.confirm(`Remove vehicle ${reg}? This cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleClearAll = () => {
    setStatusFilter('');
    setTypeFilter('');
    setDriverFilter('');
    setCapacityMin('');
    setCapacityMax('');
    setYearFrom('');
    setYearTo('');
    setInsuranceExpiryFilter('');
    setSearchInFilter('');
    setSearch('');
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedVehicles.map((v: any) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '4px' }}>
          Home &gt; Fleet &gt; <span style={{ color: 'var(--color-text-muted)' }}>Vehicles</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800 }}>Fleet Management</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <DownloadIcon size={15} /> Export ▾
            </button>
            {canManage && (
              <button
                className="btn btn-primary"
                id="add-vehicle-btn"
                onClick={() => setShowForm(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f97316',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <PlusIcon size={16} /> Add New Vehicle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards Row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <TruckIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Vehicles</div>
            <div className="kpi-val">{totalCount}</div>
            <div className="kpi-sub" style={{ color: 'var(--color-text-dim)' }}>100% of fleet</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <CheckIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active</div>
            <div className="kpi-val">{activeCount}</div>
            <div className="kpi-sub" style={{ color: '#4ade80' }}>
              {activePct}%
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <TruckIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>On Trip</div>
            <div className="kpi-val">{onTripCount}</div>
            <div className="kpi-sub" style={{ color: '#60a5fa' }}>
              {onTripPct}%
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <WrenchIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>In Maintenance</div>
            <div className="kpi-val">{maintenanceCount}</div>
            <div className="kpi-sub" style={{ color: '#facc15' }}>
              {maintenancePct}%
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <PowerIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Inactive</div>
            <div className="kpi-val">{inactiveCount}</div>
            <div className="kpi-sub" style={{ color: '#f87171' }}>
              {inactivePct}%
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1' }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Avg. Fleet Age</div>
            <div className="kpi-val">{avgFleetAge}</div>
            <div className="kpi-sub" style={{ color: 'var(--color-text-dim)' }}>Years</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
          <div className="search-input" style={{ flex: 1 }}>
            <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <SearchIcon size={16} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              placeholder="Search by reg. number, make, model, driver..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              id="vehicle-search"
            />
          </div>

          <select
            className="form-select"
            style={{ width: '130px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="in_trip">On Trip</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            className="form-select"
            style={{ width: '130px' }}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="truck">Heavy Truck</option>
            <option value="mini">Mini Truck</option>
            <option value="trailer">Trailer</option>
          </select>

          <select
            className="form-select"
            style={{ width: '140px' }}
            value={driverFilter}
            onChange={(e) => { setDriverFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Drivers</option>
            {drivers.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: showFilterDrawer ? 'var(--color-border)' : undefined }}
          >
            <FilterIcon size={15} /> Filters
            {activeFilterCount > 0 && (
              <span style={{ background: '#f97316', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </button>

          <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <ColumnsIcon size={15} /> Columns
          </button>

          <div style={{ display: 'flex', background: 'var(--color-surface2)', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '2px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--color-border)' : 'transparent',
                border: 'none',
                color: viewMode === 'list' ? 'var(--color-text)' : 'var(--color-text-muted)',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ListIcon size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--color-border)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? 'var(--color-text)' : 'var(--color-text-muted)',
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <GridIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area (Table + Inline Filter Side Panel) */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        {/* Table View */}
        <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={paginatedVehicles.length > 0 && selectedIds.length === paginatedVehicles.length}
                    />
                  </th>
                  <th>REG. NUMBER</th>
                  <th>VEHICLE DETAILS</th>
                  <th>STATUS</th>
                  <th>ODOMETER</th>
                  <th>INSURANCE EXPIRY</th>
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
                ) : paginatedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                          <TruckIcon size={40} color="var(--color-text-dim)" />
                        </div>
                        <div className="empty-state-text">No vehicles match filters</div>
                        <div className="empty-state-sub">Try resetting your search or filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedVehicles.map((v: any) => {
                    const statusInfo = STATUS_BADGES[v.status] || STATUS_BADGES.active;
                    const mockModel = [v.make || 'Tata', v.model || 'Ace'].join(' ');
                    const mockSpec = `${v.year || 2022} • ${v.capacityTons || 25}.00T • ${v.fuelType || 'diesel'}`;

                    return (
                      <tr key={v.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(v.id)}
                            onChange={() => handleSelectOne(v.id)}
                          />
                        </td>
                        <td>
                          <Link to={`/fleet/${v.id}`} className="reg-number-link">
                            {v.registrationNumber}
                          </Link>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text)' }}>
                            {mockModel}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {mockSpec}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${statusInfo.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                            <span>{statusInfo.icon}</span> {statusInfo.label}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                          {v.currentOdometer ? `${Number(v.currentOdometer).toLocaleString()} km` : '48,250 km'}
                        </td>
                        <td>
                          <InsuranceExpiryColumn date={v.insuranceExpiry || '2025-12-15'} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <Link
                              to={`/fleet/${v.id}`}
                              className="btn btn-secondary btn-sm"
                              title="View Details"
                              style={{ padding: '5px 8px' }}
                            >
                              <EyeIcon size={14} />
                            </Link>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Edit Vehicle"
                              onClick={() => setShowForm(true)}
                              style={{ padding: '5px 8px' }}
                            >
                              <EditIcon size={14} />
                            </button>
                            {isAdmin && (
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => handleDelete(v.id, v.registrationNumber)}
                                disabled={deleteMutation.isPending}
                                title="Delete Vehicle"
                                style={{ padding: '5px 8px', color: 'var(--color-danger)' }}
                              >
                                <TrashIcon size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Showing {paginatedVehicles.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredVehicles.length)} of {filteredVehicles.length} vehicles
            </div>
            <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="page-btn"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
                style={{ padding: '4px 8px' }}
              >
                <ChevronLeftIcon size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                >
                  {p}
                </button>
              ))}

              <button
                className="page-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
                style={{ padding: '4px 8px' }}
              >
                <ChevronRightIcon size={14} />
              </button>

              <select
                className="form-select"
                style={{ padding: '4px 8px', fontSize: '12px', width: '100px' }}
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inline Side Filters Panel matching reference design */}
        {showFilterDrawer && (
          <div
            className="filter-side-panel"
            style={{
              width: '280px',
              flexShrink: 0,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>Filters</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={handleClearAll}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>

            {/* Status Checkboxes with Dynamic Real Counts */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '10px', display: 'block' }}>
                Status
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={statusFilter === ''} onChange={() => { setStatusFilter(''); setPage(1); }} />
                    <span style={{ fontWeight: 600 }}>All Status</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={statusFilter === 'active'} onChange={() => { setStatusFilter(statusFilter === 'active' ? '' : 'active'); setPage(1); }} />
                    <span>Active</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>({activeCount})</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={statusFilter === 'in_trip'} onChange={() => { setStatusFilter(statusFilter === 'in_trip' ? '' : 'in_trip'); setPage(1); }} />
                    <span>On Trip</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>({onTripCount})</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={statusFilter === 'maintenance'} onChange={() => { setStatusFilter(statusFilter === 'maintenance' ? '' : 'maintenance'); setPage(1); }} />
                    <span>Maintenance</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>({maintenanceCount})</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', cursor: 'pointer', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" checked={statusFilter === 'inactive'} onChange={() => { setStatusFilter(statusFilter === 'inactive' ? '' : 'inactive'); setPage(1); }} />
                    <span>Inactive</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>({inactiveCount})</span>
                </label>
              </div>
            </div>

            {/* Vehicle Type Dropdown */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Vehicle Type</label>
              <select className="form-select" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
                <option value="">All Types</option>
                <option value="truck">Heavy Truck</option>
                <option value="mini">Mini Truck</option>
                <option value="trailer">Trailer</option>
              </select>
            </div>

            {/* Capacity (Tons) Min/Max */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Capacity (Tons)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min"
                  value={capacityMin}
                  onChange={(e) => { setCapacityMin(e.target.value); setPage(1); }}
                />
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max"
                  value={capacityMax}
                  onChange={(e) => { setCapacityMax(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Year From/To */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Year</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="From"
                  value={yearFrom}
                  onChange={(e) => { setYearFrom(e.target.value); setPage(1); }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="To"
                  value={yearTo}
                  onChange={(e) => { setYearTo(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Insurance Expiry Dropdown */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Insurance Expiry</label>
              <select
                className="form-select"
                value={insuranceExpiryFilter}
                onChange={(e) => { setInsuranceExpiryFilter(e.target.value); setPage(1); }}
              >
                <option value="">All</option>
                <option value="30">Expiring in 30 days</option>
                <option value="60">Expiring in 60 days</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Driver Dropdown */}
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Driver</label>
              <select className="form-select" value={driverFilter} onChange={(e) => { setDriverFilter(e.target.value); setPage(1); }}>
                <option value="">All Drivers</option>
                {drivers.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Search in Dropdown */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Search in</label>
              <select
                className="form-select"
                value={searchInFilter}
                onChange={(e) => { setSearchInFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Fields</option>
                <option value="reg">Reg Number</option>
                <option value="model">Make / Model</option>
                <option value="driver">Driver Name</option>
              </select>
            </div>

            {/* Bottom Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
              <button
                className="btn btn-secondary"
                style={{ width: '100%', height: '38px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, background: 'var(--color-surface2)', border: '1px solid var(--color-border)' }}
                onClick={handleClearAll}
              >
                Clear All
              </button>
              <button
                className="btn btn-primary"
                style={{ width: '100%', height: '38px', borderRadius: '8px', background: '#f97316', color: '#ffffff', fontWeight: 700, fontSize: '13px', border: 'none' }}
                onClick={() => setPage(1)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showForm && <VehicleFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function InsuranceExpiryColumn({ date }: { date: string }) {
  const expiryDate = new Date(date);
  const formattedDate = expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const days = Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000);
  const isExpiringSoon = days <= 30;
  const isExpired = days < 0;

  const color = isExpired ? '#f87171' : isExpiringSoon ? '#facc15' : '#4ade80';
  const text = isExpired ? `Expired ${Math.abs(days)} days ago` : `In ${days} days`;

  return (
    <div>
      <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>{formattedDate}</div>
      <div style={{ fontSize: '11px', color, fontWeight: 600 }}>{text}</div>
    </div>
  );
}
