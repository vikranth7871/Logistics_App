import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrips, useDeleteTrip, useVehicles, useDrivers, useCustomers } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon,
  SearchIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  EyeIcon,
  TrashIcon,
  EditIcon,
  DownloadIcon,
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  PhoneIcon,
  BuildingIcon,
  WalletIcon,
  CalculatorIcon,
  CheckIcon,
  XIcon,
  MoreVerticalIcon,
} from '@components/common/Icons';

const STATUS_BADGES: Record<string, { label: string; class: string; icon: string }> = {
  in_progress: { label: 'In Progress', class: 'badge-on_trip', icon: '🚚' },
  completed: { label: 'Completed', class: 'badge-active', icon: '✓' },
  cancelled: { label: 'Cancelled', class: 'badge-inactive', icon: '🔴' },
  assigned: { label: 'Planned', class: 'badge-assigned', icon: '📅' },
  draft: { label: 'Draft', class: 'badge-draft', icon: '📝' },
};

const DEFAULT_TRIPS = [
  {
    id: 'trp-1',
    tripNumber: 'TRP-26-00003',
    origin: 'cbe',
    originFull: 'Coimbatore, TN',
    destination: 'tvl',
    destinationFull: 'Tirunelveli, TN',
    distanceKm: 620,
    vehicleReg: 'TN72BT7517',
    vehicleModel: 'Tata Ace',
    driverName: 'Selvam P',
    driverPhone: '9876543212',
    customerName: 'Chennai Auto Parts Co',
    freightAmount: 200000,
    paymentStatus: 'Paid',
    scheduledDate: '11 Aug 2026',
    scheduledTime: '09:00 AM',
    status: 'in_progress',
    statusSubtext: 'Started 11 Aug 2026, 09:15 AM',
  },
  {
    id: 'trp-2',
    tripNumber: 'TRP-26-00002',
    origin: 'Tuticorin',
    originFull: 'Tuticorin, TN',
    destination: 'Coimbatore',
    destinationFull: 'Coimbatore, TN',
    distanceKm: 640,
    vehicleReg: 'TN72BT7517',
    vehicleModel: 'Tata Ace',
    driverName: 'Selvam P',
    driverPhone: '9876543212',
    customerName: 'ABC Traders Pvt Ltd',
    freightAmount: 200000,
    paymentStatus: 'Paid',
    scheduledDate: '11 Aug 2026',
    scheduledTime: '08:00 AM',
    status: 'completed',
    statusSubtext: 'Completed 11 Aug 2026, 03:45 PM',
  },
];

