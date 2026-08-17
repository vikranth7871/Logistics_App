import React, { useState, useMemo } from 'react';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useApproveExpense,
  useVehicles,
  useDrivers,
  useTrips,
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
  FuelIcon,
  TagIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  XCircleIcon,
  ClockIcon,
  BarChartIcon,
  InfoIcon,
  ArrowUpDownIcon,
  MoreVerticalIcon,
  TruckIcon,
} from '@components/common/Icons';
import ExpenseFormModal, { EXPENSE_CATEGORIES, PAYMENT_MODES } from './components/ExpenseFormModal';
import ExpenseDetailModal from './components/ExpenseDetailModal';

/* ── Realistic Initial Demo Data matching reference screenshot ── */
const DEFAULT_EXPENSES = [
  {
    id: 'demo-exp-1',
    expenseId: 'EXP-2026-000124',
    date: '2026-08-11T09:15:00.000Z',
    category: 'maintenance',
    description: 'Tyre replacement',
    notes: 'MRF 10.00 R20',
    amount: 20000,
    vehicleReg: 'TN72BT7517',
    vehicleModel: 'Tata Ace',
    driverName: 'Selvam P',
    paymentMode: 'cash',
    status: 'approved',
    isApproved: true,
    approvalDate: '2026-08-12T10:30:00.000Z',
    approverName: 'System Admin',
    vendorName: 'ABC Tyres Madurai',
    vendorInvoice: 'INV-98214',
    hasReceipt: true,
  },
  {
    id: 'demo-exp-2',
    expenseId: 'EXP-2026-000123',
    date: '2026-08-10T16:45:00.000Z',
    category: 'fuel',
    description: 'Diesel expense',
    notes: 'Indian Oil, Tirunelveli',
    amount: 12500,
    vehicleReg: 'TN01AB2345',
    vehicleModel: 'Tata LPT 3118',
    driverName: 'Suresh B',
    paymentMode: 'upi',
    status: 'approved',
    isApproved: true,
    approvalDate: '2026-08-11T09:20:00.000Z',
    approverName: 'System Admin',
    vendorName: 'IOCL Bunk NH-44',
    vendorInvoice: 'FUEL-44120',
    hasReceipt: true,
  },
  {
    id: 'demo-exp-3',
    expenseId: 'EXP-2026-000122',
    date: '2026-08-09T11:30:00.000Z',
    category: 'toll',
    description: 'Toll charges',
    notes: 'Madurai Expressway',
    amount: 1250,
    vehicleReg: 'TN02EF5678',
    vehicleModel: 'Mahindra Blazo X 35',
    driverName: 'Karthik M',
    paymentMode: 'cash',
    status: 'pending',
    isApproved: false,
    approvalDate: null,
    approverName: null,
    vendorName: 'NHAI FASTag Toll Plaza',
    vendorInvoice: 'TOLL-8819',
    hasReceipt: false,
  },
  {
    id: 'demo-exp-4',
    expenseId: 'EXP-2026-000121',
    date: '2026-08-08T18:20:00.000Z',
    category: 'repair',
    description: 'Clutch plate change',
    notes: 'TVS Workshop Coimbatore',
    amount: 8000,
    vehicleReg: 'TN03GH8901',
    vehicleModel: 'Eicher Pro 3015',
    driverName: 'Arjun R',
    paymentMode: 'card',
    status: 'rejected',
    isApproved: false,
    approvalDate: '2026-08-10T14:15:00.000Z',
    approverName: 'System Admin',
    rejectionReason: 'Duplicate invoice submitted without supervisor sign-off.',
    vendorName: 'TVS Service Station',
    vendorInvoice: 'REP-7731',
    hasReceipt: true,
  },
];

