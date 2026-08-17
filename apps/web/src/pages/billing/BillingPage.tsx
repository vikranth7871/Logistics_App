import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInvoices, useCustomers } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon,
  SearchIcon,
  ReceiptIcon,
  DollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  CalendarIcon,
  FilterIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon,
  BuildingIcon,
  TruckIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  WalletIcon,
  FileTextIcon,
  XIcon,
} from '@components/common/Icons';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import InvoiceDetailModal from './components/InvoiceDetailModal';
import RecordPaymentModal from './components/RecordPaymentModal';
import CustomerQuickViewModal from './components/CustomerQuickViewModal';

/* ── Realistic Initial Invoices Dataset ── */
const DEFAULT_INVOICES = [
  {
    id: 'demo-inv-1',
    invoiceNumber: 'INV-2026-9701',
    customerName: 'ABC Traders Pvt Ltd',
    customerId: 'demo-cust-1',
    city: 'Coimbatore',
    tripNumber: 'TRP-2026-00023',
    tripRoute: 'Chennai → Madurai',
    invoiceDate: '2026-08-11T00:00:00.000Z',
    dueDate: '2026-08-18T00:00:00.000Z',
    subtotal: 114285,
    taxTotal: 5715,
    grandTotal: 120000,
    paidAmount: 80000,
    balanceDue: 40000,
    status: 'partially_paid',
    gstRatePercent: 5,
  },
  {
    id: 'demo-inv-2',
    invoiceNumber: 'INV-2026-9702',
    customerName: 'South India Logistics',
    customerId: 'demo-cust-3',
    city: 'Salem',
    tripNumber: 'TRP-2026-00024',
    tripRoute: 'Salem → Bangalore',
    invoiceDate: '2026-08-10T00:00:00.000Z',
    dueDate: '2026-08-25T00:00:00.000Z',
    subtotal: 95238,
    taxTotal: 4762,
    grandTotal: 100000,
    paidAmount: 0,
    balanceDue: 100000,
    status: 'sent',
    gstRatePercent: 5,
  },
  {
    id: 'demo-inv-3',
    invoiceNumber: 'INV-2026-9703',
    customerName: 'Sri Balaji Enterprises',
    customerId: 'demo-cust-5',
    city: 'Tirunelveli',
    tripNumber: 'TRP-2026-00025',
    tripRoute: 'Tirunelveli → Chennai',
    invoiceDate: '2026-08-01T00:00:00.000Z',
    dueDate: '2026-08-08T00:00:00.000Z',
    subtotal: 85714,
    taxTotal: 4286,
    grandTotal: 90000,
    paidAmount: 0,
    balanceDue: 90000,
    status: 'overdue',
    gstRatePercent: 5,
  },
  {
    id: 'demo-inv-4',
    invoiceNumber: 'INV-2026-9704',
    customerName: 'Chennai Auto Parts Co',
    customerId: 'demo-cust-2',
    city: 'Chennai',
    tripNumber: 'TRP-2026-00026',
    tripRoute: 'Chennai → Coimbatore',
    invoiceDate: '2026-08-05T00:00:00.000Z',
    dueDate: '2026-08-20T00:00:00.000Z',
    subtotal: 71428,
    taxTotal: 3572,
    grandTotal: 75000,
    paidAmount: 75000,
    balanceDue: 0,
    status: 'paid',
    gstRatePercent: 5,
  },
  {
    id: 'demo-inv-5',
    invoiceNumber: 'INV-2026-9705',
    customerName: 'Vijay & Sons',
    customerId: 'demo-cust-6',
    city: 'Erode',
    tripNumber: 'TRP-2026-00027',
    tripRoute: 'Erode → Cochin',
    invoiceDate: '2026-08-09T00:00:00.000Z',
    dueDate: '2026-08-24T00:00:00.000Z',
    subtotal: 38095,
    taxTotal: 1905,
    grandTotal: 40000,
    paidAmount: 0,
    balanceDue: 40000,
    status: 'sent',
    gstRatePercent: 5,
  },
  {
    id: 'demo-inv-6',
    invoiceNumber: 'INV-2026-9706',
    customerName: 'KVR Transport Services',
    customerId: 'demo-cust-4',
    city: 'Madurai',
    tripNumber: 'TRP-2026-00028',
    tripRoute: 'Madurai → Tuticorin',
    invoiceDate: '2026-08-12T00:00:00.000Z',
    dueDate: '2026-08-27T00:00:00.000Z',
    subtotal: 47619,
    taxTotal: 2381,
    grandTotal: 50000,
    paidAmount: 50000,
    balanceDue: 0,
    status: 'paid',
    gstRatePercent: 5,
  },
];