export default function TripsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canManage = ['admin', 'manager'].includes(user?.role || '');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [freightMin, setFreightMin] = useState('');
  const [freightMax, setFreightMax] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: tripData, isLoading } = useTrips({ limit: 100 });
  const { data: vehicleData } = useVehicles({ limit: 100 });
  const { data: driverData } = useDrivers({ limit: 100 });
  const { data: customerData } = useCustomers({ limit: 100 });

  const deleteMutation = useDeleteTrip();

  const vehiclesList = Array.isArray(vehicleData?.items) ? vehicleData.items : [];
  const driversList = Array.isArray(driverData?.items) ? driverData.items : [];
  const customersList = Array.isArray(customerData?.items) ? customerData.items : [];

  const fetchedTrips = Array.isArray(tripData?.items)
    ? tripData.items
    : Array.isArray(tripData)
    ? tripData
    : [];

  const allTrips = fetchedTrips.length > 0
    ? fetchedTrips.map((t: any, idx: number) => ({
        id: t.id,
        tripNumber: t.tripNumber || `TRP-26-${String(idx + 1).padStart(5, '0')}`,
        origin: t.originLocation?.split(',')[0] || (idx === 0 ? 'cbe' : 'Tuticorin'),
        originFull: t.originLocation || (idx === 0 ? 'Coimbatore, TN' : 'Tuticorin, TN'),
        destination: t.destinationLocation?.split(',')[0] || (idx === 0 ? 'tvl' : 'Coimbatore'),
        destinationFull: t.destinationLocation || (idx === 0 ? 'Tirunelveli, TN' : 'Coimbatore, TN'),
        distanceKm: t.distanceKm || (idx === 0 ? 620 : 640),
        vehicleReg: t.vehicle?.registrationNumber || 'TN72BT7517',
        vehicleModel: t.vehicle?.model || 'Tata Ace',
        driverName: t.driver?.name || 'Selvam P',
        driverPhone: t.driver?.phone || '9876543212',
        customerName: t.customer?.name || (idx === 0 ? 'Chennai Auto Parts Co' : 'ABC Traders Pvt Ltd'),
        freightAmount: Number(t.freightAmount || 200000),
        paymentStatus: t.billingStatus || 'Paid',
        scheduledDate: t.scheduledStart ? t.scheduledStart.split('T')[0] : '11 Aug 2026',
        scheduledTime: t.scheduledStart ? new Date(t.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM',
        status: t.status || (idx === 0 ? 'in_progress' : 'completed'),
        statusSubtext: idx === 0 ? 'Started 11 Aug 2026, 09:15 AM' : 'Completed 11 Aug 2026, 03:45 PM',
      }))
    : DEFAULT_TRIPS;

  // Stats Calculations
  const totalCount = allTrips.length;
  const inProgressCount = allTrips.filter((t: any) => t.status === 'in_progress').length;
  const completedCount = allTrips.filter((t: any) => t.status === 'completed').length;
  const cancelledCount = allTrips.filter((t: any) => t.status === 'cancelled').length;

  const totalFreight = allTrips.reduce((sum: number, t: any) => sum + (Number(t.freightAmount) || 0), 0);
  const avgTripValue = totalCount > 0 ? Math.round(totalFreight / totalCount) : 0;

  const inProgressPct = totalCount > 0 ? ((inProgressCount / totalCount) * 100).toFixed(1) : '0';
  const completedPct = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0';
  const cancelledPct = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : '0';

  // Active filter count
  const activeFilterCount = [
    statusFilter !== '',
    driverFilter !== '',
    vehicleFilter !== '',
    customerFilter !== '',
    search !== '',
    startDate !== '',
    endDate !== '',
    originFilter !== '',
    destinationFilter !== '',
    freightMin !== '',
    freightMax !== '',
  ].filter(Boolean).length;

  // Filter trips
  const filteredTrips = allTrips.filter((t: any) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (driverFilter && t.driverName !== driverFilter) return false;
    if (vehicleFilter && t.vehicleReg !== vehicleFilter) return false;
    if (customerFilter && t.customerName !== customerFilter) return false;
    if (originFilter && !t.originFull.toLowerCase().includes(originFilter.toLowerCase())) return false;
    if (destinationFilter && !t.destinationFull.toLowerCase().includes(destinationFilter.toLowerCase())) return false;

    if (freightMin && Number(t.freightAmount) < Number(freightMin)) return false;
    if (freightMax && Number(t.freightAmount) > Number(freightMax)) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchNo = t.tripNumber.toLowerCase().includes(q);
      const matchOrigin = t.originFull.toLowerCase().includes(q);
      const matchDest = t.destinationFull.toLowerCase().includes(q);
      const matchCust = t.customerName.toLowerCase().includes(q);
      if (!matchNo && !matchOrigin && !matchDest && !matchCust) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredTrips.length / pageSize) || 1;
  const paginatedTrips = filteredTrips.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (t: any) => {
    if (window.confirm(`Are you sure you want to delete trip ${t.tripNumber}?`)) {
      deleteMutation.mutate(t.id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDriverFilter('');
    setVehicleFilter('');
    setCustomerFilter('');
    setStartDate('');
    setEndDate('');
    setOriginFilter('');
    setDestinationFilter('');
    setFreightMin('');
    setFreightMax('');
    setPage(1);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedTrips.map((t: any) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Completed trip for bottom widget
  const recentCompletedTrip = allTrips.find((t: any) => t.status === 'completed') || allTrips[1];

  return (
    <div>
      {/* Header & Actions */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: 'var(--color-text-muted)' }}>Trips</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800 }}>Trip Management</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <DownloadIcon size={15} /> Export ▾
            </button>
            <Link
              to="/trips/new"
              className="btn btn-primary"
              id="new-trip-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f97316',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none',
              }}
            >
              <PlusIcon size={16} /> New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards Row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Trips</div>
            <div className="kpi-val">{totalCount}</div>
            <div className="kpi-sub" style={{ color: 'var(--color-text-dim)' }}>100% of total</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <TruckIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>In Progress</div>
            <div className="kpi-val">{inProgressCount}</div>
            <div className="kpi-sub" style={{ color: '#4ade80' }}>{inProgressPct}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <CheckIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Completed</div>
            <div className="kpi-val">{completedCount}</div>
            <div className="kpi-sub" style={{ color: '#facc15' }}>{completedPct}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <XIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Cancelled</div>
            <div className="kpi-val">{cancelledCount}</div>
            <div className="kpi-sub" style={{ color: '#a78bfa' }}>{cancelledPct}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#2dd4bf' }}>
            <WalletIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Freight</div>
            <div className="kpi-val">₹{totalFreight.toLocaleString()}</div>
            <div className="kpi-sub" style={{ color: 'var(--color-text-dim)' }}>Total value</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            <CalculatorIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Avg. Trip Value</div>
            <div className="kpi-val">₹{avgTripValue.toLocaleString()}</div>
            <div className="kpi-sub" style={{ color: 'var(--color-text-dim)' }}>Per trip</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
            <div className="search-input" style={{ flex: 1 }}>
              <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <SearchIcon size={16} color="var(--color-text-muted)" />
              </span>
              <input
                type="text"
                placeholder="Search by trip no., origin or destination..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                id="trip-search"
              />
            </div>

            <select
              className="form-select"
              style={{ width: '130px' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="assigned">Planned</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="form-select"
              style={{ width: '130px' }}
              value={driverFilter}
              onChange={(e) => { setDriverFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Drivers</option>
              {driversList.map((d: any) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: '130px' }}
              value={vehicleFilter}
              onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Vehicles</option>
              {vehiclesList.map((v: any) => (
                <option key={v.id} value={v.registrationNumber}>{v.registrationNumber}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: '140px' }}
              value={customerFilter}
              onChange={(e) => { setCustomerFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Customers</option>
              {customersList.map((c: any) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: showMoreFilters ? 'var(--color-border)' : undefined }}
            >
              <FilterIcon size={15} /> More Filters
              {activeFilterCount > 0 && (
                <span style={{ background: '#f97316', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              onClick={handleResetFilters}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset {showMoreFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Collapsible Expanded Filter Inputs Bar */}
        {showMoreFilters && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto', gap: '14px', alignItems: 'end' }}>
            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                Scheduled Date
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface2)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ border: 'none', padding: 0, background: 'transparent', fontSize: '12px' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span style={{ color: 'var(--color-text-muted)' }}>~</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ border: 'none', padding: 0, background: 'transparent', fontSize: '12px' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <CalendarIcon size={15} color="var(--color-text-muted)" />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                Origin
              </label>
              <select className="form-select" style={{ width: '100%' }} value={originFilter} onChange={(e) => setOriginFilter(e.target.value)}>
                <option value="">Select origin</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Tuticorin">Tuticorin</option>
                <option value="Chennai">Chennai</option>
                <option value="Madurai">Madurai</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                Destination
              </label>
              <select className="form-select" style={{ width: '100%' }} value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)}>
                <option value="">Select destination</option>
                <option value="Tirunelveli">Tirunelveli</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                Freight (₹)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '6px', alignItems: 'center' }}>
                <input type="number" className="form-input" placeholder="Min" value={freightMin} onChange={(e) => setFreightMin(e.target.value)} />
                <span style={{ color: 'var(--color-text-muted)' }}>~</span>
                <input type="number" className="form-input" placeholder="Max" value={freightMax} onChange={(e) => setFreightMax(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                style={{ height: '36px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, background: 'var(--color-surface2)' }}
                onClick={handleResetFilters}
              >
                Clear All
              </button>
              <button
                className="btn btn-primary"
                style={{ height: '36px', borderRadius: '8px', background: '#f97316', color: '#ffffff', fontWeight: 700, fontSize: '12px', border: 'none', padding: '0 16px' }}
                onClick={() => setPage(1)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '16px' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedTrips.length > 0 && selectedIds.length === paginatedTrips.length}
                  />
                </th>
                <th>TRP NO.</th>
                <th>ROUTE</th>
                <th>VEHICLE &amp; DRIVER</th>
                <th>CUSTOMER</th>
                <th>FREIGHT</th>
                <th>SCHEDULED</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : paginatedTrips.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <TruckIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No trips found</div>
                      <div className="empty-state-sub">Try resetting your search or filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTrips.map((t: any) => {
                  const statusInfo = STATUS_BADGES[t.status] || STATUS_BADGES.in_progress;
                  const isPaid = t.paymentStatus === 'Paid';

                  return (
                    <tr key={t.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(t.id)}
                          onChange={() => handleSelectOne(t.id)}
                        />
                      </td>
                      <td>
                        <Link to={`/trips/${t.id}`} className="reg-number-link" style={{ fontWeight: 700 }}>
                          {t.tripNumber}
                        </Link>
                      </td>
                      <td>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text)' }}>
                            <MapPinIcon size={14} color="#3b82f6" />
                            <span style={{ fontWeight: 700 }}>{t.origin}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '20px' }}>
                            {t.originFull}
                          </div>

                          <div style={{ paddingLeft: '6px', color: 'var(--color-text-dim)', fontSize: '10px', lineHeight: '10px' }}>
                            ┊
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text)' }}>
                            <MapPinIcon size={14} color="#ef4444" />
                            <span style={{ fontWeight: 700 }}>{t.destination}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '20px' }}>
                            {t.destinationFull}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '20px', fontWeight: 600 }}>
                            {t.distanceKm} km
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <TruckIcon size={15} color="var(--color-text-muted)" />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text)' }}>
                              {t.vehicleReg}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                              {t.vehicleModel}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f97316', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                            SP
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                              {t.driverName}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <PhoneIcon size={10} /> {t.driverPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BuildingIcon size={16} color="var(--color-text-muted)" />
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                            {t.customerName}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                          ₹{Number(t.freightAmount).toLocaleString()}
                        </div>
                        <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: isPaid ? '#4ade80' : '#facc15', marginTop: '2px' }}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text)' }}>
                          <CalendarIcon size={13} color="var(--color-text-muted)" />
                          <span>{t.scheduledDate}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          <ClockIcon size={12} color="var(--color-text-muted)" />
                          <span>{t.scheduledTime}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          <span>{statusInfo.icon}</span> {statusInfo.label}
                        </span>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          {t.statusSubtext}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <Link
                            to={`/trips/${t.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Details"
                            style={{ padding: '5px 8px' }}
                          >
                            <EyeIcon size={14} />
                          </Link>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Trip"
                            onClick={() => {}}
                            style={{ padding: '5px 8px' }}
                          >
                            <EditIcon size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDelete(t)}
                              disabled={deleteMutation.isPending}
                              title="Delete Trip"
                              style={{ padding: '5px 8px', color: 'var(--color-danger)' }}
                            >
                              <TrashIcon size={14} />
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="More Options"
                            style={{ padding: '5px 8px' }}
                          >
                            <MoreVerticalIcon size={14} />
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

        {/* Pagination Footer */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Showing {paginatedTrips.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredTrips.length)} of {filteredTrips.length} trips
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

      {/* Bottom 3 Analytical Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '16px' }}>
        {/* Card 1: Trips by Status Donut Chart */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>
            Trips by Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <svg width="100" height="100" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-surface2)"
                  strokeWidth="3.8"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 15.9155 15.9155"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="50 50"
                />
                <path
                  d="M33.9155 18 a 15.9155 15.9155 0 0 1 -15.9155 15.9155"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="4"
                  strokeDasharray="50 50"
                />
              </svg>
            </div>

            {/* Legend list */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ color: 'var(--color-text)' }}>In Progress</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{inProgressCount} ({inProgressPct}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ color: 'var(--color-text)' }}>Completed</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{completedCount} ({completedPct}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ color: 'var(--color-text)' }}>Cancelled</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>{cancelledCount} ({cancelledPct}%)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                  <span style={{ color: 'var(--color-text)' }}>Planned</span>
                </div>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>0 (0%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming Trips */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px' }}>
            Upcoming Trips
          </div>
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--color-surface2)', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              <CalendarIcon size={24} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>No upcoming trips</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>There are no trips scheduled in the future.</div>
          </div>
        </div>

        {/* Card 3: Recent Completed Trips */}
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '16px' }}>
            Recent Completed Trips
          </div>
          {recentCompletedTrip && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>{recentCompletedTrip.tripNumber}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{recentCompletedTrip.origin} → {recentCompletedTrip.destination}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{recentCompletedTrip.scheduledDate}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>₹{recentCompletedTrip.freightAmount.toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
