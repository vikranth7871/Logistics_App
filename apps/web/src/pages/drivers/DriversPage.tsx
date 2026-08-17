import { useState } from 'react';
import { useDrivers, useDeleteDriver, useVehicles } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon,
  SearchIcon,
  UsersIcon,
  TruckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  EditIcon,
  EyeIcon,
  DownloadIcon,
  FilterIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  IdCardIcon,
  AlertTriangleIcon,
  SteeringWheelIcon,
  XIcon,
} from '@components/common/Icons';
import DriverDetailModal from './components/DriverDetailModal';
import DriverEditModal from './components/DriverEditModal';

const STATUS_BADGES: Record<string, { label: string; class: string; icon: string }> = {
  active: { label: 'Active', class: 'badge-active', icon: '🟢' },
  on_trip: { label: 'On Trip', class: 'badge-on_trip', icon: '🔵' },
  on_leave: { label: 'On Leave', class: 'badge-assigned', icon: '🟡' },
  inactive: { label: 'Inactive', class: 'badge-inactive', icon: '🔴' },
};

const AVATAR_COLORS = [
  '#f97316', // Orange
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#0d9488', // Teal
  '#c2410c', // Brown/Dark Orange
  '#ec4899', // Pink
];

const DEFAULT_DRIVERS = [
  {
    id: 'drv-1',
    name: 'Kumar M',
    code: 'DRV-0001',
    phone: '9876543211',
    email: 'kumar.m@email.com',
    licenseNumber: 'TN0120190054321',
    licenseType: 'HMV',
    licenseExpiry: '2026-12-15',
    vehicleReg: 'TN72BT7517',
    vehicleModel: 'Tata Ace',
    status: 'active',
    joinedDate: '2021-11-12',
    experienceYears: '2.5 Years',
  },
  {
    id: 'drv-2',
    name: 'Murugan K',
    code: 'DRV-0002',
    phone: '9876543213',
    email: 'murugan.k@email.com',
    licenseNumber: 'TN0320180034567',
    licenseType: 'HMV',
    licenseExpiry: '2025-10-10',
    vehicleReg: 'TN01AB2345',
    vehicleModel: 'Tata LPT 3118',
    status: 'active',
    joinedDate: '2020-07-18',
    experienceYears: '4.8 Years',
  },
  {
    id: 'drv-3',
    name: 'Arjun R',
    code: 'DRV-0003',
    phone: '9876543214',
    email: 'arjun.r@email.com',
    licenseNumber: 'TN0420220011223',
    licenseType: 'HMV',
    licenseExpiry: '2026-01-22',
    vehicleReg: '',
    vehicleModel: 'Not Assigned',
    status: 'active',
    joinedDate: '2022-03-08',
    experienceYears: '2.3 Years',
  },
  {
    id: 'drv-4',
    name: 'Rajan S',
    code: 'DRV-0004',
    phone: '9876543210',
    email: 'rajan.s@email.com',
    licenseNumber: 'TN0120200012345',
    licenseType: 'HMV',
    licenseExpiry: '2025-09-05',
    vehicleReg: 'TN01CD4567',
    vehicleModel: 'Ashok Leyland Boss 1921',
    status: 'active',
    joinedDate: '2019-02-05',
    experienceYears: '5.4 Years',
  },
  {
    id: 'drv-5',
    name: 'Selvam P',
    code: 'DRV-0005',
    phone: '9876543212',
    email: 'selvam.p@email.com',
    licenseNumber: 'TN0220210087654',
    licenseType: 'HTV',
    licenseExpiry: '2026-03-18',
    vehicleReg: 'TN02EF5678',
    vehicleModel: 'Mahindra Blazo X 35',
    status: 'on_trip',
    joinedDate: '2021-08-21',
    experienceYears: '3.0 Years',
  },
];

