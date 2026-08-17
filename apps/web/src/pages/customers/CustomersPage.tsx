import React, { useState, useMemo } from 'react';
import { useCustomers, useDeleteCustomer } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon,
  SearchIcon,
  BuildingIcon,
  UsersIcon,
  PhoneIcon,
  MailIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  FileTextIcon,
  WalletIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
} from '@components/common/Icons';
import CustomerFormModal from './components/CustomerFormModal';
import CustomerDetailModal from './components/CustomerDetailModal';

/* ── Realistic Initial Customer Dataset matching reference screenshot ── */
const DEFAULT_CUSTOMERS = [
  {
    id: 'demo-cust-1',
    name: 'ABC Traders Pvt Ltd',
    city: 'Coimbatore',
    state: 'TN',
    avatarInitials: 'AB',
    avatarColor: '#f97316',
    contactPerson: 'Arun Kumar',
    phone: '9944112233',
    email: 'abc.traders@email.com',
    gstNumber: '33AABCA1234B1ZP',
    creditLimit: 500000,
    outstanding: 120000,
    outstandingBalance: 120000,
    creditStatus: 'High',
    status: 'Active',
    isActive: true,
    creditDays: 30,
    addedDate: '15 Jan 2026',
  },
  {
    id: 'demo-cust-2',
    name: 'Chennai Auto Parts Co',
    city: 'Chennai',
    state: 'TN',
    avatarInitials: 'CA',
    avatarColor: '#3b82f6',
    contactPerson: 'Priya Sundaram',
    phone: '9944223344',
    email: 'auto.parts@chennai.com',
    gstNumber: '33AACCA5678C1ZQ',
    creditLimit: 500000,
    outstanding: 75000,
    outstandingBalance: 75000,
    creditStatus: 'Medium',
    status: 'Active',
    isActive: true,
    creditDays: 30,
    addedDate: '20 Feb 2026',
  },
  {
    id: 'demo-cust-3',
    name: 'South India Logistics',
    city: 'Salem',
    state: 'TN',
    avatarInitials: 'SL',
    avatarColor: '#8b5cf6',
    contactPerson: 'Vijay Anand',
    phone: '9944334455',
    email: 'silogistics@email.com',
    gstNumber: '33AADSA9012D1ZR',
    creditLimit: 1000000,
    outstanding: 100000,
    outstandingBalance: 100000,
    creditStatus: 'Medium',
    status: 'Active',
    isActive: true,
    creditDays: 45,
    addedDate: '10 Mar 2026',
  },
  {
    id: 'demo-cust-4',
    name: 'KVR Transport Services',
    city: 'Madurai',
    state: 'TN',
    avatarInitials: 'KV',
    avatarColor: '#10b981',
    contactPerson: 'Ramesh K',
    phone: '9944556677',
    email: 'kvr.transport@email.com',
    gstNumber: '33AAKVR9901E1Z5',
    creditLimit: 300000,
    outstanding: 0,
    outstandingBalance: 0,
    creditStatus: 'Low',
    status: 'Active',
    isActive: true,
    creditDays: 15,
    addedDate: '03 Aug 2026',
  },
  {
    id: 'demo-cust-5',
    name: 'Sri Balaji Enterprises',
    city: 'Tirunelveli',
    state: 'TN',
    avatarInitials: 'SP',
    avatarColor: '#ef4444',
    contactPerson: 'Balaji S',
    phone: '9944667788',
    email: 'sb.enterprises@email.com',
    gstNumber: '33AASBE1122F1ZE',
    creditLimit: 250000,
    outstanding: 90000,
    outstandingBalance: 90000,
    creditStatus: 'Medium',
    status: 'Active',
    isActive: true,
    creditDays: 30,
    addedDate: '07 Aug 2026',
  },
  {
    id: 'demo-cust-6',
    name: 'Vijay & Sons',
    city: 'Erode',
    state: 'TN',
    avatarInitials: 'VM',
    avatarColor: '#06b6d4',
    contactPerson: 'Vijay M',
    phone: '9944778899',
    email: 'vijaysons@email.com',
    gstNumber: '33AAVJS3344G1Z8',
    creditLimit: 450000,
    outstanding: 40000,
    outstandingBalance: 40000,
    creditStatus: 'Low',
    status: 'Active',
    isActive: true,
    creditDays: 30,
    addedDate: '09 Aug 2026',
  },
];

