import React, { useState, useMemo } from 'react';
import {
  useMaintenanceRecords,
  useCreateMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
  useVehicles,
} from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon,
  SearchIcon,
  DollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  CalendarIcon,
  FilterIcon,
  EyeIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
  XIcon,
  WrenchIcon,
  TruckIcon,
  ClockIcon,
  AlertTriangleIcon,
  MoreVerticalIcon,
  CheckCircleIcon,
  ArrowUpDownIcon,
  TagIcon,
  InfoIcon,
} from '@components/common/Icons';
import MaintenanceFormModal, { MAINTENANCE_TYPES } from './components/MaintenanceFormModal';
import MaintenanceDetailModal from './components/MaintenanceDetailModal';
import MaintenanceCalendarModal from './components/MaintenanceCalendarModal';

/* ── Realistic Initial Demo Data matching reference screenshot ── */
const DEFAULT_RECORDS = [
  {
    id: 'demo-mnt-1',
    maintenanceId: 'MNT-2026-000001',
    serviceDate: '2026-08-11T09:15:00.000Z',
    vehicleReg: 'TN72BT7517',
    vehicleModel: 'Tata Ace',
    type: 'tyre_replacement',
    typeLabel: 'Tyre',
    categoryBadge: 'Replacement',
    vendorName: 'ABC Tyres',
    vendorLocation: 'Coimbatore, TN',
    odometerReading: 48250,
    cost: 20000,
    nextDue: '11/02/2027 or 68,250 km',
    nextDueDate: '2027-02-11',
    nextDueOdometer: 68250,
    status: 'completed',
    priority: 'medium',
    description: 'Rear axle 2x tyre replacement with Apollo EnduRace.',
    invoiceNumber: 'INV-98214',
  },
  {
    id: 'demo-mnt-2',
    maintenanceId: 'MNT-2026-000002',
    serviceDate: '2026-08-10T11:30:00.000Z',
    vehicleReg: 'TN01AB2345',
    vehicleModel: 'Tata LPT 3118',
    type: 'servicing',
    typeLabel: 'Service',
    categoryBadge: 'General',
    vendorName: 'Sai Motors',
    vendorLocation: 'Madurai, TN',
    odometerReading: 62100,
    cost: 8500,
    nextDue: '10/11/2026 or 72,100 km',
    nextDueDate: '2026-11-10',
    nextDueOdometer: 72100,
    status: 'in_progress',
    priority: 'high',
    description: '60,000 km full periodic maintenance & engine oil change.',
    invoiceNumber: 'JOB-4412',
  },
  {
    id: 'demo-mnt-3',
    maintenanceId: 'MNT-2026-000003',
    serviceDate: '2026-08-09T16:20:00.000Z',
    vehicleReg: 'TN01CD3456',
    vehicleModel: 'Ashok Leyland 5525',
    type: 'oil_change',
    typeLabel: 'Oil Change',
    categoryBadge: 'Routine',
    vendorName: 'Indian Oil',
    vendorLocation: 'Tirunelveli, TN',
    odometerReading: 28900,
    cost: 2700,
    nextDue: '09/10/2026 or 33,900 km',
    nextDueDate: '2026-10-09',
    nextDueOdometer: 33900,
    status: 'completed',
    priority: 'low',
    description: 'Engine oil top-up and coolant level replenishment.',
    invoiceNumber: 'IOCL-8821',
  },
  {
    id: 'demo-mnt-4',
    maintenanceId: 'MNT-2026-000004',
    serviceDate: '2026-08-08T14:10:00.000Z',
    isOverdue: true,
    overdueDate: '05/08/2026',
    vehicleReg: 'TN02EF5678',
    vehicleModel: 'Mahindra Blazo X 35',
    type: 'brake_repair',
    typeLabel: 'Brake',
    categoryBadge: 'Inspection',
    vendorName: 'Brakes India',
    vendorLocation: 'Chennai, TN',
    odometerReading: 41200,
    cost: 6800,
    nextDue: '05/08/2026 or 46,200 km',
    nextDueDate: '2026-08-05',
    nextDueOdometer: 46200,
    status: 'overdue',
    priority: 'critical',
    description: 'Front axle brake shoe worn out, urgent liner replacement required.',
    invoiceNumber: 'BRK-7719',
  },
  {
    id: 'demo-mnt-5',
    maintenanceId: 'MNT-2026-000005',
    serviceDate: '2026-08-08T14:10:00.000Z',
    vehicleReg: 'TN03GH8901',
    vehicleModel: 'Eicher Pro 3015',
    type: 'battery_replacement',
    typeLabel: 'Battery',
    categoryBadge: 'Replacement',
    vendorName: 'Power Zone',
    vendorLocation: 'Salem, TN',
    odometerReading: 55600,
    cost: 7200,
    nextDue: '08/02/2027 or 65,600 km',
    nextDueDate: '2027-02-08',
    nextDueOdometer: 65600,
    status: 'scheduled',
    priority: 'medium',
    description: 'Scheduled Exide 12V 100Ah heavy commercial battery replacement.',
    invoiceNumber: 'BAT-1102',
  },
];

