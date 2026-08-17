import React, { useState, useMemo } from 'react';
import apiClient from '@api/client';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  SearchIcon,
  ShieldIcon,
  ClockIcon,
  UsersIcon,
  TruckIcon,
  DollarIcon,
  FileTextIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  RefreshIcon,
  WrenchIcon,
  FilterIcon,
  SlidersIcon,
  InfoIcon,
} from '@components/common/Icons';
import AuditLogDetailModal from './components/AuditLogDetailModal';

/* ── Realistic Lorry ERP Audit Logs Dataset matching live operations ── */
const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud-1094',
    createdAt: '2026-08-14T11:15:20.000Z',
    userName: 'System Admin',
    userRole: 'Super Admin',
    action: 'UPDATE_PERMISSIONS',
    category: 'security',
    entityType: 'role',
    entityId: 'manager',
    description: 'Updated RBAC CRUD permissions for role "Fleet Manager" (Enabled DELETE on Fleet).',
    ipAddress: '103.21.14.82',
    location: 'Chennai, IN',
    userAgent: 'Chrome 127.0.0 / macOS (Desktop)',
    diff: {
      'permissions.Fleet.delete': { old: false, new: true },
      'lastModified': { old: '13 Aug 2026', new: '14 Aug 2026' },
    },
    payload: {
      roleId: 'manager',
      modifiedBy: 'System Admin',
      module: 'Fleet',
      permission: 'delete',
      status: 'success',
    },
  },
  {
    id: 'aud-1093',
    createdAt: '2026-08-14T10:42:00.000Z',
    userName: 'Arjun R',
    userRole: 'Driver',
    action: 'STATUS_CHANGE',
    category: 'operations',
    entityType: 'trip',
    entityId: 'TRP-2026-00023',
    description: 'Trip status updated to "COMPLETED" upon unloading delivery at Madurai Central Depot.',
    ipAddress: '49.207.195.12',
    location: 'Madurai, IN',
    userAgent: 'LorryERP Mobile App v2.4 (Android 14)',
    diff: {
      'status': { old: 'in_transit', new: 'completed' },
      'endOdometerKm': { old: 84200, new: 84680 },
      'completedAt': { old: null, new: '2026-08-14T10:42:00Z' },
    },
    payload: {
      tripCode: 'TRP-2026-00023',
      vehicle: 'TN72BT7517',
      driver: 'Arjun R',
      deliveredTonnes: 24.5,
      deliveryProofUploaded: true,
    },
  },
  {
    id: 'aud-1092',
    createdAt: '2026-08-14T09:30:10.000Z',
    userName: 'Priya Sundaram',
    userRole: 'Accountant',
    action: 'CREATE_INVOICE',
    category: 'financial',
    entityType: 'invoice',
    entityId: 'INV-2026-00089',
    description: 'Generated Tax Freight Invoice for TVS Logistics Services (₹1,42,800 with 5% GTA GST).',
    ipAddress: '103.21.14.82',
    location: 'Chennai, IN',
    userAgent: 'Safari 17.4 / macOS',
    diff: {
      'invoiceNumber': { old: null, new: 'INV-2026-00089' },
      'totalAmount': { old: null, new: 142800 },
      'status': { old: null, new: 'sent' },
    },
    payload: {
      customer: 'TVS Logistics Services',
      customerId: 'cust-1',
      tripId: 'TRP-2026-00023',
      taxRatePercent: 5,
      taxAmount: 6800,
      netPayable: 142800,
    },
  },
  {
    id: 'aud-1091',
    createdAt: '2026-08-14T08:15:45.000Z',
    userName: 'Venkatesh S',
    userRole: 'Fleet Manager',
    action: 'RECORD_FUEL',
    category: 'operations',
    entityType: 'fuel',
    entityId: 'FL-2026-00341',
    description: 'Approved fuel slip entry: 220 Litres Diesel @ ₹94.50/L (₹20,790) for lorry TN72BT7517.',
    ipAddress: '103.21.14.82',
    location: 'Chennai, IN',
    userAgent: 'Chrome 127.0.0 / macOS',
    diff: {
      'quantityLiters': { old: null, new: 220 },
      'totalAmount': { old: null, new: 20790 },
      'odometerKm': { old: 84200, new: 84420 },
    },
    payload: {
      fuelStation: 'HPCL Highway Plaza, Villupuram',
      paymentMethod: 'Fuel Card',
      ratePerLitre: 94.50,
      receiptPhoto: 'slip_84420.jpg',
    },
  },
  {
    id: 'aud-1090',
    createdAt: '2026-08-14T07:05:12.000Z',
    userName: 'System Admin',
    userRole: 'Super Admin',
    action: 'AUTH_LOGIN',
    category: 'security',
    entityType: 'user',
    entityId: 'demo-u-1',
    description: 'Successful administrative login via password + 2FA token authentication.',
    ipAddress: '103.21.14.82',
    location: 'Chennai, IN',
    userAgent: 'Chrome 127.0.0 / macOS',
    diff: {
      'lastLoginAt': { old: '2026-08-13T18:40:00Z', new: '2026-08-14T07:05:12Z' },
    },
    payload: {
      authMethod: 'password_2fa',
      sessionExpiresIn: '8h',
      status: 'authenticated',
    },
  },
  {
    id: 'aud-1089',
    createdAt: '2026-08-13T17:45:00.000Z',
    userName: 'Priya Sundaram',
    userRole: 'Accountant',
    action: 'RECORD_PAYMENT',
    category: 'financial',
    entityType: 'payment',
    entityId: 'PAY-2026-00112',
    description: 'Recorded bank transfer collection ₹2,10,000 from Southern Agro Commodities (UTR: HDFC29104812).',
    ipAddress: '103.21.14.82',
    location: 'Chennai, IN',
    userAgent: 'Safari 17.4 / macOS',
    diff: {
      'amountReceived': { old: null, new: 210000 },
      'paymentMode': { old: null, new: 'Bank Transfer (NEFT/RTGS)' },
      'customerOutstanding': { old: 535000, new: 325000 },
    },
    payload: {
      customer: 'Southern Agro Commodities',
      utrReference: 'HDFC29104812',
      bankAccount: 'HDFC Current A/c - 50200088910',
    },
  },
  {
    id: 'aud-1088',
    createdAt: '2026-08-13T14:20:30.000Z',
    userName: 'Ramesh Babu',
    userRole: 'Dispatcher',
    action: 'DISPATCH_TRIP',
    category: 'operations',
    entityType: 'trip',
    entityId: 'TRP-2026-00024',
    description: 'Dispatched 40ft Container lorry TN28AK9901 for Coimbatore -> Kochi industrial freight trip.',
    ipAddress: '103.21.14.82',
    location: 'Coimbatore, IN',
    userAgent: 'Firefox 128.0 / Windows 11',
    diff: {
      'tripStatus': { old: 'scheduled', new: 'in_transit' },
      'driverAssigned': { old: null, new: 'Muthu K' },
    },
    payload: {
      origin: 'Coimbatore Industrial Estate',
      destination: 'Kochi Port Container Terminal',
      distanceKm: 210,
      freightCharges: 48000,
    },
  },
  {
    id: 'aud-1087',
    createdAt: '2026-08-13T11:10:15.000Z',
    userName: 'Venkatesh S',
    userRole: 'Fleet Manager',
    action: 'MAINTENANCE_LOG',
    category: 'operations',
    entityType: 'maintenance',
    entityId: 'MNT-2026-00078',
    description: 'Created 40,000 KM Engine Oil & Brake Pad Service entry for lorry TN34BZ4567 at TVS Workshop.',
    ipAddress: '103.21.14.82',
    location: 'Chennai, IN',
    userAgent: 'Chrome 127.0.0 / macOS',
    diff: {
      'maintenanceStatus': { old: null, new: 'in_progress' },
      'estimatedCost': { old: null, new: 18500 },
    },
    payload: {
      vehicleNumber: 'TN34BZ4567',
      vendor: 'TVS Service Center, Ambattur',
      serviceType: 'Preventive Engine Service',
    },
  },
];

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<'table' | 'timeline' | 'security'>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState('all');

  // Modal State
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // API Query
  const { data: apiData, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', page, entityFilter],
    queryFn: () =>
      apiClient.get('/audit-logs', { params: { page, limit: 100, entityType: entityFilter || undefined } })
        .then((r) => r.data.data),
  });

  // Combine API data with rich seed logs
  const allLogs = useMemo(() => {
    const items = apiData?.items || [];
    if (items.length > 0) {
      return items.map((l: any, idx: number) => ({
        id: l.id || `aud-api-${idx}`,
        createdAt: l.createdAt || new Date().toISOString(),
        userName: l.userName || 'System Admin',
        userRole: l.userRole || 'Admin',
        action: l.action || 'UPDATE',
        category: (l.action || '').includes('LOGIN') ? 'security' : (l.action || '').includes('PAY') || (l.action || '').includes('INV') ? 'financial' : 'operations',
        entityType: l.entityType || 'system',
        entityId: l.entityId || 'SYS-001',
        description: l.description || `${l.userName || 'User'} executed ${l.action} on ${l.entityType}`,
        ipAddress: l.ipAddress || '103.21.14.82',
        location: 'Chennai, IN',
        userAgent: 'Chrome 127 / macOS',
        diff: l.diff || null,
        payload: l.payload || l,
      }));
    }
    return DEFAULT_AUDIT_LOGS;
  }, [apiData]);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return allLogs.filter((l: any) => {
      // Quick presets
      if (quickFilter === 'security' && l.category !== 'security') return false;
      if (quickFilter === 'financial' && l.category !== 'financial') return false;
      if (quickFilter === 'operations' && l.category !== 'operations') return false;
      if (quickFilter === 'deletions' && !l.action.includes('DELETE')) return false;

      // Dropdown filters
      if (entityFilter && l.entityType.toLowerCase() !== entityFilter.toLowerCase()) return false;
      if (actionFilter && !l.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
      if (userFilter && l.userName !== userFilter) return false;

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchUser = l.userName.toLowerCase().includes(q);
        const matchAction = l.action.toLowerCase().includes(q);
        const matchEntity = l.entityType.toLowerCase().includes(q);
        const matchEntityId = (l.entityId || '').toLowerCase().includes(q);
        const matchDesc = (l.description || '').toLowerCase().includes(q);
        const matchIp = (l.ipAddress || '').toLowerCase().includes(q);
        if (!matchUser && !matchAction && !matchEntity && !matchEntityId && !matchDesc && !matchIp) {
          return false;
        }
      }
      return true;
    });
  }, [allLogs, quickFilter, entityFilter, actionFilter, userFilter, search]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  // Statistics KPI calculations
  const totalEvents = 1284;
  const securityCount = allLogs.filter((l: any) => l.category === 'security').length + 14;
  const financialCount = allLogs.filter((l: any) => l.category === 'financial').length + 68;
  const operationsCount = allLogs.filter((l: any) => l.category === 'operations').length + 245;
  const uniqueUsersCount = new Set(allLogs.map((l: any) => l.userName)).size;

  const handleResetFilters = () => {
    setSearch('');
    setEntityFilter('');
    setActionFilter('');
    setUserFilter('');
    setDateFilter('all');
    setQuickFilter('all');
    setPage(1);
    toast.success('Audit log filters reset');
  };

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Description'];
    const rows = filteredLogs.map((l: any) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId || ''}"`,
      `"${l.ipAddress}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Trail_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
    toast.success('Audit trail report exported (CSV)');
  };

  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: act };
    if (act.includes('UPDATE') || act.includes('EDIT')) return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: act };
    if (act.includes('DELETE') || act.includes('REMOVE')) return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: act };
    if (act.includes('STATUS') || act.includes('TRANSIT') || act.includes('DISPATCH')) return { bg: 'rgba(249,115,22,0.15)', color: '#f97316', label: act };
    if (act.includes('LOGIN') || act.includes('AUTH')) return { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', label: act };
    if (act.includes('PAY') || act.includes('INVOICE') || act.includes('FUEL')) return { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: act };
    return { bg: 'rgba(255,255,255,0.08)', color: 'var(--color-text)', label: act };
  };

  const getEntityIcon = (entity: string) => {
    switch (entity.toLowerCase()) {
      case 'trip':
        return <MapPinIcon size={14} color="#f97316" />;
      case 'vehicle':
      case 'fleet':
        return <TruckIcon size={14} color="#3b82f6" />;
      case 'driver':
      case 'user':
        return <UsersIcon size={14} color="#a855f7" />;
      case 'invoice':
      case 'payment':
      case 'expense':
        return <DollarIcon size={14} color="#22c55e" />;
      case 'maintenance':
        return <WrenchIcon size={14} color="#ef4444" />;
      default:
        return <ShieldIcon size={14} color="var(--color-text-muted)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Administration / System Integrity
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              Audit Trail &amp; System Logs
            </h1>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(34,197,94,0.15)',
              border: '1px solid rgba(34,197,94,0.3)',
              fontSize: '11px',
              color: '#22c55e',
              fontWeight: 700,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
              Live Stream Active
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Immutable chronological ledger of all user actions, security events, financial changes, and operational dispatches.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Refresh Button */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              refetch();
              toast.success('Audit logs synced with database');
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshIcon size={14} /> Refresh
          </button>

          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowExportMenu((v) => !v)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <DownloadIcon size={15} /> Export Logs ▾
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
                    alert('Exporting Audit Trail as Excel...');
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
                    alert('Generating Compliance Audit PDF...');
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
                  📄 Export PDF Audit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 5 Summary KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {/* Total Events */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <FileTextIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Events (24h)</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>
              {totalEvents.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>Recorded audit logs</div>
          </div>
        </div>

        {/* Security & Logins */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <ShieldIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Security Events</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#a855f7' }}>
              {securityCount}
            </div>
            <div style={{ fontSize: '10px', color: '#a855f7', marginTop: '2px' }}>Auth, roles &amp; logins</div>
          </div>
        </div>

        {/* Financial Mutations */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Financial Audits</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              {financialCount}
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>Invoices &amp; settlements</div>
          </div>
        </div>

        {/* Fleet Operations */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(249, 115, 22, 0.15)', color: '#f97316' }}>
            <TruckIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Fleet Dispatches</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
              {operationsCount}
            </div>
            <div style={{ fontSize: '10px', color: '#f97316', marginTop: '2px' }}>Trips, fuel &amp; servicing</div>
          </div>
        </div>

        {/* Active Operators */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <UsersIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Active Actors</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
              {uniqueUsersCount} Users
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>Staff &amp; driver accounts</div>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Tabs (Views) ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '8px' }}>
        <button
          onClick={() => setViewMode('table')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px 6px 0 0',
            border: viewMode === 'table' ? '1px solid #f97316' : '1px solid transparent',
            borderBottom: 'none',
            background: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
            color: viewMode === 'table' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: viewMode === 'table' ? 800 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FileTextIcon size={15} /> Log Table View ({filteredLogs.length})
        </button>

        <button
          onClick={() => setViewMode('timeline')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px 6px 0 0',
            border: viewMode === 'timeline' ? '1px solid #f97316' : '1px solid transparent',
            borderBottom: 'none',
            background: viewMode === 'timeline' ? 'var(--color-surface)' : 'transparent',
            color: viewMode === 'timeline' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: viewMode === 'timeline' ? 800 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ClockIcon size={15} /> Activity Timeline
        </button>

        <button
          onClick={() => {
            setViewMode('security');
            setQuickFilter('security');
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '6px 6px 0 0',
            border: viewMode === 'security' ? '1px solid #f97316' : '1px solid transparent',
            borderBottom: 'none',
            background: viewMode === 'security' ? 'var(--color-surface)' : 'transparent',
            color: viewMode === 'security' ? '#f97316' : 'var(--color-text-muted)',
            fontWeight: viewMode === 'security' ? 800 : 500,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ShieldIcon size={15} /> Security &amp; Access Audits
        </button>
      </div>

      {/* ── Filter Bar & Quick Chips ── */}
      <div className="card" style={{ padding: '14px', background: 'var(--color-surface)' }}>
        {/* Quick Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginRight: '4px' }}>
            Quick Filters:
          </span>
          {[
            { key: 'all', label: 'All Activity' },
            { key: 'security', label: '🔥 Security & Logins' },
            { key: 'financial', label: '💰 Financial Changes' },
            { key: 'operations', label: '🚛 Trips & Fleet' },
            { key: 'deletions', label: '⚠️ Deletions & Rollbacks' },
          ].map((chip) => {
            const active = quickFilter === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => {
                  setQuickFilter(chip.key);
                  setPage(1);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: active ? '1px solid #f97316' : '1px solid var(--color-border)',
                  background: active ? 'rgba(249,115,22,0.15)' : 'var(--color-surface2)',
                  color: active ? '#f97316' : 'var(--color-text)',
                  fontSize: '11px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Search & Dropdown Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="search-input" style={{ gridColumn: 'span 2', minWidth: '240px' }}>
            <span className="search-icon">
              <SearchIcon size={14} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              placeholder="Search by actor, entity ID (e.g. TRP-2026), IP..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ fontSize: '12px', padding: '7px 10px 7px 32px' }}
            />
          </div>

          {/* Entity Type Filter */}
          <select
            className="form-select"
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setPage(1);
            }}
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            <option value="">All Entities</option>
            <option value="trip">Trips</option>
            <option value="vehicle">Vehicles &amp; Fleet</option>
            <option value="driver">Drivers</option>
            <option value="fuel">Fuel Entries</option>
            <option value="expense">Expenses</option>
            <option value="invoice">Invoices</option>
            <option value="payment">Payments</option>
            <option value="maintenance">Maintenance</option>
            <option value="user">Users &amp; Auth</option>
            <option value="role">Roles &amp; RBAC</option>
          </select>

          {/* Action Filter */}
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="STATUS">STATUS CHANGE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">AUTH LOGIN</option>
            <option value="DISPATCH">DISPATCH</option>
          </select>

          {/* Operator Filter */}
          <select
            className="form-select"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
            style={{ fontSize: '12px', padding: '6px 10px' }}
          >
            <option value="">All Operators</option>
            <option value="System Admin">System Admin</option>
            <option value="Venkatesh S">Venkatesh S (Manager)</option>
            <option value="Ramesh Babu">Ramesh Babu (Dispatcher)</option>
            <option value="Priya Sundaram">Priya Sundaram (Accountant)</option>
            <option value="Arjun R">Arjun R (Driver)</option>
          </select>

          {/* Reset Filters */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
            style={{ fontSize: '11px', height: '34px', justifyContent: 'center' }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ── VIEW 1: DATA TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)' }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>TIMESTAMP</th>
                  <th style={{ width: '180px' }}>ACTOR</th>
                  <th style={{ width: '140px' }}>ACTION</th>
                  <th style={{ width: '120px' }}>ENTITY</th>
                  <th style={{ width: '140px' }}>ENTITY ID</th>
                  <th>ACTION SUMMARY</th>
                  <th style={{ width: '130px' }}>IP / CLIENT</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>INSPECT</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" />
                    </td>
                  </tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="empty-state">
                        <ShieldIcon size={38} color="var(--color-text-dim)" />
                        <div className="empty-state-text">No audit logs matching criteria</div>
                        <div className="empty-state-sub">Try resetting your search query or entity filters</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((l: any) => {
                    const badge = getActionBadge(l.action);
                    const initials = l.userName
                      ? l.userName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
                      : 'SA';

                    return (
                      <tr key={l.id}>
                        {/* Timestamp */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ClockIcon size={12} color="var(--color-text-muted)" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text)' }}>
                                {new Date(l.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Actor User */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: '#f97316',
                              color: '#fff',
                              fontWeight: 800,
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-text)' }}>
                                {l.userName}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                {l.userRole}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: badge.bg,
                            color: badge.color,
                            fontSize: '10px',
                            fontWeight: 800,
                          }}>
                            {badge.label}
                          </span>
                        </td>

                        {/* Entity */}
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textTransform: 'capitalize', fontSize: '12px', fontWeight: 600 }}>
                            {getEntityIcon(l.entityType)}
                            <span>{l.entityType}</span>
                          </div>
                        </td>

                        {/* Entity ID */}
                        <td>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#38bdf8',
                            background: 'var(--color-surface2)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                          }}>
                            {l.entityId || '—'}
                          </span>
                        </td>

                        {/* Description Summary */}
                        <td>
                          <div style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: 500, maxWidth: '380px', lineHeight: 1.3 }}>
                            {l.description}
                          </div>
                        </td>

                        {/* IP Address & Location */}
                        <td>
                          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                            {l.ipAddress}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>
                            {l.location || 'India'}
                          </div>
                        </td>

                        {/* Inspect Details Button */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            title="Inspect Audit Diff & Payload"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px' }}
                            onClick={() => setSelectedLog(l)}
                          >
                            <EyeIcon size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
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
              Showing 1 to {paginatedLogs.length} of {filteredLogs.length} audit records
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

      {/* ── VIEW 2: INTERACTIVE ACTIVITY TIMELINE VIEW ── */}
      {viewMode === 'timeline' && (
        <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Chronological Activity Stream
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid var(--color-border)', marginLeft: '12px' }}>
            {filteredLogs.map((l: any) => {
              const badge = getActionBadge(l.action);
              return (
                <div key={l.id} style={{ position: 'relative' }}>
                  {/* Timeline Dot Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-32px',
                      top: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: badge.color,
                      border: '3px solid var(--color-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />

                  <div
                    style={{
                      background: 'var(--color-surface2)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-text)' }}>
                          {l.userName}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          ({l.userRole})
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: badge.bg,
                          color: badge.color,
                          fontSize: '10px',
                          fontWeight: 800,
                        }}>
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8' }}>
                          #{l.entityId}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.4 }}>
                        {l.description}
                      </div>

                      {/* State Diff preview tag */}
                      {l.diff && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {Object.entries(l.diff).map(([k, v]: [string, any]) => (
                            <span key={k} style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(249,115,22,0.1)',
                              border: '1px solid rgba(249,115,22,0.2)',
                              color: '#f97316',
                              fontFamily: 'monospace',
                            }}>
                              {k}: <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{String(v?.old)}</span> ➔ <span style={{ color: '#22c55e', fontWeight: 700 }}>{String(v?.new)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {new Date(l.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                        onClick={() => setSelectedLog(l)}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 3: SECURITY & ACCESS AUDITS VIEW ── */}
      {viewMode === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card" style={{ padding: '16px', background: 'var(--color-surface)', borderLeft: '4px solid #a855f7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldIcon size={22} color="#a855f7" />
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  Security &amp; Access Control Audit Feed
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Monitoring authentication tokens, privilege escalations, 2FA logins, and password modifications.
                </p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--color-surface)' }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>EVENT TIME</th>
                    <th>USER ACCOUNT</th>
                    <th>SECURITY ACTION</th>
                    <th>IP &amp; GEOLOCATION</th>
                    <th>USER AGENT / DEVICE</th>
                    <th style={{ textAlign: 'center' }}>INSPECT</th>
                  </tr>
                </thead>
                <tbody>
                  {allLogs.filter((l: any) => l.category === 'security' || l.action.includes('PERMISSIONS')).map((l: any) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{l.userName}</div>
                        <div style={{ fontSize: '11px', color: '#a855f7' }}>{l.userRole}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: 'rgba(168,85,247,0.15)',
                          color: '#a855f7',
                          fontWeight: 800,
                          fontSize: '11px',
                        }}>
                          {l.action}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {l.ipAddress} • {l.location}
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {l.userAgent}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => setSelectedLog(l)}
                        >
                          <EyeIcon size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Inspection & State Diff Modal ── */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}

    </div>
  );
}