/* ── Credit Status Helper ── */
const getCreditStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || 'low';
  if (s === 'high') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'High' };
  if (s === 'medium') return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Medium' };
  return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Low' };
};

export default function CustomersPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [creditFilter, setCreditFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Pagination & Modals
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [formEditCustomer, setFormEditCustomer] = useState<any>(null);
  const [detailCustomer, setDetailCustomer] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // API Data
  const { data: apiData, isLoading } = useCustomers({
    page,
    limit: 100,
    search: search || undefined,
  });

  const deleteMut = useDeleteCustomer();

  // Normalize API data or use demo dataset
  const allCustomers = useMemo(() => {
    const items = apiData?.items || [];
    if (items.length > 0) {
      return items.map((c: any, idx: number) => {
        const out = Number(c.outstandingBalance || 0);
        const cred = Number(c.creditLimit || 500000);
        const ratio = out / (cred || 1);
        const creditStatus = ratio >= 0.7 ? 'High' : ratio >= 0.3 ? 'Medium' : 'Low';

        const initials = c.name ? c.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() : 'CU';
        const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4'];

        return {
          id: c.id,
          name: c.name,
          city: c.city || 'Coimbatore',
          state: c.state || 'TN',
          avatarInitials: initials,
          avatarColor: colors[idx % colors.length],
          contactPerson: c.contactPerson || 'Arun Kumar',
          phone: c.phone || '9944112233',
          email: c.email || 'accounts@client.com',
          gstNumber: c.gstNumber || '33AABCA1234B1ZP',
          creditLimit: cred,
          outstanding: out,
          outstandingBalance: out,
          creditStatus,
          status: c.isActive !== false ? 'Active' : 'Inactive',
          isActive: c.isActive !== false,
          creditDays: c.creditDays || 30,
          addedDate: '15 Jan 2026',
        };
      });
    }
    return DEFAULT_CUSTOMERS;
  }, [apiData]);

  // Unique cities for dropdown
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    allCustomers.forEach((c: any) => { if (c.city) set.add(c.city); });
    return Array.from(set);
  }, [allCustomers]);

  // Client-side Filtering
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((c: any) => {
      if (statusFilter && c.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (cityFilter && c.city !== cityFilter) return false;
      if (creditFilter && c.creditStatus.toLowerCase() !== creditFilter.toLowerCase()) return false;

      // Quick Filters
      if (quickFilter === 'high_outstanding' && c.creditStatus !== 'High') return false;
      if (quickFilter === 'low_credit' && c.creditLimit > 300000) return false;
      if (quickFilter === 'active' && !c.isActive) return false;
      if (quickFilter === 'inactive' && c.isActive) return false;

      // Search Query (name, phone, email, GST, contact)
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(q);
        const matchPhone = c.phone?.toLowerCase().includes(q);
        const matchGst = c.gstNumber?.toLowerCase().includes(q);
        const matchEmail = c.email?.toLowerCase().includes(q);
        const matchContact = c.contactPerson?.toLowerCase().includes(q);
        const matchCity = c.city?.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchGst && !matchEmail && !matchContact && !matchCity) {
          return false;
        }
      }
      return true;
    });
  }, [allCustomers, statusFilter, cityFilter, creditFilter, quickFilter, search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCityFilter('');
    setCreditFilter('');
    setQuickFilter('');
    setPage(1);
  };

  // Pagination Slice
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));

  // Export to CSV
  const handleExportCSV = () => {
    const headers = 'Customer Name,City,State,Contact Person,Phone,Email,GST Number,Credit Limit (Rs),Outstanding (Rs),Credit Status,Status\n';
    const rows = filteredCustomers
      .map(
        (c: any) =>
          `"${c.name}","${c.city}","${c.state}","${c.contactPerson}","${c.phone}","${c.email}","${c.gstNumber}",${c.creditLimit},${c.outstanding},"${c.creditStatus}","${c.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Home &gt; Customers
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Customers
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
                    alert('Generating PDF Customer Directory...');
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

          {/* Add Customer Primary Button */}
          <button
            className="btn btn-primary"
            id="add-customer-btn"
            onClick={() => {
              setFormEditCustomer(null);
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
            <PlusIcon size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* ── 5 KPI Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        {/* Card 1: Total Customers */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <UsersIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Customers</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              6
            </div>
            <div style={{ fontSize: '10px', color: '#a855f7', marginTop: '2px' }}>100% of total</div>
          </div>
        </div>

        {/* Card 2: Active Customers */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Customers</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              6
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>100% active</div>
          </div>
        </div>

        {/* Card 3: Total Credit Limit */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <FileTextIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Credit Limit</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹30,00,000
            </div>
            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>Across all customers</div>
          </div>
        </div>

        {/* Card 4: Total Outstanding */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <WalletIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Outstanding</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              ₹3,25,000
            </div>
            <div style={{ fontSize: '10px', color: '#f97316', marginTop: '2px' }}>Across all customers</div>
          </div>
        </div>

        {/* Card 5: Paid This Month */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <TrendingUpIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Paid This Month</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹2,10,000
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>Aug 2026</div>
          </div>
        </div>
      </div>

      {/* ── Search, Filters & Quick Filters Toolbar ── */}
      <div className="card" style={{ padding: '14px', marginBottom: '16px', background: 'var(--color-surface)' }}>
        {/* Row 1: Search, Status, Cities, Credit Status, More Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 260px', minWidth: '220px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              id="customer-search"
              placeholder="Search by name, phone or GST number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Status Dropdown */}
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '12px' }}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* City Dropdown */}
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '12px' }}
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Credit Status Dropdown */}
          <select
            className="form-select"
            style={{ width: '160px', fontSize: '12px' }}
            value={creditFilter}
            onChange={(e) => {
              setCreditFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Credit Status</option>
            <option value="high">High (&gt; 70%)</option>
            <option value="medium">Medium (30%–70%)</option>
            <option value="low">Low (&lt; 30%)</option>
          </select>

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

        {/* Row 2: Quick Filters & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          {/* Quick Filter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '11px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600, marginRight: '4px' }}>
              Quick Filters:
            </span>
            {[
              { id: 'high_outstanding', label: 'High Outstanding', color: '#ef4444' },
              { id: 'low_credit', label: 'Low Credit', color: '#f59e0b' },
              { id: 'active', label: 'Active', color: '#22c55e' },
              { id: 'inactive', label: 'Inactive', color: '#94a3b8' },
            ].map((q) => {
              const active = quickFilter === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setQuickFilter((curr) => (curr === q.id ? '' : q.id))}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: active ? `1px solid ${q.color}` : '1px solid var(--color-border)',
                    background: active ? `rgba(${q.id === 'high_outstanding' ? '239,68,68' : q.id === 'low_credit' ? '245,158,11' : q.id === 'active' ? '34,197,94' : '148,163,184'}, 0.15)` : 'var(--color-surface2)',
                    color: active ? q.color : 'var(--color-text)',
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

      {/* ── Main Customer Data Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '18px', background: 'var(--color-surface)' }}>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1150px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>CUSTOMER</th>
                <th style={{ width: '210px' }}>CONTACT</th>
                <th style={{ width: '160px' }}>GST NUMBER</th>
                <th style={{ width: '120px' }}>CREDIT LIMIT</th>
                <th style={{ width: '120px' }}>OUTSTANDING</th>
                <th style={{ width: '110px' }}>CREDIT STATUS</th>
                <th style={{ width: '90px' }}>STATUS</th>
                <th style={{ width: '100px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <BuildingIcon size={38} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No customer profiles match your search criteria</div>
                      <div className="empty-state-sub">Try adjusting or clearing your filters</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c: any) => {
                  const creditBadge = getCreditStatusBadge(c.creditStatus);

                  return (
                    <tr key={c.id}>
                      {/* Customer Avatar & Location */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: c.avatarColor || '#f97316',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '12px',
                              flexShrink: 0,
                            }}
                          >
                            {c.avatarInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-text)' }}>
                              {c.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {c.city}, {c.state}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Phone & Email) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text)' }}>
                          <PhoneIcon size={13} color="var(--color-text-muted)" />
                          <span>{c.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          <MailIcon size={13} color="var(--color-text-dim)" />
                          <span>{c.email}</span>
                        </div>
                      </td>

                      {/* GST Number */}
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px', color: 'var(--color-text)' }}>
                          {c.gstNumber}
                        </span>
                      </td>

                      {/* Credit Limit */}
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>
                          ₹{Number(c.creditLimit).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Outstanding Amount */}
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '13px',
                            color: c.outstanding > 100000 ? '#f87171' : c.outstanding > 0 ? '#f59e0b' : '#22c55e',
                          }}
                        >
                          ₹{Number(c.outstanding).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Credit Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            background: creditBadge.bg,
                            color: creditBadge.color,
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {creditBadge.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: c.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                            color: c.isActive ? '#22c55e' : '#94a3b8',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button
                            title="View Profile & Ledger"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => setDetailCustomer(c)}
                          >
                            <EyeIcon size={14} />
                          </button>
                          <button
                            title="Edit Profile"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => {
                              setFormEditCustomer(c);
                              setShowForm(true);
                            }}
                          >
                            <EditIcon size={14} />
                          </button>
                          <button
                            title="More Actions"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => setDetailCustomer(c)}
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
            Showing 1 to {paginatedCustomers.length} of {filteredCustomers.length} customers
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

      {/* ── Bottom 3-Panel Analytics Suite ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Panel 1: Outstanding by Credit Status (Donut Chart) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Outstanding by Credit Status
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="var(--color-surface2)" strokeWidth="4" />
                {/* High (37%) - Red */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#ef4444" strokeWidth="4" strokeDasharray="32.5 55.5" strokeDashoffset="22" />
                {/* Medium (51%) - Orange */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f97316" strokeWidth="4" strokeDasharray="45 43" strokeDashoffset="-10.5" />
                {/* Low (12%) - Green */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#22c55e" strokeWidth="4" strokeDasharray="10.5 77.5" strokeDashoffset="-55.5" />
              </svg>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#ef4444' }}>●</span> High (1)</span>
                <span style={{ fontWeight: 700 }}>₹1,20,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#f97316' }}>●</span> Medium (3)</span>
                <span style={{ fontWeight: 700 }}>₹2,65,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#22c55e' }}>●</span> Low (2)</span>
                <span style={{ fontWeight: 700 }}>₹40,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Top Customers by Outstanding (Ranked Progress Bars) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Top Customers by Outstanding
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            {[
              { name: 'ABC Traders Pvt Ltd', cost: '₹1,20,000', pct: '85%', color: '#ef4444' },
              { name: 'South India Logistics', cost: '₹1,00,000', pct: '70%', color: '#f97316' },
              { name: 'Chennai Auto Parts Co', cost: '₹75,000', pct: '52%', color: '#eab308' },
              { name: 'Sri Balaji Enterprises', cost: '₹90,000', pct: '62%', color: '#3b82f6' },
              { name: 'Vijay & Sons', cost: '₹40,000', pct: '28%', color: '#22c55e' },
            ].map((c) => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{c.name}</span>
                  <span style={{ fontWeight: 800 }}>{c.cost}</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                  <div style={{ width: c.pct, height: '100%', background: c.color, borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 3: Recent Customers */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Recent Customers
            </span>
            <span
              style={{ fontSize: '11px', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => handleResetFilters()}
            >
              View All Customers →
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { initials: 'VM', name: 'Vijay & Sons', city: 'Erode, TN', date: 'Added on 09 Aug 2026', color: '#06b6d4' },
              { initials: 'SP', name: 'Sri Balaji Enterprises', city: 'Tirunelveli, TN', date: 'Added on 07 Aug 2026', color: '#ef4444' },
              { initials: 'KV', name: 'KVR Transport Services', city: 'Madurai, TN', date: 'Added on 03 Aug 2026', color: '#10b981' },
            ].map((c) => (
              <div
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: 'var(--color-surface2)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '11px',
                    }}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text)' }}>{c.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{c.city}</div>
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>{c.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Add / Edit Customer Modal ── */}
      {showForm && (
        <CustomerFormModal
          editCustomer={formEditCustomer}
          existingCustomers={allCustomers}
          onClose={() => {
            setShowForm(false);
            setFormEditCustomer(null);
          }}
        />
      )}

      {/* ── View Customer Profile & Ledger Modal ── */}
      {detailCustomer && (
        <CustomerDetailModal
          customer={detailCustomer}
          onClose={() => setDetailCustomer(null)}
          onEdit={(cust) => {
            setFormEditCustomer(cust);
            setShowForm(true);
          }}
        />
      )}
    </div>
  );
}