/* ── Realistic Initial Payments Dataset ── */
const DEFAULT_PAYMENTS = [
  {
    id: 'demo-pay-1',
    paymentId: 'PAY-2026-00012',
    customerName: 'ABC Traders Pvt Ltd',
    invoiceNumber: 'INV-2026-9701',
    paymentDate: '2026-08-14T00:00:00.000Z',
    amount: 50000,
    paymentMethod: 'upi',
    referenceNumber: 'UTR-982142981',
    bankAccount: 'HDFC Bank - 502000123456',
  },
  {
    id: 'demo-pay-2',
    paymentId: 'PAY-2026-00013',
    customerName: 'ABC Traders Pvt Ltd',
    invoiceNumber: 'INV-2026-9701',
    paymentDate: '2026-08-17T00:00:00.000Z',
    amount: 30000,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'NEFT-88129841',
    bankAccount: 'HDFC Bank - 502000123456',
  },
  {
    id: 'demo-pay-3',
    paymentId: 'PAY-2026-00014',
    customerName: 'Chennai Auto Parts Co',
    invoiceNumber: 'INV-2026-9704',
    paymentDate: '2026-08-08T00:00:00.000Z',
    amount: 75000,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'RTGS-33129841',
    bankAccount: 'ICICI Bank - 001205008912',
  },
  {
    id: 'demo-pay-4',
    paymentId: 'PAY-2026-00015',
    customerName: 'KVR Transport Services',
    invoiceNumber: 'INV-2026-9706',
    paymentDate: '2026-08-13T00:00:00.000Z',
    amount: 50000,
    paymentMethod: 'cheque',
    referenceNumber: 'CHQ-441092',
    bankAccount: 'State Bank of India',
  },
  {
    id: 'demo-pay-5',
    paymentId: 'PAY-2026-00016',
    customerName: 'South India Logistics',
    invoiceNumber: 'INV-2026-9689',
    paymentDate: '2026-08-05T00:00:00.000Z',
    amount: 150000,
    paymentMethod: 'bank_transfer',
    referenceNumber: 'NEFT-11029841',
    bankAccount: 'HDFC Bank - 502000123456',
  },
];

/* ── Status badge styling helper ── */
const getInvoiceStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || 'draft';
  if (s === 'paid') return { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', label: 'Paid' };
  if (s === 'partially_paid') return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Partially Paid' };
  if (s === 'sent' || s === 'issued') return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'Sent' };
  if (s === 'overdue') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Overdue' };
  if (s === 'cancelled') return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: 'Cancelled' };
  return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: 'Draft' };
};

const getPaymentModeBadge = (mode: string) => {
  const m = mode?.toLowerCase() || 'upi';
  if (m.includes('upi')) return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', label: 'UPI' };
  if (m.includes('bank') || m.includes('neft') || m.includes('rtgs')) return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', label: 'Bank Transfer' };
  if (m.includes('cash')) return { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: 'Cash' };
  if (m.includes('cheque')) return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Cheque' };
  return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', label: mode };
};

interface BillingPageProps {
  initialTab?: 'invoices' | 'payments';
}