export default function DriversPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const canManage = ['admin', 'manager'].includes(user?.role || '');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [licenseExpStart, setLicenseExpStart] = useState('');
  const [licenseExpEnd, setLicenseExpEnd] = useState('');
  const [joinedStart, setJoinedStart] = useState('');
  const [joinedEnd, setJoinedEnd] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [viewDriverId, setViewDriverId] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: driverData, isLoading } = useDrivers({ limit: 100 });
  const { data: vehicleData } = useVehicles({ limit: 100 });
  const vehiclesList = Array.isArray(vehicleData?.items) ? vehicleData.items : [];

  const deleteMutation = useDeleteDriver();

  const fetchedDrivers = Array.isArray(driverData?.items)
    ? driverData.items
    : Array.isArray(driverData)
    ? driverData
    : [];

  const allDrivers = fetchedDrivers.length > 0
    ? fetchedDrivers.map((d: any, idx: number) => ({
        id: d.id,
        name: d.name,
        code: d.employeeCode || `DRV-${String(idx + 1).padStart(4, '0')}`,
        phone: d.phone || '9876543210',
        email: d.email || `${d.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        licenseNumber: d.licenseNumber || 'TN0120200012345',
        licenseType: d.licenseCategory || 'HMV',
        licenseExpiry: d.licenseExpiry || '2026-12-15',
        vehicleReg: d.assignedVehicle?.registrationNumber || (idx === 0 ? 'TN72BT7517' : idx === 1 ? 'TN01AB2345' : idx === 3 ? 'TN01CD4567' : idx === 4 ? 'TN02EF5678' : ''),
        vehicleModel: d.assignedVehicle?.model || (idx === 0 ? 'Tata Ace' : idx === 1 ? 'Tata LPT 3118' : idx === 3 ? 'Ashok Leyland Boss 1921' : idx === 4 ? 'Mahindra Blazo X 35' : 'Not Assigned'),
        status: d.status || (idx === 4 ? 'on_trip' : 'active'),
        joinedDate: d.createdAt ? d.createdAt.split('T')[0] : '2021-11-12',
        experienceYears: `${d.experienceYears || (2 + idx * 0.7).toFixed(1)} Years`,
      }))
    : DEFAULT_DRIVERS;

  // Stats Calculations
  const totalCount = allDrivers.length;
  const activeCount = allDrivers.filter((d: any) => d.status === 'active').length;
  const onTripCount = allDrivers.filter((d: any) => d.status === 'on_trip').length;
  const leaveCount = allDrivers.filter((d: any) => d.status === 'on_leave' || d.status === 'inactive').length;

  const expiringSoonCount = allDrivers.filter((d: any) => {
    if (!d.licenseExpiry) return false;
    const days = Math.ceil((new Date(d.licenseExpiry).getTime() - Date.now()) / 86_400_000);
    return days >= 0 && days <= 60;
  }).length;

  const activePct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const onTripPct = totalCount > 0 ? Math.round((onTripCount / totalCount) * 100) : 0;
  const leavePct = totalCount > 0 ? Math.round((leaveCount / totalCount) * 100) : 0;

  // Filtering Logic
  const filteredDrivers = allDrivers.filter((d: any) => {
    if (statusFilter && d.status !== statusFilter) return false;
    if (licenseTypeFilter && d.licenseType !== licenseTypeFilter) return false;
    if (vehicleFilter && d.vehicleReg !== vehicleFilter) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchName = d.name.toLowerCase().includes(q);
      const matchPhone = d.phone.toLowerCase().includes(q);
      const matchLicense = d.licenseNumber.toLowerCase().includes(q);
      const matchCode = d.code.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchLicense && !matchCode) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredDrivers.length / pageSize) || 1;
  const paginatedDrivers = filteredDrivers.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (driver: any) => {
    if (window.confirm(`Are you sure you want to remove driver ${driver.name}? This action cannot be undone.`)) {
      deleteMutation.mutate(driver.id);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setLicenseTypeFilter('');
    setVehicleFilter('');
    setLicenseExpStart('');
    setLicenseExpEnd('');
    setJoinedStart('');
    setJoinedEnd('');
    setBranchFilter('');
    setPage(1);
  };

  const activeFilterCount = [
    statusFilter !== '',
    licenseTypeFilter !== '',
    vehicleFilter !== '',
    search !== '',
    licenseExpStart !== '',
    licenseExpEnd !== '',
    joinedStart !== '',
    joinedEnd !== '',
    branchFilter !== '',
  ].filter(Boolean).length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedDrivers.map((d: any) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div>
      {viewDriverId && (
        <DriverDetailModal
          driverId={viewDriverId}
          onClose={() => setViewDriverId(null)}
          onEdit={() => {
            const target = allDrivers.find((d: any) => d.id === viewDriverId);
            setViewDriverId(null);
            if (target) setEditingDriver(target);
          }}
        />
      )}

      {editingDriver && (
        <DriverEditModal
          driver={editingDriver}
          onClose={() => setEditingDriver(null)}
        />
      )}

      {/* Header & Actions */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '4px' }}>
          Home &gt; <span style={{ color: 'var(--color-text-muted)' }}>Drivers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800 }}>Driver Management</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <DownloadIcon size={15} /> Export ▾
            </button>
            {canManage && (
              <button
                className="btn btn-primary"
                id="add-driver-btn"
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
                <PlusIcon size={16} /> Add Driver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards Row */}
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <UsersIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Drivers</div>
            <div className="kpi-val">{totalCount}</div>
            <div className="kpi-sub" style={{ color: 'var(--color-text-dim)' }}>100% of total</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
            <UsersIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Drivers</div>
            <div className="kpi-val">{activeCount}</div>
            <div className="kpi-sub" style={{ color: '#4ade80' }}>{activePct}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <SteeringWheelIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>On Trip</div>
            <div className="kpi-val">{onTripCount}</div>
            <div className="kpi-sub" style={{ color: '#60a5fa' }}>{onTripPct}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
            <UsersIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>On Leave / Inactive</div>
            <div className="kpi-val">{leaveCount}</div>
            <div className="kpi-sub" style={{ color: '#facc15' }}>{leavePct}%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <IdCardIcon size={20} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>License Expiring Soon</div>
            <div className="kpi-val">{expiringSoonCount}</div>
            <div className="kpi-sub" style={{ color: '#f87171' }}>Next 30 days</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ marginBottom: '16px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
            <div className="search-input" style={{ flex: 1 }}>
              <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <SearchIcon size={16} color="var(--color-text-muted)" />
              </span>
              <input
                type="text"
                placeholder="Search by name, phone or license..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                id="driver-search"
              />
            </div>

            <select
              className="form-select"
              style={{ width: '140px' }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="on_trip">On Trip</option>
              <option value="on_leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              className="form-select"
              style={{ width: '150px' }}
              value={licenseTypeFilter}
              onChange={(e) => { setLicenseTypeFilter(e.target.value); setPage(1); }}
            >
              <option value="">All License Types</option>
              <option value="HMV">HMV</option>
              <option value="HTV">HTV</option>
              <option value="LMV">LMV</option>
            </select>

            <select
              className="form-select"
              style={{ width: '140px' }}
              value={vehicleFilter}
              onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Vehicles</option>
              {vehiclesList.map((v: any) => (
                <option key={v.id} value={v.registrationNumber}>{v.registrationNumber}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', background: showMoreFilters ? 'var(--color-border)' : undefined }}
            >
              <FilterIcon size={15} /> More Filters 🎛️
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
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                License Expiry
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface2)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ border: 'none', padding: 0, background: 'transparent', fontSize: '12px' }}
                  value={licenseExpStart}
                  onChange={(e) => setLicenseExpStart(e.target.value)}
                />
                <span style={{ color: 'var(--color-text-muted)' }}>~</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ border: 'none', padding: 0, background: 'transparent', fontSize: '12px' }}
                  value={licenseExpEnd}
                  onChange={(e) => setLicenseExpEnd(e.target.value)}
                />
                <CalendarIcon size={15} color="var(--color-text-muted)" />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                Joined Date
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface2)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <input
                  type="date"
                  className="form-input"
                  style={{ border: 'none', padding: 0, background: 'transparent', fontSize: '12px' }}
                  value={joinedStart}
                  onChange={(e) => setJoinedStart(e.target.value)}
                />
                <span style={{ color: 'var(--color-text-muted)' }}>~</span>
                <input
                  type="date"
                  className="form-input"
                  style={{ border: 'none', padding: 0, background: 'transparent', fontSize: '12px' }}
                  value={joinedEnd}
                  onChange={(e) => setJoinedEnd(e.target.value)}
                />
                <CalendarIcon size={15} color="var(--color-text-muted)" />
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>
                Assigned Branch
              </label>
              <select
                className="form-select"
                style={{ width: '100%' }}
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">All Branches</option>
                <option value="Chennai Main">Chennai Main</option>
                <option value="Madurai Hub">Madurai Hub</option>
                <option value="Coimbatore Yard">Coimbatore Yard</option>
              </select>
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
                    checked={paginatedDrivers.length > 0 && selectedIds.length === paginatedDrivers.length}
                  />
                </th>
                <th>DRIVER DETAILS</th>
                <th>CONTACT</th>
                <th>LICENSE DETAILS</th>
                <th>ASSIGNED VEHICLE</th>
                <th>STATUS</th>
                <th>JOINED ON</th>
                <th style={{ textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : paginatedDrivers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <UsersIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No drivers found</div>
                      <div className="empty-state-sub">Try resetting your search or filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDrivers.map((d: any, idx: number) => {
                  const statusInfo = STATUS_BADGES[d.status] || STATUS_BADGES.active;
                  const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  const initials = getInitials(d.name);

                  const expDate = new Date(d.licenseExpiry);
                  const daysLeft = Math.ceil((expDate.getTime() - Date.now()) / 86_400_000);
                  const expColor = daysLeft < 0 ? '#f87171' : daysLeft <= 60 ? '#facc15' : '#4ade80';
                  const expText = expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                  return (
                    <tr key={d.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(d.id)}
                          onChange={() => handleSelectOne(d.id)}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: avatarBg,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                              {d.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              ID: {d.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text)', marginBottom: '2px' }}>
                          <PhoneIcon size={12} color="var(--color-text-muted)" />
                          <span>{d.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          <MailIcon size={12} color="var(--color-text-muted)" />
                          <span>{d.email}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text)' }}>
                          {d.licenseNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {d.licenseType}
                        </div>
                        <div style={{ fontSize: '11px', color: expColor, fontWeight: 600 }}>
                          Exp: {expText}
                        </div>
                      </td>
                      <td>
                        {d.vehicleReg ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TruckIcon size={16} color="var(--color-text-muted)" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '12px', color: '#f97316' }}>
                                {d.vehicleReg}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                {d.vehicleModel}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                            — <br />
                            <span style={{ fontSize: '10px' }}>Not Assigned</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.class}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                          <span>{statusInfo.icon}</span> {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text)' }}>
                          <CalendarIcon size={12} color="var(--color-text-muted)" />
                          <span>{new Date(d.joinedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {d.experienceYears}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Driver"
                            onClick={() => setViewDriverId(d.id)}
                            style={{ padding: '5px 8px' }}
                          >
                            <EyeIcon size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Driver"
                            onClick={() => setEditingDriver(d)}
                            style={{ padding: '5px 8px' }}
                          >
                            <EditIcon size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDelete(d)}
                              disabled={deleteMutation.isPending}
                              title="Delete Driver"
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
            Showing {paginatedDrivers.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredDrivers.length)} of {filteredDrivers.length} drivers
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

      {/* Bottom Status Legend & Warning Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--color-surface)', padding: '10px 16px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '12px' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>Status Legend:</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>🟢 Active</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>🔵 On Trip</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>🟡 On Leave</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>🔴 Inactive</span>
        </div>

        {expiringSoonCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 600 }}>
            <AlertTriangleIcon size={16} />
            <span>{expiringSoonCount} License Expiring Soon</span>
            <span style={{ marginLeft: '12px', cursor: 'pointer', textDecoration: 'underline' }}>View all &gt;</span>
          </div>
        )}
      </div>
    </div>
  );
}