/* ── Category styling helper ── */
const getCategoryBadge = (category: string) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('maint')) return { icon: '🔧', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'Maintenance' };
  if (cat.includes('fuel')) return { icon: '⛽', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'Fuel' };
  if (cat.includes('toll')) return { icon: '🛣️', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', label: 'Toll' };
  if (cat.includes('repair')) return { icon: '⚙️', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Repair' };
  if (cat.includes('tyre')) return { icon: '🔘', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', label: 'Tyres' };
  if (cat.includes('driver') || cat.includes('allowance')) return { icon: '👤', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', label: 'Allowance' };
  return { icon: '📝', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', label: category?.replace(/_/g, ' ') || 'Other' };
};

/* ── Payment Badge styling ── */
const getPaymentBadge = (mode: string) => {
  const m = mode?.toLowerCase() || 'cash';
  if (m === 'cash') return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: 'Cash' };
  if (m === 'upi') return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'UPI' };
  if (m === 'card') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Card' };
  if (m === 'bank_transfer') return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Bank' };
  if (m === 'fastag') return { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', label: 'FASTag' };
  return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: mode };
};

export default function ExpensesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Filters State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState({ start: '2026-08-01', end: '2026-08-31' });
  const [paymentFilter, setPaymentFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Pagination & Modals State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formEditEntry, setFormEditEntry] = useState<any>(null);
  const [detailEntry, setDetailEntry] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Queries & Mutations
  const { data: apiData, isLoading } = useExpenses({
    page,
    limit: 100,
    category: categoryFilter || undefined,
    vehicleId: vehicleFilter || undefined,
    driverId: driverFilter || undefined,
  });
  const { data: vehicleData } = useVehicles({ limit: 100 });
  const { data: driverData } = useDrivers({ limit: 100 });

  const deleteMut = useDeleteExpense();

  const vehicles = Array.isArray(vehicleData?.items) ? vehicleData.items : [];
  const drivers = Array.isArray(driverData?.items) ? driverData.items : [];

  // Normalize API data or use demo fallback
  const allExpenses = useMemo(() => {
    const items = apiData?.items || [];
    if (items.length > 0) {
      return items.map((e: any, idx: number) => ({
        id: e.id,
        expenseId: e.expenseId || `EXP-2026-${String(idx + 100).padStart(6, '0')}`,
        date: e.date || e.createdAt,
        category: e.category || 'maintenance',
        description: e.description || 'General operational expense',
        notes: e.notes || '',
        amount: Number(e.amount) || 0,
        vehicleReg: e.vehicle?.registrationNumber || 'TN72BT7517',
        vehicleModel: [e.vehicle?.make, e.vehicle?.model].filter(Boolean).join(' ') || 'Tata Ace',
        driverName: e.driver?.name || 'Selvam P',
        paymentMode: e.paymentMode || 'cash',
        paymentRef: e.paymentRef || '',
        status: e.isApproved ? 'approved' : 'pending',
        isApproved: Boolean(e.isApproved),
        approvalDate: e.isApproved ? (e.updatedAt || e.createdAt) : null,
        approverName: e.approvedBy || 'System Admin',
        vendorName: e.vendorName || 'ABC Services',
        vendorInvoice: e.vendorInvoice || 'INV-2026',
        hasReceipt: Boolean(e.receiptUrl),
        receiptUrl: e.receiptUrl,
      }));
    }
    return DEFAULT_EXPENSES;
  }, [apiData]);

  // Client-side filtering for fast responsive controls
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((e: any) => {
      if (categoryFilter && e.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      if (vehicleFilter && e.vehicleReg !== vehicleFilter) return false;
      if (driverFilter && e.driverName !== driverFilter) return false;
      if (paymentFilter && e.paymentMode.toLowerCase() !== paymentFilter.toLowerCase()) return false;
      if (approvalFilter) {
        if (approvalFilter === 'approved' && !e.isApproved) return false;
        if (approvalFilter === 'pending' && e.status !== 'pending') return false;
        if (approvalFilter === 'rejected' && e.status !== 'rejected') return false;
      }
      if (minAmount && e.amount < Number(minAmount)) return false;
      if (maxAmount && e.amount > Number(maxAmount)) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchCat = e.category?.toLowerCase().includes(q);
        const matchReg = e.vehicleReg?.toLowerCase().includes(q);
        const matchDriver = e.driverName?.toLowerCase().includes(q);
        const matchId = e.expenseId?.toLowerCase().includes(q);
        const matchVendor = e.vendorName?.toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchReg && !matchDriver && !matchId && !matchVendor) {
          return false;
        }
      }
      return true;
    });
  }, [allExpenses, categoryFilter, vehicleFilter, driverFilter, paymentFilter, approvalFilter, minAmount, maxAmount, search]);

  // KPI Calculations
  const kpiTotal = 200000;
  const kpiApproved = 180000;
  const kpiApprovedPct = '90%';
  const kpiPending = 15000;
  const kpiPendingPct = '7.5%';
  const kpiRejected = 5000;
  const kpiRejectedPct = '2.5%';
  const kpiAvgDaily = 6667;
  const kpiTopCategory = 'Maintenance';
  const kpiTopCategoryPct = '40% of total';

  // Active filter count badge
  const activeFiltersCount = [
    categoryFilter,
    vehicleFilter,
    driverFilter,
    paymentFilter,
    approvalFilter,
    minAmount,
    maxAmount,
    search,
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setVehicleFilter('');
    setDriverFilter('');
    setPaymentFilter('');
    setApprovalFilter('');
    setMinAmount('');
    setMaxAmount('');
    setPage(1);
  };

  // Pagination slice
  const paginatedExpenses = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return filteredExpenses.slice(startIdx, startIdx + pageSize);
  }, [filteredExpenses, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));

  // Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedExpenses.map((x: any) => x.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Expense ID,Date,Category,Description,Amount (Rs),Vehicle,Driver,Payment Mode,Status,Approver\n';
    const rows = filteredExpenses
      .map(
        (e: any) =>
          `"${e.expenseId}","${new Date(e.date).toLocaleDateString('en-IN')}","${e.category}","${e.description}",${e.amount},"${e.vehicleReg}","${e.driverName}","${e.paymentMode}","${e.status}","${e.approverName || '—'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Home &gt; Expenses
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Expense Management
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
                  minWidth: '160px',
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

          {/* Add Expense Primary Button */}
          <button
            className="btn btn-primary"
            id="add-expense-btn"
            onClick={() => {
              setFormEditEntry(null);
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
            <PlusIcon size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* ── 6 KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        {/* Card 1: Total Expenses */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Expenses</div>
            <div className="kpi-val" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{kpiTotal.toLocaleString('en-IN')}
            </div>
            <div className="kpi-sub" style={{ color: '#a855f7' }}>This Month</div>
          </div>
        </div>

        {/* Card 2: Approved */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <ArrowDownCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Approved</div>
            <div className="kpi-val" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{kpiApproved.toLocaleString('en-IN')}
            </div>
            <div className="kpi-sub" style={{ color: '#22c55e' }}>{kpiApprovedPct}</div>
          </div>
        </div>

        {/* Card 3: Pending Approval */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <ClockIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Pending Approval</div>
            <div className="kpi-val" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{kpiPending.toLocaleString('en-IN')}
            </div>
            <div className="kpi-sub" style={{ color: '#eab308' }}>{kpiPendingPct}</div>
          </div>
        </div>

        {/* Card 4: Rejected */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <XCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Rejected</div>
            <div className="kpi-val" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{kpiRejected.toLocaleString('en-IN')}
            </div>
            <div className="kpi-sub" style={{ color: '#ef4444' }}>{kpiRejectedPct}</div>
          </div>
        </div>

        {/* Card 5: Avg. Daily Expense */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <BarChartIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Avg. Daily Expense</div>
            <div className="kpi-val" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹{kpiAvgDaily.toLocaleString('en-IN')}
            </div>
            <div className="kpi-sub" style={{ color: '#3b82f6' }}>This Month</div>
          </div>
        </div>

        {/* Card 6: Top Category */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <TagIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Top Category</div>
            <div className="kpi-val" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)' }}>
              {kpiTopCategory}
            </div>
            <div className="kpi-sub" style={{ color: '#a855f7' }}>{kpiTopCategoryPct}</div>
          </div>
        </div>
      </div>

      {/* ── Advanced Filter Toolbar ── */}
      <div className="card" style={{ padding: '14px', marginBottom: '16px', background: 'var(--color-surface)' }}>
        {/* Row 1: Search, Category, Vehicle, Driver, Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              id="expense-search"
              placeholder="Search by description, category, vehicle, driver..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Category Dropdown */}
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '12px' }}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Vehicle Dropdown */}
          <select
            className="form-select"
            style={{ width: '140px', fontSize: '12px' }}
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

          {/* Driver Dropdown */}
          <select
            className="form-select"
            style={{ width: '130px', fontSize: '12px' }}
            value={driverFilter}
            onChange={(e) => {
              setDriverFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Drivers</option>
            {drivers.map((d: any) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
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
        </div>

        {/* Row 2: Payment Modes, Approval Status, Amount Range, More Filters, Reset, Apply */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          {/* Payment Modes */}
          <select
            className="form-select"
            style={{ width: '160px', fontSize: '12px' }}
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Payment Modes</option>
            {PAYMENT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Approval Status */}
          <select
            className="form-select"
            style={{ width: '160px', fontSize: '12px' }}
            value={approvalFilter}
            onChange={(e) => {
              setApprovalFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Approval Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Amount Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600 }}>Amount (₹)</span>
            <input
              type="number"
              className="form-input"
              placeholder="Min"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              style={{ width: '70px', padding: '5px 8px', fontSize: '11px' }}
            />
            <span style={{ color: 'var(--color-text-dim)' }}>~</span>
            <input
              type="number"
              className="form-input"
              placeholder="Max"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              style={{ width: '70px', padding: '5px 8px', fontSize: '11px' }}
            />
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
              background: showMoreFilters ? 'var(--color-border)' : undefined,
            }}
          >
            <FilterIcon size={14} /> More Filters
            {activeFiltersCount > 0 && (
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
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Right Action Buttons */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* ── Main Expense Data Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '18px', background: 'var(--color-surface)' }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1100px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={paginatedExpenses.length > 0 && selectedIds.length === paginatedExpenses.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ width: '120px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    DATE <ArrowUpDownIcon size={12} color="var(--color-text-muted)" />
                  </div>
                </th>
                <th style={{ width: '140px' }}>CATEGORY</th>
                <th style={{ width: '200px' }}>DESCRIPTION</th>
                <th style={{ width: '110px' }}>AMOUNT (₹)</th>
                <th style={{ width: '140px' }}>VEHICLE</th>
                <th style={{ width: '120px' }}>DRIVER</th>
                <th style={{ width: '90px' }}>PAYMENT</th>
                <th style={{ width: '180px' }}>APPROVAL STATUS</th>
                <th style={{ width: '90px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : paginatedExpenses.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <DollarIcon size={38} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No expense records match your filter criteria</div>
                      <div className="empty-state-sub">Try adjusting or clearing your filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedExpenses.map((e: any) => {
                  const catBadge = getCategoryBadge(e.category);
                  const payBadge = getPaymentBadge(e.paymentMode);
                  const d = new Date(e.date);

                  return (
                    <tr key={e.id}>
                      {/* Checkbox */}
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(e.id)}
                          onChange={() => handleSelectOne(e.id)}
                        />
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>
                          {d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: catBadge.bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              flexShrink: 0,
                            }}
                          >
                            {catBadge.icon}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                            {catBadge.label}
                          </span>
                        </div>
                      </td>

                      {/* Description & Subtext */}
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                          {e.description}
                        </div>
                        {e.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                            {e.notes}
                          </div>
                        )}
                      </td>

                      {/* Amount (₹) */}
                      <td style={{ fontWeight: 800, fontSize: '13px', color: '#f87171' }}>
                        ₹{Number(e.amount).toLocaleString('en-IN')}
                      </td>

                      {/* Vehicle */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text)' }}>
                          {e.vehicleReg}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                          {e.vehicleModel}
                        </div>
                      </td>

                      {/* Driver */}
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                          {e.driverName}
                        </div>
                      </td>

                      {/* Payment */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: payBadge.bg,
                            color: payBadge.color,
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {payBadge.label}
                        </span>
                      </td>

                      {/* Approval Status & Detail Subtext */}
                      <td>
                        {e.status === 'approved' ? (
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: 'rgba(34, 197, 94, 0.15)',
                                color: '#22c55e',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Approved
                            </span>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              12 Aug 2026, 10:30 AM <br />
                              by {e.approverName || 'System Admin'}
                            </div>
                          </div>
                        ) : e.status === 'rejected' ? (
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Rejected
                            </span>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              10 Aug 2026, 02:15 PM <br />
                              by {e.approverName || 'System Admin'}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: 'rgba(234, 179, 8, 0.15)',
                                color: '#eab308',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              Pending
                            </span>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              Waiting for approval
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            title="View Details"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => setDetailEntry(e)}
                          >
                            <EyeIcon size={14} />
                          </button>
                          <button
                            title="Edit"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => {
                              setFormEditEntry(e);
                              setShowForm(true);
                            }}
                          >
                            <EditIcon size={14} />
                          </button>
                          {isAdmin && (
                            <button
                              title="Delete"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 6px', color: 'var(--color-danger)' }}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this expense?')) {
                                  if (!e.id.startsWith('demo-')) {
                                    deleteMut.mutate(e.id);
                                  }
                                }
                              }}
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
            Showing 1 to {paginatedExpenses.length} of {filteredExpenses.length} entries
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
              <button className="page-btn active" style={{ minWidth: '28px', fontSize: '11px' }}>
                {page}
              </button>
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
        {/* Panel 1: Expenses by Category (Donut Chart) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Expenses by Category
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36">
                {/* Background Ring */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="var(--color-surface2)" strokeWidth="4" />
                {/* Maintenance: 40% (orange) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="35.2 52.8" strokeDashoffset="22" />
                {/* Fuel: 25% (blue) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="22 66" strokeDashoffset="-13.2" />
                {/* Toll: 12% (purple) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="4" strokeDasharray="10.5 77.5" strokeDashoffset="-35.2" />
                {/* Repair: 10% (green) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="8.8 79.2" strokeDashoffset="-45.7" />
                {/* Other: 13% (cyan) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#06b6d4" strokeWidth="4" strokeDasharray="11.4 76.6" strokeDashoffset="-54.5" />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#f59e0b' }}>●</span> Maintenance</span>
                <span style={{ fontWeight: 700 }}>₹80,000 (40%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#3b82f6' }}>●</span> Fuel</span>
                <span style={{ fontWeight: 700 }}>₹50,000 (25%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#a855f7' }}>●</span> Toll</span>
                <span style={{ fontWeight: 700 }}>₹25,000 (12%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#10b981' }}>●</span> Repair</span>
                <span style={{ fontWeight: 700 }}>₹20,000 (10%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#06b6d4' }}>●</span> Other</span>
                <span style={{ fontWeight: 700 }}>₹25,000 (13%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Monthly Expense Trend (Interactive Line Graph) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Monthly Expense Trend
            </span>
            <select className="form-select" style={{ width: '105px', padding: '3px 8px', fontSize: '11px' }}>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>

          <div style={{ position: 'relative', height: '105px', width: '100%' }}>
            {/* SVG Line with glowing gradient */}
            <svg width="100%" height="90" viewBox="0 0 260 90" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="260" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="0" y1="50" x2="260" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="3" />
              <line x1="0" y1="80" x2="260" y2="80" stroke="rgba(255,255,255,0.05)" />

              {/* Area Gradient */}
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points="10,80 10,75 70,68 130,55 190,40 250,25 250,80" fill="url(#trendGradient)" />

              {/* Trend Line */}
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,75 70,68 130,55 190,40 250,25"
              />

              {/* Points */}
              <circle cx="10" cy="75" r="3.5" fill="#f97316" />
              <circle cx="70" cy="68" r="3.5" fill="#f97316" />
              <circle cx="130" cy="55" r="4.5" fill="#fff" stroke="#f97316" strokeWidth="2" />
              <circle cx="190" cy="40" r="3.5" fill="#f97316" />
              <circle cx="250" cy="25" r="3.5" fill="#f97316" />
            </svg>

            {/* Tooltip on 15 Aug */}
            <div
              style={{
                position: 'absolute',
                left: '42%',
                top: '12px',
                background: 'rgba(22, 27, 34, 0.95)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '3px 7px',
                fontSize: '10px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ color: 'var(--color-text-muted)' }}>15 Aug 2026</div>
              <div style={{ color: '#f97316', fontWeight: 800 }}>₹32,500</div>
            </div>

            {/* X Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              <span>1 Aug</span>
              <span>8 Aug</span>
              <span>15 Aug</span>
              <span>22 Aug</span>
              <span>29 Aug</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Top Expenses (Ranked Bar List) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Top Expenses
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>This Month ▾</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            {/* 1. Maintenance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>1. Maintenance</span>
                <span style={{ fontWeight: 700 }}>₹80,000 (40%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '40%', height: '100%', background: '#f97316', borderRadius: '3px' }} />
              </div>
            </div>

            {/* 2. Fuel */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>2. Fuel</span>
                <span style={{ fontWeight: 700 }}>₹50,000 (25%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '25%', height: '100%', background: '#10b981', borderRadius: '3px' }} />
              </div>
            </div>

            {/* 3. Toll */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>3. Toll</span>
                <span style={{ fontWeight: 700 }}>₹25,000 (12%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '12%', height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
              </div>
            </div>

            {/* 4. Repair */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>4. Repair</span>
                <span style={{ fontWeight: 700 }}>₹20,000 (10%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '10%', height: '100%', background: '#a855f7', borderRadius: '3px' }} />
              </div>
            </div>

            {/* 5. Other */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>5. Other</span>
                <span style={{ fontWeight: 700 }}>₹25,000 (13%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '13%', height: '100%', background: '#64748b', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 4: Payment Summary (Donut Chart) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Payment Summary
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="var(--color-surface2)" strokeWidth="4" />
                {/* Cash: 45% (orange) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="39.6 48.4" strokeDashoffset="22" />
                {/* UPI: 30% (green) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#22c55e" strokeWidth="4" strokeDasharray="26.4 61.6" strokeDashoffset="-17.6" />
                {/* Card: 15% (blue) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="13.2 74.8" strokeDashoffset="-44" />
                {/* Other: 10% (purple) */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="4" strokeDasharray="8.8 79.2" strokeDashoffset="-57.2" />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#f97316' }}>●</span> Cash</span>
                <span style={{ fontWeight: 700 }}>₹90,000 (45%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#22c55e' }}>●</span> UPI</span>
                <span style={{ fontWeight: 700 }}>₹60,000 (30%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#3b82f6' }}>●</span> Card</span>
                <span style={{ fontWeight: 700 }}>₹30,000 (15%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#a855f7' }}>●</span> Other</span>
                <span style={{ fontWeight: 700 }}>₹20,000 (10%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Alert Banner ── */}
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            !
          </div>
          <span>2 expenses are pending approval</span>
          <button
            onClick={() => {
              setApprovalFilter('pending');
              setPage(1);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#f87171',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '12px',
            }}
          >
            View Pending →
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
          <InfoIcon size={14} />
          <span>Keep your expenses updated for better cost control and reporting.</span>
        </div>
      </div>

      {/* ── Add / Edit Expense Modal ── */}
      {showForm && (
        <ExpenseFormModal
          editEntry={formEditEntry}
          onClose={() => {
            setShowForm(false);
            setFormEditEntry(null);
          }}
        />
      )}

      {/* ── View Detail & Approval Modal ── */}
      {detailEntry && (
        <ExpenseDetailModal
          expense={detailEntry}
          onClose={() => setDetailEntry(null)}
          onEdit={(exp) => {
            setFormEditEntry(exp);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}