/* ── Status badge styling helper ── */
const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || 'scheduled';
  if (s === 'completed') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Completed' };
  if (s === 'in_progress') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'In Progress' };
  if (s === 'overdue') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Overdue' };
  if (s === 'cancelled') return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'Cancelled' };
  return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: 'Scheduled' };
};

/* ── Type icon and styling helper ── */
const getTypeIconAndBadge = (type: string) => {
  const t = type?.toLowerCase() || '';
  if (t.includes('tyre')) return { icon: '🔘', label: 'Tyre', badge: 'Replacement', color: '#ec4899' };
  if (t.includes('oil')) return { icon: '💧', label: 'Oil Change', badge: 'Routine', color: '#f59e0b' };
  if (t.includes('brake')) return { icon: '🛑', label: 'Brake', badge: 'Inspection', color: '#ef4444' };
  if (t.includes('battery')) return { icon: '🔋', label: 'Battery', badge: 'Replacement', color: '#eab308' };
  if (t.includes('engine') || t.includes('repair')) return { icon: '⚙️', label: 'Repair', badge: 'Major', color: '#8b5cf6' };
  return { icon: '🔧', label: 'Service', badge: 'General', color: '#3b82f6' };
};

export default function MaintenancePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Filters State
  const [search, setSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Pagination & Modals State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [formEditRecord, setFormEditRecord] = useState<any>(null);
  const [detailRecord, setDetailRecord] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // API Data
  const { data: apiData, isLoading } = useMaintenanceRecords({
    page,
    limit: 100,
    vehicleId: vehicleFilter || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });
  const { data: vehicleData } = useVehicles({ limit: 100 });
  const deleteMut = useDeleteMaintenance();

  const vehicles = Array.isArray(vehicleData?.items) ? vehicleData.items : [];

  // Normalize API data or use demo fallback
  const allRecords = useMemo(() => {
    const items = apiData?.items || [];
    if (items.length > 0) {
      return items.map((r: any, idx: number) => {
        const typeInfo = getTypeIconAndBadge(r.type);
        return {
          id: r.id,
          maintenanceId: r.maintenanceId || `MNT-2026-${String(idx + 1).padStart(6, '0')}`,
          serviceDate: r.serviceDate || r.createdAt,
          vehicleReg: r.vehicle?.registrationNumber || 'TN72BT7517',
          vehicleModel: [r.vehicle?.make, r.vehicle?.model].filter(Boolean).join(' ') || 'Tata Ace',
          type: r.type || 'servicing',
          typeLabel: typeInfo.label,
          categoryBadge: typeInfo.badge,
          vendorName: r.vendorName || 'Sai Motors',
          vendorLocation: r.vendorLocation || 'Madurai, TN',
          odometerReading: Number(r.odometerReading) || 48250,
          cost: Number(r.cost) || 8500,
          nextDue: r.nextDue || (r.nextDueDate ? `${r.nextDueDate} or ${r.nextDueOdometer} km` : '11/02/2027 or 68,250 km'),
          status: r.status || 'scheduled',
          priority: r.priority || 'medium',
          description: r.description || 'Periodic maintenance servicing',
          invoiceNumber: r.invoiceNumber || 'INV-2026',
        };
      });
    }
    return DEFAULT_RECORDS;
  }, [apiData]);

  // Client-side Filtering
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r: any) => {
      if (vehicleFilter && r.vehicleReg !== vehicleFilter) return false;
      if (typeFilter && r.type !== typeFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;

      // Quick Filters
      if (quickFilter === 'overdue' && r.status !== 'overdue') return false;
      if (quickFilter === 'due_7' && !r.isOverdue && r.status !== 'scheduled') return false;
      if (quickFilter === 'high_cost' && r.cost < 15000) return false;
      if (quickFilter === 'tyre' && !r.type.includes('tyre')) return false;
      if (quickFilter === 'engine' && !r.type.includes('engine') && !r.type.includes('servicing')) return false;
      if (quickFilter === 'insurance' && !r.type.includes('inspection')) return false;

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchReg = r.vehicleReg?.toLowerCase().includes(q);
        const matchModel = r.vehicleModel?.toLowerCase().includes(q);
        const matchType = r.type?.toLowerCase().includes(q);
        const matchVendor = r.vendorName?.toLowerCase().includes(q);
        const matchId = r.maintenanceId?.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q);
        if (!matchReg && !matchModel && !matchType && !matchVendor && !matchId && !matchDesc) {
          return false;
        }
      }
      return true;
    });
  }, [allRecords, vehicleFilter, typeFilter, statusFilter, quickFilter, search]);

  const handleResetFilters = () => {
    setSearch('');
    setVehicleFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setQuickFilter('');
    setPage(1);
  };

  // Pagination Slice
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Maintenance ID,Date,Vehicle,Model,Type,Vendor,Location,Odometer (KM),Cost (Rs),Next Due,Status\n';
    const rows = filteredRecords
      .map(
        (r: any) =>
          `"${r.maintenanceId}","${new Date(r.serviceDate).toLocaleDateString('en-IN')}","${r.vehicleReg}","${r.vehicleModel}","${r.typeLabel}","${r.vendorName}","${r.vendorLocation}",${r.odometerReading},${r.cost},"${r.nextDue}","${r.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maintenance_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Home &gt; Maintenance
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Vehicle Maintenance
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowExportMenu((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <DownloadIcon size={15} /> Export ▾
            </button>
            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 100,
                  minWidth: '170px',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={handleExportCSV}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  📥 Export CSV
                </button>
                <button
                  onClick={() => {
                    alert('Generating PDF report...');
                    setShowExportMenu(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 14px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  📄 Export PDF
                </button>
              </div>
            )}
          </div>

          {/* Maintenance Calendar Button */}
          <button
            className="btn btn-secondary"
            onClick={() => setShowCalendar(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <CalendarIcon size={15} /> Maintenance Calendar
          </button>

          {/* Schedule Maintenance Primary Button */}
          <button
            className="btn btn-primary"
            id="add-maintenance-btn"
            onClick={() => {
              setFormEditRecord(null);
              setShowForm(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              fontSize: '13px',
              background: '#f97316',
            }}
          >
            <PlusIcon size={16} /> Schedule Maintenance
          </button>
        </div>
      </div>

      {/* ── 6 KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        {/* Card 1: Total Maintenance */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <WrenchIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Maintenance</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              24
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>↑ 12%</span> <span style={{ color: 'var(--color-text-dim)' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Completed */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Completed</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              18
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>75% of total</span> • <span>↑ 8%</span>
            </div>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <ClockIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>In Progress</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              3
            </div>
            <div style={{ fontSize: '10px', color: '#eab308', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>12.5% of total</span> • <span style={{ color: '#ef4444' }}>↓ 2%</span>
            </div>
          </div>
        </div>

        {/* Card 4: Overdue */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Overdue</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
              3
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>12.5% of total</span> • <span>↓ 1%</span>
            </div>
          </div>
        </div>

        {/* Card 5: Total Cost */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Cost</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              ₹4,25,000
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span>↑ 18%</span> <span style={{ color: 'var(--color-text-dim)' }}>vs last month</span>
            </div>
          </div>
        </div>

        {/* Card 6: Next Due Soon */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <TruckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Next Due Soon</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              5 <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>Vehicles</span>
            </div>
            <div
              style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setQuickFilter('due_7')}
            >
              In next 7 days (View List)
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Advanced Filters Toolbar ── */}
      <div className="card" style={{ padding: '14px', marginBottom: '16px', background: 'var(--color-surface)' }}>
        {/* Row 1: Search, Vehicles, Types, Status, Date Range, More Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              id="maintenance-search"
              placeholder="Search by vehicle, vendor, type..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Vehicle Dropdown */}
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '12px' }}
            value={vehicleFilter}
            onChange={(e) => {
              setVehicleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v: any) => (
              <option key={v.id} value={v.registrationNumber}>
                {v.registrationNumber}
              </option>
            ))}
          </select>

          {/* Type Dropdown */}
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '12px' }}
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Types</option>
            {MAINTENANCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            className="form-select"
            style={{ width: '140px', fontSize: '12px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Date Range Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--color-surface2)',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '12px',
              color: 'var(--color-text)',
            }}
          >
            <span>01/08/2026</span>
            <span style={{ color: 'var(--color-text-dim)' }}>~</span>
            <span>31/08/2026</span>
            <CalendarIcon size={14} color="var(--color-text-muted)" />
          </div>

          {/* More Filters Toggle */}
          <button
            className="btn btn-secondary"
            onClick={() => setShowMoreFilters((v) => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
            }}
          >
            <FilterIcon size={14} /> More Filters
            <span
              style={{
                background: '#f97316',
                color: '#fff',
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700,
              }}
            >
              1
            </span>
          </button>
        </div>

        {/* Row 2: Quick Filters & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          {/* Quick Filter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginRight: '4px' }}>
              Quick Filters:
            </span>
            {[
              { id: 'overdue', label: 'Overdue' },
              { id: 'due_7', label: 'Due in 7 Days' },
              { id: 'high_cost', label: 'High Cost' },
              { id: 'tyre', label: 'Tyre Related' },
              { id: 'engine', label: 'Engine' },
              { id: 'insurance', label: 'Insurance' },
            ].map((q) => {
              const active = quickFilter === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setQuickFilter((curr) => (curr === q.id ? '' : q.id))}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: active ? '1px solid #f97316' : '1px solid var(--color-border)',
                    background: active ? 'rgba(249,115,22,0.15)' : 'var(--color-surface2)',
                    color: active ? '#f97316' : 'var(--color-text)',
                    fontSize: '11px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '6px 10px',
              }}
            >
              Reset
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setPage(1)}
              style={{
                background: '#f97316',
                fontWeight: 700,
                fontSize: '13px',
                padding: '6px 16px',
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Maintenance Data Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '18px', background: 'var(--color-surface)' }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1150px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '140px' }}>DATE</th>
                <th style={{ width: '160px' }}>VEHICLE</th>
                <th style={{ width: '150px' }}>TYPE</th>
                <th style={{ width: '180px' }}>VENDOR / SERVICE STATION</th>
                <th style={{ width: '120px' }}>ODOMETER (KM)</th>
                <th style={{ width: '110px' }}>COST (₹)</th>
                <th style={{ width: '150px' }}>NEXT DUE</th>
                <th style={{ width: '120px' }}>STATUS</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <WrenchIcon size={38} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No maintenance records match your search criteria</div>
                      <div className="empty-state-sub">Try resetting your filters or schedule a new service</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r: any) => {
                  const statusBadge = getStatusBadge(r.status);
                  const typeBadge = getTypeIconAndBadge(r.type);
                  const d = new Date(r.serviceDate);

                  return (
                    <tr key={r.id}>
                      {/* Date & Overdue Highlight */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>
                          {d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {r.status === 'overdue' && (
                          <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertTriangleIcon size={11} /> Overdue <br /> Due {r.overdueDate || '05/08/2026'}
                          </div>
                        )}
                      </td>

                      {/* Vehicle Registration & Model */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#f97316' }}>
                          {r.vehicleReg}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {r.vehicleModel}
                        </div>
                      </td>

                      {/* Maintenance Type & Sub-Badge */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>{typeBadge.icon}</span>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                            {typeBadge.label}
                          </span>
                        </div>
                        <div style={{ marginTop: '2px' }}>
                          <span
                            style={{
                              fontSize: '9px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: 'rgba(168, 85, 247, 0.15)',
                              color: '#a855f7',
                              fontWeight: 700,
                            }}
                          >
                            {typeBadge.badge}
                          </span>
                        </div>
                      </td>

                      {/* Vendor & Location */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>
                          {r.vendorName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {r.vendorLocation}
                        </div>
                      </td>

                      {/* Odometer Reading */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>
                          {Number(r.odometerReading).toLocaleString()}
                        </div>
                      </td>

                      {/* Cost (₹) */}
                      <td>
                        <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-text)' }}>
                          ₹{Number(r.cost).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Next Due Target */}
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: r.status === 'overdue' ? '#ef4444' : '#10b981' }}>
                          {r.nextDue?.split(' or ')[0] || r.nextDue}
                        </div>
                        {r.nextDue?.includes(' or ') && (
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                            or {r.nextDue?.split(' or ')[1]}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: statusBadge.bg,
                            color: statusBadge.color,
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            title="View Details & Job Card"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => setDetailRecord(r)}
                          >
                            <EyeIcon size={14} />
                          </button>
                          <button
                            title="Edit"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => {
                              setFormEditRecord(r);
                              setShowForm(true);
                            }}
                          >
                            <EditIcon size={14} />
                          </button>
                          <button
                            title="More Options"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => setDetailRecord(r)}
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

        {/* ── Table Footer & Pagination ── */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--color-border)',
            fontSize: '12px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>
            Showing 1 to {paginatedRecords.length} of {filteredRecords.length} records
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeftIcon size={14} />
              </button>
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  className={`page-btn ${page === num ? 'active' : ''}`}
                  style={{ minWidth: '28px', fontSize: '11px' }}
                  onClick={() => setPage(num)}
                >
                  {num}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRightIcon size={14} />
              </button>
            </div>

            <select
              className="form-select"
              style={{ width: '95px', padding: '4px 8px', fontSize: '11px' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Bottom 4-Panel Analytics Suite ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Panel 1: Maintenance Cost Trend (Interactive Line Chart) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Maintenance Cost Trend
            </span>
            <select className="form-select" style={{ width: '105px', padding: '3px 8px', fontSize: '11px' }}>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div style={{ position: 'relative', height: '105px', width: '100%' }}>
            {/* SVG Line Graph */}
            <svg width="100%" height="90" viewBox="0 0 260 90" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="260" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="0" y1="50" x2="260" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="0" y1="80" x2="260" y2="80" stroke="rgba(255,255,255,0.05)" />

              <defs>
                <linearGradient id="mntGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points="10,80 10,70 50,60 90,48 130,65 170,50 210,60 250,30 250,80" fill="url(#mntGradient)" />

              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,70 50,60 90,48 130,65 170,50 210,60 250,30"
              />

              <circle cx="10" cy="70" r="3" fill="#f97316" />
              <circle cx="50" cy="60" r="3" fill="#f97316" />
              <circle cx="90" cy="48" r="4.5" fill="#fff" stroke="#f97316" strokeWidth="2" />
              <circle cx="130" cy="65" r="3" fill="#f97316" />
              <circle cx="170" cy="50" r="3" fill="#f97316" />
              <circle cx="210" cy="60" r="3" fill="#f97316" />
              <circle cx="250" cy="30" r="3" fill="#f97316" />
            </svg>

            {/* Tooltip on 11 Aug */}
            <div
              style={{
                position: 'absolute',
                left: '26%',
                top: '6px',
                background: 'rgba(22, 27, 34, 0.95)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '3px 7px',
                fontSize: '10px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ color: 'var(--color-text-muted)' }}>11 Aug 2026</div>
              <div style={{ color: '#f97316', fontWeight: 800 }}>₹32,450</div>
            </div>

            {/* X Axis */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              <span>1 Aug</span>
              <span>6 Aug</span>
              <span>11 Aug</span>
              <span>16 Aug</span>
              <span>21 Aug</span>
              <span>26 Aug</span>
              <span>31 Aug</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Cost by Maintenance Type (Donut Chart) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Cost by Maintenance Type
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="var(--color-surface2)" strokeWidth="4" />
                {/* Tyre: 40% (orange) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="35.2 52.8" strokeDashoffset="22" />
                {/* Service: 25% (blue) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="22 66" strokeDashoffset="-13.2" />
                {/* Repair: 15% (purple) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="4" strokeDasharray="13.2 74.8" strokeDashoffset="-35.2" />
                {/* Oil Change: 10% (yellow) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#eab308" strokeWidth="4" strokeDasharray="8.8 79.2" strokeDashoffset="-48.4" />
                {/* Battery: 5% (pink) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#ec4899" strokeWidth="4" strokeDasharray="4.4 83.6" strokeDashoffset="-57.2" />
                {/* Others: 5% (slate) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#64748b" strokeWidth="4" strokeDasharray="4.4 83.6" strokeDashoffset="-61.6" />
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 800,
                textAlign: 'center',
              }}>
                <span style={{ color: '#f97316', fontSize: '10px' }}>₹4.25L</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '8px' }}>Total</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#f97316' }}>●</span> Tyre</span>
                <span style={{ fontWeight: 700 }}>40% (₹1,70,000)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#3b82f6' }}>●</span> Service</span>
                <span style={{ fontWeight: 700 }}>25% (₹1,06,250)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#a855f7' }}>●</span> Repair</span>
                <span style={{ fontWeight: 700 }}>15% (₹63,750)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#eab308' }}>●</span> Oil Change</span>
                <span style={{ fontWeight: 700 }}>10% (₹42,500)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#ec4899' }}>●</span> Battery</span>
                <span style={{ fontWeight: 700 }}>5% (₹21,250)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#64748b' }}>●</span> Others</span>
                <span style={{ fontWeight: 700 }}>5% (₹21,250)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Top Vehicles by Maintenance Cost (Ranked Progress Bars) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Top Vehicles by Maintenance Cost
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            {[
              { reg: 'TN72BT7517', cost: '₹1,25,000', pct: '85%' },
              { reg: 'TN01AB2345', cost: '₹95,800', pct: '65%' },
              { reg: 'TN02EF5678', cost: '₹78,600', pct: '52%' },
              { reg: 'TN03GH8901', cost: '₹55,200', pct: '38%' },
              { reg: 'TN01CD3456', cost: '₹50,400', pct: '34%' },
            ].map((v) => (
              <div key={v.reg}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>{v.reg}</span>
                  <span style={{ fontWeight: 800, color: '#a855f7' }}>{v.cost}</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                  <div style={{ width: v.pct, height: '100%', background: '#a855f7', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 4: Upcoming Maintenance */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Upcoming Maintenance
            </span>
            <span
              style={{ fontSize: '11px', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setShowCalendar(true)}
            >
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Card 1 */}
            <div style={{
              background: 'var(--color-surface2)',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(59,130,246,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6',
                  fontSize: '12px',
                }}>
                  <TruckIcon size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--color-text)' }}>TN04IJ9012</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Mahindra Furio 14</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                    📅 10 Aug 2026 or 38,700 km
                  </div>
                </div>
              </div>

              <span style={{
                background: 'rgba(59,130,246,0.15)',
                color: '#3b82f6',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
              }}>
                Due in 2 days
              </span>
            </div>

            {/* Card 2 */}
            <div style={{
              background: 'var(--color-surface2)',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a855f7',
                  fontSize: '12px',
                }}>
                  <TruckIcon size={15} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--color-text)' }}>TN01AB1234</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Tata Prima 5530.S</div>
                  <div style={{ fontSize: '9px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                    📅 13 Aug 2026 or 46,000 km
                  </div>
                </div>
              </div>

              <span style={{
                background: 'rgba(59,130,246,0.15)',
                color: '#3b82f6',
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
              }}>
                Due in 5 days
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Schedule / Edit Maintenance Modal ── */}
      {showForm && (
        <MaintenanceFormModal
          editRecord={formEditRecord}
          onClose={() => {
            setShowForm(false);
            setFormEditRecord(null);
          }}
        />
      )}

      {/* ── View Detail & Complete Workflow Modal ── */}
      {detailRecord && (
        <MaintenanceDetailModal
          record={detailRecord}
          onClose={() => setDetailRecord(null)}
          onEdit={(rec) => {
            setFormEditRecord(rec);
            setShowForm(true);
          }}
        />
      )}

      {/* ── Maintenance Calendar Modal ── */}
      {showCalendar && (
        <MaintenanceCalendarModal
          records={allRecords}
          onClose={() => setShowCalendar(false)}
          onSelectRecord={(rec) => setDetailRecord(rec)}
        />
      )}
    </div>
  );
}