export default function BillingPage({ initialTab = 'invoices' }: BillingPageProps) {
  const location = useLocation();

  // Active Tab state (Invoices vs Payments)
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>(
    location.pathname === '/payments' || initialTab === 'payments' ? 'payments' : 'invoices'
  );

  useEffect(() => {
    if (location.pathname === '/payments') {
      setActiveTab('payments');
    } else if (location.pathname === '/billing') {
      setActiveTab('invoices');
    }
  }, [location.pathname]);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('This Month');

  // Pagination & Modals State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<any>(null);
  const [detailInvoice, setDetailInvoice] = useState<any>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<any>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [quickViewCustomerName, setQuickViewCustomerName] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Queries
  const { data: apiData, isLoading } = useInvoices({
    page,
    limit: 100,
    status: statusFilter || undefined,
  });
  const { data: customerData } = useCustomers({ limit: 100 });
  const customers = Array.isArray(customerData?.items) ? customerData.items : [];

  // Normalize Invoices data or use demo
  const allInvoices = useMemo(() => {
    const items = apiData?.items || [];
    if (items.length > 0) {
      return items.map((inv: any, idx: number) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || `INV-2026-${String(idx + 9701)}`,
        customerName: inv.customer?.name || 'ABC Traders Pvt Ltd',
        customerId: inv.customerId || inv.customer?.id,
        city: inv.customer?.city || 'Coimbatore',
        tripNumber: inv.trip?.tripNumber || inv.trip?.tripCode || `TRP-2026-${String(idx + 23)}`,
        tripRoute: inv.trip ? `${inv.trip.origin} → ${inv.trip.destination}` : 'Chennai → Madurai',
        invoiceDate: inv.invoiceDate || inv.createdAt,
        dueDate: inv.dueDate || '2026-08-25',
        subtotal: Number(inv.subtotal) || Number(inv.grandTotal) * 0.95 || 100000,
        taxTotal: Number(inv.taxTotal) || Number(inv.grandTotal) * 0.05 || 5000,
        grandTotal: Number(inv.grandTotal) || 105000,
        paidAmount: Number(inv.paidAmount || 0),
        balanceDue: Number(inv.balanceDue || inv.grandTotal || 0),
        status: inv.status || 'partially_paid',
        gstRatePercent: Number(inv.gstRatePercent || 5),
        trip: inv.trip,
        customer: inv.customer,
      }));
    }
    return DEFAULT_INVOICES;
  }, [apiData]);

  // Client-side filtering for invoices
  const filteredInvoices = useMemo(() => {
    return allInvoices.filter((inv: any) => {
      if (statusFilter && inv.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (customerFilter && inv.customerName !== customerFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNumber = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchCustomer = inv.customerName?.toLowerCase().includes(q);
        const matchTrip = inv.tripNumber?.toLowerCase().includes(q);
        const matchRoute = inv.tripRoute?.toLowerCase().includes(q);
        if (!matchNumber && !matchCustomer && !matchTrip && !matchRoute) return false;
      }
      return true;
    });
  }, [allInvoices, statusFilter, customerFilter, search]);

  // Payments filtering
  const filteredPayments = useMemo(() => {
    return DEFAULT_PAYMENTS.filter((p) => {
      if (customerFilter && p.customerName !== customerFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = p.paymentId.toLowerCase().includes(q);
        const matchCust = p.customerName.toLowerCase().includes(q);
        const matchInv = p.invoiceNumber.toLowerCase().includes(q);
        const matchRef = p.referenceNumber.toLowerCase().includes(q);
        if (!matchId && !matchCust && !matchInv && !matchRef) return false;
      }
      return true;
    });
  }, [customerFilter, search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCustomerFilter('');
    setDateRangeFilter('This Month');
    setPage(1);
  };

  // Pagination slice
  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));

  // Selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedInvoices.map((inv: any) => inv.id));
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
    const headers = 'Invoice No,Customer,Trip No,Invoice Date,Due Date,Total (Rs),Paid (Rs),Balance (Rs),Status\n';
    const rows = filteredInvoices
      .map(
        (inv: any) =>
          `"${inv.invoiceNumber}","${inv.customerName}","${inv.tripNumber}","${new Date(inv.invoiceDate).toLocaleDateString('en-IN')}","${new Date(inv.dueDate).toLocaleDateString('en-IN')}",${inv.grandTotal},${inv.paidAmount},${inv.balanceDue},"${inv.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Home &gt; Billing &amp; Payments
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            Billing &amp; Payments
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Manage invoices, customer payments and outstanding balances
          </p>
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
                    alert('Generating Excel statement...');
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
                  📊 Export Excel
                </button>
                <button
                  onClick={() => {
                    alert('Generating Invoices PDF Report...');
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

          {/* Record Payment Button */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              setPaymentModalInvoice(null);
              setIsRecordPaymentOpen(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <DollarIcon size={16} /> Record Payment
          </button>

          {/* Create Invoice Primary Button */}
          <button
            className="btn btn-primary"
            id="create-invoice-btn"
            onClick={() => {
              setEditInvoice(null);
              setIsCreateModalOpen(true);
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
            <PlusIcon size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* ── 4 Financial Summary KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
        {/* Card 1: Total Invoiced */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <ReceiptIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Invoiced</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              ₹12,50,000
            </div>
            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>This Month</div>
          </div>
        </div>

        {/* Card 2: Total Received */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Received</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              ₹8,75,000
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>70% Collected</div>
          </div>
        </div>

        {/* Card 3: Outstanding (Noticeable Warning Indicator) */}
        <div className="kpi-card" style={{ padding: '14px', border: '1px solid rgba(249,115,22,0.3)' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <WalletIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Outstanding</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              ₹3,75,000
            </div>
            <div style={{ fontSize: '10px', color: '#f97316', marginTop: '2px' }}>Pending collection</div>
          </div>
        </div>

        {/* Card 4: Overdue Amount */}
        <div className="kpi-card" style={{ padding: '14px', border: '1px solid rgba(239,68,68,0.3)' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertTriangleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Overdue Amount</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
              ₹1,20,000
            </div>
            <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>Crossed due date</div>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher: Invoices vs Payments ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: activeTab === 'invoices' ? '1px solid #f97316' : '1px solid var(--color-border)',
            background: activeTab === 'invoices' ? 'rgba(249,115,22,0.15)' : 'var(--color-surface)',
            color: activeTab === 'invoices' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ReceiptIcon size={16} /> Invoices ({allInvoices.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: activeTab === 'payments' ? '1px solid #f97316' : '1px solid var(--color-border)',
            background: activeTab === 'payments' ? 'rgba(249,115,22,0.15)' : 'var(--color-surface)',
            color: activeTab === 'payments' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <DollarIcon size={16} /> Payments ({DEFAULT_PAYMENTS.length})
        </button>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="card" style={{ padding: '14px', marginBottom: '16px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 260px', minWidth: '220px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              id="invoice-search"
              placeholder={activeTab === 'invoices' ? 'Search by invoice no, customer, trip...' : 'Search payments by ID, customer, UTR...'}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: '12px' }}
            />
          </div>

          {/* Status Dropdown (Invoices only) */}
          {activeTab === 'invoices' && (
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}

          {/* Customer Dropdown */}
          <select
            className="form-select"
            style={{ width: '170px', fontSize: '12px' }}
            value={customerFilter}
            onChange={(e) => {
              setCustomerFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Customers</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Date Range Dropdown */}
          <select
            className="form-select"
            style={{ width: '130px', fontSize: '12px' }}
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 90 Days</option>
            <option>All Time</option>
          </select>

          {/* Reset Filters */}
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
            Reset Filters
          </button>
        </div>

        {/* Bulk Actions Toolbar if multiple selected */}
        {selectedIds.length > 0 && activeTab === 'invoices' && (
          <div style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(249,115,22,0.08)',
            padding: '8px 12px',
            borderRadius: '6px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f97316' }}>
              {selectedIds.length} invoices selected
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Sending ${selectedIds.length} selected invoices via email...`)}
                style={{ fontSize: '11px' }}
              >
                📤 Send Selected
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Downloading ${selectedIds.length} PDF invoices as ZIP...`)}
                style={{ fontSize: '11px' }}
              >
                📄 Download PDFs
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Marking ${selectedIds.length} invoices as Sent...`)}
                style={{ fontSize: '11px' }}
              >
                ✓ Mark as Sent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── TAB 1: INVOICES TABLE ── */}
      {activeTab === 'invoices' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '18px', background: 'var(--color-surface)' }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '1150px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '38px' }}>
                    <input
                      type="checkbox"
                      checked={paginatedInvoices.length > 0 && selectedIds.length === paginatedInvoices.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th style={{ width: '130px' }}>INVOICE NO.</th>
                  <th style={{ width: '190px' }}>CUSTOMER</th>
                  <th style={{ width: '150px' }}>TRIP NO.</th>
                  <th style={{ width: '110px' }}>INVOICE DATE</th>
                  <th style={{ width: '110px' }}>DUE DATE</th>
                  <th style={{ width: '100px' }}>TOTAL (₹)</th>
                  <th style={{ width: '90px' }}>PAID (₹)</th>
                  <th style={{ width: '100px' }}>BALANCE (₹)</th>
                  <th style={{ width: '120px' }}>STATUS</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" />
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">
                        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                          <ReceiptIcon size={38} color="var(--color-text-dim)" />
                        </div>
                        <div className="empty-state-text">No invoices found</div>
                        <div className="empty-state-sub">Create your first invoice from a completed trip.</div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: '10px', background: '#f97316' }}
                          onClick={() => setIsCreateModalOpen(true)}
                        >
                          + Create Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv: any) => {
                    const statusBadge = getInvoiceStatusBadge(inv.status);
                    const isOverdue = inv.status === 'overdue' || (new Date(inv.dueDate) < new Date() && inv.balanceDue > 0);

                    return (
                      <tr key={inv.id}>
                        {/* Select */}
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(inv.id)}
                            onChange={() => handleSelectOne(inv.id)}
                          />
                        </td>

                        {/* Invoice Number */}
                        <td>
                          <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '12px', color: '#f97316' }}>
                            {inv.invoiceNumber}
                          </span>
                        </td>

                        {/* Customer */}
                        <td>
                          <div
                            style={{ fontWeight: 700, fontSize: '12px', cursor: 'pointer', color: 'var(--color-text)' }}
                            onClick={() => setQuickViewCustomerName(inv.customerName)}
                            title="Click to view Customer Balance Snapshot"
                          >
                            {inv.customerName}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                            {inv.city}, TN
                          </div>
                        </td>

                        {/* Trip No. */}
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: '#3b82f6' }}>
                            {inv.tripNumber}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                            {inv.tripRoute}
                          </div>
                        </td>

                        {/* Invoice Date */}
                        <td style={{ fontSize: '12px' }}>
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Due Date */}
                        <td style={{ fontSize: '12px', color: isOverdue ? '#ef4444' : 'inherit', fontWeight: isOverdue ? 700 : 400 }}>
                          {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Total */}
                        <td style={{ fontWeight: 800, fontSize: '12px' }}>
                          ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                        </td>

                        {/* Paid */}
                        <td style={{ color: '#22c55e', fontWeight: 600, fontSize: '12px' }}>
                          ₹{Number(inv.paidAmount).toLocaleString('en-IN')}
                        </td>

                        {/* Balance */}
                        <td style={{ fontWeight: 800, fontSize: '12px', color: inv.balanceDue > 0 ? '#f87171' : '#22c55e' }}>
                          ₹{Number(inv.balanceDue).toLocaleString('en-IN')}
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
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
                              title="View Invoice & Timeline"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 6px' }}
                              onClick={() => setDetailInvoice(inv)}
                            >
                              <EyeIcon size={14} />
                            </button>
                            {inv.balanceDue > 0 && (
                              <button
                                title="Record Payment"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 6px', color: '#22c55e' }}
                                onClick={() => {
                                  setPaymentModalInvoice(inv);
                                  setIsRecordPaymentOpen(true);
                                }}
                              >
                                <DollarIcon size={14} />
                              </button>
                            )}
                            <button
                              title="Download PDF"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 6px' }}
                              onClick={() => alert(`Downloading PDF for ${inv.invoiceNumber}...`)}
                            >
                              <DownloadIcon size={14} />
                            </button>
                            <button
                              title="More Options"
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 6px' }}
                              onClick={() => setDetailInvoice(inv)}
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

          {/* Table Footer & Pagination */}
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
              Showing 1 to {paginatedInvoices.length} of {filteredInvoices.length} invoices
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
      )}

      {/* ── TAB 2: PAYMENTS TABLE ── */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '18px', background: 'var(--color-surface)' }}>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '950px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '130px' }}>PAYMENT ID</th>
                  <th style={{ width: '200px' }}>CUSTOMER</th>
                  <th style={{ width: '140px' }}>INVOICE REF</th>
                  <th style={{ width: '120px' }}>DATE</th>
                  <th style={{ width: '120px' }}>AMOUNT (₹)</th>
                  <th style={{ width: '140px' }}>PAYMENT MODE</th>
                  <th style={{ width: '160px' }}>REFERENCE / UTR</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const modeBadge = getPaymentModeBadge(p.paymentMethod);
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#22c55e' }}>{p.paymentId}</td>
                      <td style={{ fontWeight: 600 }}>{p.customerName}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f97316' }}>{p.invoiceNumber}</td>
                      <td>{new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ fontWeight: 800, color: '#22c55e' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: modeBadge.bg,
                            color: modeBadge.color,
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          {modeBadge.label}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{p.referenceNumber}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => alert(`Downloading payment receipt for ${p.paymentId}...`)}
                          title="Download Receipt"
                        >
                          <DownloadIcon size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Bottom Analytics: Payment Aging & Collections ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* Panel 1: Payment Aging (Requirement 10) */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              Outstanding Payment Aging
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Overdue analysis</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>0–30 Days (Current)</span>
                <span style={{ fontWeight: 700, color: '#22c55e' }}>₹1,50,000 (50%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '50%', height: '100%', background: '#22c55e', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>31–60 Days</span>
                <span style={{ fontWeight: 700, color: '#eab308' }}>₹80,000 (27%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '27%', height: '100%', background: '#eab308', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>61–90 Days</span>
                <span style={{ fontWeight: 700, color: '#f97316' }}>₹45,000 (15%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '15%', height: '100%', background: '#f97316', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span>90+ Days (Critical)</span>
                <span style={{ fontWeight: 700, color: '#ef4444' }}>₹25,000 (8%)</span>
              </div>
              <div style={{ width: '100%', height: '5px', background: 'var(--color-surface2)', borderRadius: '3px' }}>
                <div style={{ width: '8%', height: '100%', background: '#ef4444', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Collections by Payment Mode */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Collections by Payment Channel
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="var(--color-surface2)" strokeWidth="4" />
                {/* Bank Transfer (50%) - Blue */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="44 44" strokeDashoffset="22" />
                {/* UPI (35%) - Purple */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#a855f7" strokeWidth="4" strokeDasharray="30.8 57.2" strokeDashoffset="-22" />
                {/* Cash (10%) - Yellow */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#eab308" strokeWidth="4" strokeDasharray="8.8 79.2" strokeDashoffset="-52.8" />
                {/* Cheque (5%) - Green */}
                <circle cx="18" cy="18" r="14" fill="transparent" stroke="#22c55e" strokeWidth="4" strokeDasharray="4.4 83.6" strokeDashoffset="-61.6" />
              </svg>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#3b82f6' }}>●</span> Bank Transfer</span>
                <span style={{ fontWeight: 700 }}>50% (₹4,37,500)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#a855f7' }}>●</span> UPI</span>
                <span style={{ fontWeight: 700 }}>35% (₹3,06,250)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#eab308' }}>●</span> Cash</span>
                <span style={{ fontWeight: 700 }}>10% (₹87,500)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><span style={{ color: '#22c55e' }}>●</span> Cheque</span>
                <span style={{ fontWeight: 700 }}>5% (₹43,750)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Top Customers by Outstanding */}
        <div className="card" style={{ padding: '16px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px' }}>
            Top Customers by Pending Balance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            {[
              { name: 'ABC Traders Pvt Ltd', cost: '₹1,20,000', color: '#ef4444' },
              { name: 'South India Logistics', cost: '₹1,00,000', color: '#f97316' },
              { name: 'Sri Balaji Enterprises', cost: '₹90,000', color: '#eab308' },
              { name: 'Chennai Auto Parts Co', cost: '₹75,000', color: '#3b82f6' },
            ].map((c) => (
              <div
                key={c.name}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: 'var(--color-surface2)', borderRadius: '6px', cursor: 'pointer' }}
                onClick={() => setQuickViewCustomerName(c.name)}
              >
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontWeight: 800, color: c.color }}>{c.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Create / Edit Invoice Modal ── */}
      {isCreateModalOpen && (
        <CreateInvoiceModal
          editInvoice={editInvoice}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditInvoice(null);
          }}
        />
      )}

      {/* ── View Invoice Details & Payment Timeline Modal ── */}
      {detailInvoice && (
        <InvoiceDetailModal
          invoice={detailInvoice}
          onClose={() => setDetailInvoice(null)}
          onRecordPayment={(inv) => {
            setPaymentModalInvoice(inv);
            setIsRecordPaymentOpen(true);
          }}
          onEdit={(inv) => {
            setDetailInvoice(null);
            setEditInvoice(inv);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {/* ── Record Payment Modal ── */}
      {isRecordPaymentOpen && (
        <RecordPaymentModal
          invoice={paymentModalInvoice}
          onClose={() => {
            setIsRecordPaymentOpen(false);
            setPaymentModalInvoice(null);
          }}
        />
      )}

      {/* ── Customer Quick View Snapshot ── */}
      {quickViewCustomerName && (
        <CustomerQuickViewModal
          customerName={quickViewCustomerName}
          onClose={() => setQuickViewCustomerName(null)}
        />
      )}
    </div>
  );
}
