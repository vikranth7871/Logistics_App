import { useState, useEffect } from 'react';
import {
  useFuelEntries,
  useVehicles,
  useDrivers,
  useTrips,
  useCreateFuelEntry,
  useDeleteFuelEntry,
} from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  PlusIcon, SearchIcon, FuelIcon, ChevronLeftIcon, ChevronRightIcon,
  DownloadIcon, CalendarIcon, FilterIcon, PaperclipIcon, BarChartIcon,
  TrendingUpIcon, AlertTriangleIcon, TruckIcon, DollarIcon, EyeIcon,
  TrashIcon, EditIcon, XIcon, CheckIcon,
} from '@components/common/Icons';
import FuelFormModal from './components/FuelFormModal';

/* ── Static demo data ─────────────────────────────────────────────────── */
const DEMO: any[] = [
  { id: 'd1', date: '2026-08-12T16:30:00Z', vehicleReg: 'TN72BT7517', vehicleModel: 'Tata Ace (2022)',         location: 'IOCL Bunk, NH-44',      fuelType: 'Diesel', qty: 120.0, rate: 96.5,  amount: 11580, odo: 48250,  mileage: 3.92, cperKm: 24.62, payment: 'Fuel Card',     receipt: true,  anomaly: false },
  { id: 'd2', date: '2026-08-11T09:15:00Z', vehicleReg: 'TN01AB2345', vehicleModel: 'Tata LPT 3118 (2020)',   location: 'HPCL, Salem Bypass',     fuelType: 'Diesel', qty: 180.0, rate: 96.2,  amount: 17316, odo: 62100,  mileage: 3.65, cperKm: 26.35, payment: 'Corporate UPI', receipt: true,  anomaly: false },
  { id: 'd3', date: '2026-08-10T14:20:00Z', vehicleReg: 'TN06MN4567', vehicleModel: 'Volvo FH 440 (2020)',    location: 'BPCL Plaza, NH-48',      fuelType: 'Diesel', qty: 250.0, rate: 96.8,  amount: 24200, odo: 112000, mileage: 2.10, cperKm: 46.09, payment: 'Fuel Card',     receipt: false, anomaly: true,  anomalyReason: 'Unusually high qty & low mileage (2.10 km/L)' },
  { id: 'd4', date: '2026-08-09T18:45:00Z', vehicleReg: 'TN01CD3456', vehicleModel: 'Ashok Leyland Captain', location: 'Shell Express, Madurai',  fuelType: 'Diesel', qty: 150.0, rate: 97.1,  amount: 14565, odo: 28900,  mileage: 4.15, cperKm: 23.40, payment: 'Cash',          receipt: true,  anomaly: false },
  { id: 'd5', date: '2026-08-08T11:10:00Z', vehicleReg: 'TN04IJ9012', vehicleModel: 'BharatBenz 4228R',      location: 'Reliance Petro, Hosur',  fuelType: 'Diesel', qty: 210.0, rate: 96.4,  amount: 20244, odo: 38700,  mileage: 1.85, cperKm: 52.10, payment: 'Fuel Card',     receipt: false, anomaly: true,  anomalyReason: 'Abnormally low mileage (1.85 km/L) — suspicious drop' },
  { id: 'd6', date: '2026-08-07T07:00:00Z', vehicleReg: 'TN03GH7890', vehicleModel: 'Eicher Pro 6035',       location: 'IOCL, Trichy Bypass',    fuelType: 'Diesel', qty: 160.0, rate: 96.1,  amount: 15376, odo: 19800,  mileage: 3.78, cperKm: 25.42, payment: 'Corporate UPI', receipt: true,  anomaly: false },
  { id: 'd7', date: '2026-08-06T15:30:00Z', vehicleReg: 'TN02EF5678', vehicleModel: 'Mahindra Blazo X 35',   location: 'HPCL Pump, Coimbatore',  fuelType: 'Diesel', qty: 200.0, rate: 96.7,  amount: 19340, odo: 41200,  mileage: 3.55, cperKm: 27.24, payment: 'Fuel Card',     receipt: true,  anomaly: false },
];

/* ── Bar chart component ───────────────────────────────────────────────── */
const MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const MONTHLY_SPEND  = [98000, 112000, 125000, 118000, 142000, 102621];
const MONTHLY_VOLUME = [1020,  1160,   1300,   1220,   1480,   1070];

function BarChart({ data, color, label, fmt }: { data: number[]; color: string; label: string; fmt: (n: number) => string }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '10px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '9px', color: 'var(--color-text-dim)', fontWeight: 600 }}>{fmt(v)}</div>
            <div style={{ width: '100%', background: color, borderRadius: '4px 4px 0 0', height: `${(v / max) * 85}%`, minHeight: '4px', transition: 'height 0.4s ease' }} />
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let cum = 0;
  const segs = slices.map(s => {
    const pct = (s.value / total) * 100;
    const seg = { ...s, pct, start: cum };
    cum += pct;
    return seg;
  });
  const gradient = segs.map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`).join(', ');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: `conic-gradient(${gradient})`, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {segs.map(s => (
          <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span><span style={{ color: s.color }}>●</span> {s.label}</span>
            <span style={{ fontWeight: 700 }}>{s.pct.toFixed(0)}% (₹{s.value.toLocaleString()})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Confirm delete dialog ────────────────────────────────────────────── */
function ConfirmDeleteModal({ reg, onClose, onConfirm }: { reg: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangleIcon size={18} color="#ef4444" />
            <span className="modal-title">Delete Fuel Entry</span>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <div className="modal-body" style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Are you sure you want to delete the fuel entry for <strong style={{ color: 'var(--color-text)' }}>{reg}</strong>? This cannot be undone.
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ background: '#ef4444' }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function FuelPage() {
  const { user } = useAuthStore();
  const isAdmin   = user?.role === 'admin';
  const canManage = ['admin', 'manager'].includes(user?.role || '');

  const [activeTab, setActiveTab] = useState<'log' | 'analytics' | 'efficiency' | 'anomalies'>('log');
  const [search,         setSearch]  = useState('');
  const [vehicleFilter,  setVF]      = useState('');
  const [fuelTypeFilter, setFTF]     = useState('');
  const [paymentFilter,  setPF]      = useState('');
  const [startDate,      setSD]      = useState('');
  const [endDate,        setED]      = useState('');
  const [qtyMin,         setQMin]    = useState('');
  const [qtyMax,         setQMax]    = useState('');
  const [amtMin,         setAMin]    = useState('');
  const [amtMax,         setAMax]    = useState('');
  const [showMoreFilters, setSMF]    = useState(false);
  const [page,           setPage]    = useState(1);
  const PAGE_SIZE = 10;

  const [showForm,       setShowForm]   = useState(false);
  const [editEntry,      setEditEntry]  = useState<any>(null);
  const [deleteTarget,   setDT]         = useState<{ id: string; reg: string } | null>(null);
  const [viewReceipt,    setVR]         = useState<any>(null);

  const { data: fuelData, isLoading } = useFuelEntries({ limit: 200 });
  const { data: vehicleData }         = useVehicles({ limit: 100 });
  const deleteMut                     = useDeleteFuelEntry();

  const vehiclesList: any[] = vehicleData?.items ?? [];

  /* normalise */
  const fetched: any[] = (fuelData?.items ?? fuelData ?? []) as any[];
  const allEntries: any[] = fetched.length > 0
    ? fetched.map((e: any) => ({
        id: e.id,
        date:         e.date ?? new Date().toISOString(),
        vehicleReg:   e.vehicle?.registrationNumber ?? 'TN72BT7517',
        vehicleModel: [e.vehicle?.make, e.vehicle?.model].filter(Boolean).join(' ') || 'Tata Ace',
        location:     e.location ?? 'IOCL Bunk, NH-44',
        fuelType:     e.fuelType ? (e.fuelType[0].toUpperCase() + e.fuelType.slice(1).toLowerCase()) : 'Diesel',
        qty:          Number(e.fuelQuantityLiters || 120),
        rate:         Number(e.pricePerLiter || 96.5),
        amount:       Number(e.totalAmount || (Number(e.fuelQuantityLiters || 120) * Number(e.pricePerLiter || 96.5))),
        odo:          Number(e.currentOdometer || 48250),
        mileage:      Number(e.mileageKmpl || 3.92),
        cperKm:       Number((Number(e.pricePerLiter || 96.5) / Number(e.mileageKmpl || 3.92)).toFixed(2)),
        payment:      e.paymentMode?.replace(/_/g, ' ') ?? 'Fuel Card',
        receipt:      e.hasReceipt ?? false,
        anomaly:      Number(e.mileageKmpl) > 0 && Number(e.mileageKmpl) < 2.5,
        anomalyReason: Number(e.mileageKmpl) < 2.5 ? `Low mileage (${Number(e.mileageKmpl).toFixed(2)} km/L)` : undefined,
      }))
    : DEMO;

  /* KPIs */
  const totalEntries  = allEntries.length;
  const totalLitres   = allEntries.reduce((s, e) => s + e.qty, 0);
  const totalSpend    = allEntries.reduce((s, e) => s + e.amount, 0);
  const validM        = allEntries.map(e => e.mileage).filter(m => m > 0);
  const avgMileage    = validM.length ? (validM.reduce((a, b) => a + b) / validM.length).toFixed(2) : '3.85';
  const avgCostKm     = Number(avgMileage) > 0
    ? (totalSpend / (totalLitres * Number(avgMileage))).toFixed(2) : '25.50';

  const vehSpend: Record<string, number> = {};
  allEntries.forEach(e => { vehSpend[e.vehicleReg] = (vehSpend[e.vehicleReg] || 0) + e.amount; });
  const topVeh    = Object.keys(vehSpend).sort((a, b) => vehSpend[b] - vehSpend[a])[0] ?? '—';
  const topVehAmt = vehSpend[topVeh] ?? 0;
  const anomalies = allEntries.filter(e => e.anomaly);

  /* efficiency per vehicle */
  const effMap: Record<string, { qty: number; spend: number; miles: number[]; entries: number }> = {};
  allEntries.forEach(e => {
    if (!effMap[e.vehicleReg]) effMap[e.vehicleReg] = { qty: 0, spend: 0, miles: [], entries: 0 };
    effMap[e.vehicleReg].qty    += e.qty;
    effMap[e.vehicleReg].spend  += e.amount;
    effMap[e.vehicleReg].entries += 1;
    if (e.mileage > 0) effMap[e.vehicleReg].miles.push(e.mileage);
  });
  const effRows = Object.entries(effMap).map(([reg, d]) => {
    const avgM = d.miles.length ? d.miles.reduce((a, b) => a + b) / d.miles.length : 0;
    const cpkm = avgM > 0 ? (d.spend / (d.qty * avgM)).toFixed(2) : '—';
    const status = avgM === 0 ? 'unknown' : avgM < 2.5 ? 'poor' : avgM < 3.2 ? 'average' : 'good';
    return { reg, ...d, avgMileage: avgM > 0 ? avgM.toFixed(2) : '—', cperKm: cpkm, status };
  });

  /* filter count */
  const filterCount = [vehicleFilter, fuelTypeFilter, paymentFilter, search, startDate, endDate, qtyMin, qtyMax, amtMin, amtMax].filter(Boolean).length;

  /* filtered */
  const filtered = allEntries.filter(e => {
    if (vehicleFilter  && e.vehicleReg !== vehicleFilter)                                    return false;
    if (fuelTypeFilter && e.fuelType.toLowerCase() !== fuelTypeFilter.toLowerCase())          return false;
    if (paymentFilter  && !e.payment.toLowerCase().includes(paymentFilter.toLowerCase()))     return false;
    if (qtyMin && e.qty    < Number(qtyMin))  return false;
    if (qtyMax && e.qty    > Number(qtyMax))  return false;
    if (amtMin && e.amount < Number(amtMin))  return false;
    if (amtMax && e.amount > Number(amtMax))  return false;
    if (startDate && e.date.slice(0, 10) < startDate) return false;
    if (endDate   && e.date.slice(0, 10) > endDate)   return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.vehicleReg.toLowerCase().includes(q) &&
          !e.location.toLowerCase().includes(q) &&
          !e.vehicleModel.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setVF(''); setFTF(''); setPF('');
    setSD(''); setED(''); setQMin(''); setQMax(''); setAMin(''); setAMax('');
    setPage(1);
  };

  const exportCSV = () => {
    const h = 'Date,Vehicle,Model,Location,Fuel Type,Qty(L),Rate(Rs),Total(Rs),Odometer,Mileage(km/L),Cost/km,Payment,Receipt\n';
    const r = filtered.map(e =>
      `${e.date.slice(0,10)},${e.vehicleReg},"${e.vehicleModel}","${e.location}",${e.fuelType},${e.qty},${e.rate},${e.amount},${e.odo},${e.mileage},${e.cperKm},${e.payment},${e.receipt ? 'Yes' : 'No'}`
    ).join('\n');
    const blob = new Blob([h + r], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fuel_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const tabBtn = (t: string, icon: React.ReactNode, label: string, danger = false) => (
    <button
      onClick={() => setActiveTab(t as any)}
      style={{
        background:  activeTab === t ? (danger ? 'rgba(239,68,68,0.13)' : 'var(--color-surface2)') : 'transparent',
        border:      activeTab === t ? `1px solid ${danger ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}` : '1px solid transparent',
        color:       activeTab === t ? (danger ? '#f87171' : '#f97316') : 'var(--color-text-muted)',
        padding: '7px 13px', borderRadius: '8px', fontWeight: 700, fontSize: '12px',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
      }}
    >{icon} {label}</button>
  );

  /* ── RENDER ──────────────────────────────────────────────────────────── */
  return (
    <div>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>Home &gt; Fuel Management</div>
          <h1 className="page-title" style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Fuel Management</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={exportCSV} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <DownloadIcon size={14} /> Export CSV
          </button>
          {canManage && (
            <button
              id="record-fuel-btn"
              className="btn btn-primary"
              onClick={() => { setEditEntry(null); setShowForm(v => !v); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700,
                background: showForm ? 'var(--color-surface2)' : '#f97316',
                color: showForm ? 'var(--color-text)' : '#fff',
                border: showForm ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {showForm ? <><XIcon size={14} /> Close Form</> : <><PlusIcon size={14} /> Record Fuel</>}
            </button>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px', marginBottom: '14px' }}>
        {([
          { icon: <FuelIcon size={18} />,        bg: 'rgba(59,130,246,0.15)', ic: '#60a5fa', label: 'Total Entries',     val: String(totalEntries),                       sub: 'All records' },
          { icon: <FuelIcon size={18} />,        bg: 'rgba(13,148,136,0.15)', ic: '#2dd4bf', label: 'Fuel Consumed',     val: `${totalLitres.toLocaleString()} L`,         sub: 'Total volume' },
          { icon: <DollarIcon size={18} />,      bg: 'rgba(249,115,22,0.15)', ic: '#f97316', label: 'Total Spend',       val: `\u20b9${totalSpend.toLocaleString()}`,      sub: 'Fuel cost' },
          { icon: <TrendingUpIcon size={18} />,  bg: 'rgba(34,197,94,0.15)',  ic: '#4ade80', label: 'Avg Mileage',       val: `${avgMileage} km/L`,                        sub: 'Fleet average' },
          { icon: <BarChartIcon size={18} />,    bg: 'rgba(236,72,153,0.15)', ic: '#f472b6', label: 'Avg Cost/km',       val: `\u20b9${avgCostKm}`,                         sub: 'Per kilometre' },
          { icon: <TruckIcon size={18} />,       bg: 'rgba(239,68,68,0.15)',  ic: '#f87171', label: 'Top Spender',       val: topVeh,                                      sub: `\u20b9${topVehAmt.toLocaleString()}` },
        ] as const).map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-icon-box" style={{ background: k.bg, color: k.ic }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{k.label}</div>
              <div className="kpi-val" style={{ fontSize: '15px' }}>{k.val}</div>
              <div className="kpi-sub" style={{ color: k.ic }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* INLINE FORM */}
      {showForm && (
        <div style={{ marginBottom: '14px' }}>
          <FuelFormModal
            editEntry={editEntry}
            onClose={() => { setShowForm(false); setEditEntry(null); }}
          />
        </div>
      )}

      {/* TAB BAR */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '10px', marginBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
        {tabBtn('log',        <FuelIcon size={14} />,          'Fuel Log')}
        {tabBtn('analytics',  <BarChartIcon size={14} />,      'Analytics')}
        {tabBtn('efficiency', <TrendingUpIcon size={14} />,    'Efficiency')}
        <button
          onClick={() => setActiveTab('anomalies')}
          style={{
            background: activeTab === 'anomalies' ? 'rgba(239,68,68,0.13)' : 'transparent',
            border:     activeTab === 'anomalies' ? '1px solid rgba(239,68,68,0.4)' : '1px solid transparent',
            color:      activeTab === 'anomalies' ? '#f87171' : 'var(--color-text-muted)',
            padding: '7px 13px', borderRadius: '8px', fontWeight: 700, fontSize: '12px',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
          }}
        >
          <AlertTriangleIcon size={14} /> Alerts
          {anomalies.length > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '9px', padding: '0px 5px', borderRadius: '8px', fontWeight: 800 }}>{anomalies.length}</span>}
        </button>
      </div>

      {/* ══ TAB: FUEL LOG ══════════════════════════════════════════════════ */}
      {activeTab === 'log' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ padding: '10px 14px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div className="search-input" style={{ flex: '1 1 170px', minWidth: '150px' }}>
                <span className="search-icon"><SearchIcon size={15} color="var(--color-text-muted)" /></span>
                <input type="text" id="fuel-search" placeholder="Search reg., station, model…" value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <select className="form-select" style={{ width: '118px' }} value={vehicleFilter} onChange={e => { setVF(e.target.value); setPage(1); }}>
                <option value="">All Vehicles</option>
                {vehiclesList.map((v: any) => <option key={v.id} value={v.registrationNumber}>{v.registrationNumber}</option>)}
              </select>
              <select className="form-select" style={{ width: '105px' }} value={fuelTypeFilter} onChange={e => { setFTF(e.target.value); setPage(1); }}>
                <option value="">Fuel Type</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="cng">CNG</option>
              </select>
              <select className="form-select" style={{ width: '105px' }} value={paymentFilter} onChange={e => { setPF(e.target.value); setPage(1); }}>
                <option value="">Payment</option>
                <option value="fuel card">Fuel Card</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
              </select>
              <button className="btn btn-secondary" onClick={() => setSMF(v => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: showMoreFilters ? 'var(--color-border)' : undefined }}>
                <FilterIcon size={13} /> More
                {filterCount > 0 && <span style={{ background: '#f97316', color: '#fff', fontSize: '9px', padding: '0 5px', borderRadius: '8px', fontWeight: 700 }}>{filterCount}</span>}
              </button>
              {filterCount > 0 && (
                <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Reset</button>
              )}
            </div>

            {showMoreFilters && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Date Range</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="date" className="form-input" style={{ fontSize: '11px', padding: '5px 8px', width: '128px' }} value={startDate} onChange={e => setSD(e.target.value)} />
                    <span style={{ color: 'var(--color-text-muted)' }}>–</span>
                    <input type="date" className="form-input" style={{ fontSize: '11px', padding: '5px 8px', width: '128px' }} value={endDate} onChange={e => setED(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Quantity (L)</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" className="form-input" placeholder="Min" style={{ width: '68px', fontSize: '11px', padding: '5px 8px' }} value={qtyMin} onChange={e => setQMin(e.target.value)} />
                    <span style={{ color: 'var(--color-text-muted)', lineHeight: '32px' }}>–</span>
                    <input type="number" className="form-input" placeholder="Max" style={{ width: '68px', fontSize: '11px', padding: '5px 8px' }} value={qtyMax} onChange={e => setQMax(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>Amount (₹)</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="number" className="form-input" placeholder="Min" style={{ width: '76px', fontSize: '11px', padding: '5px 8px' }} value={amtMin} onChange={e => setAMin(e.target.value)} />
                    <span style={{ color: 'var(--color-text-muted)', lineHeight: '32px' }}>–</span>
                    <input type="number" className="form-input" placeholder="Max" style={{ width: '76px', fontSize: '11px', padding: '5px 8px' }} value={amtMax} onChange={e => setAMax(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignSelf: 'flex-end' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '11px' }} onClick={resetFilters}>Clear</button>
                  <button className="btn btn-primary"   style={{ fontSize: '11px', background: '#f97316' }} onClick={() => { setPage(1); setSMF(false); }}>Apply</button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ minWidth: '1050px', width: '100%' }}>
                <colgroup>
                  <col style={{ width: '105px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '72px'  }} />
                  <col style={{ width: '110px' }} />
                  <col style={{ width: '100px' }} />
                  <col style={{ width: '148px' }} />
                  <col style={{ width: '105px' }} />
                  <col style={{ width: '75px'  }} />
                  <col style={{ width: '80px'  }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>DATE</th><th>VEHICLE</th><th>STATION</th><th>TYPE</th>
                    <th>QTY &amp; RATE</th><th>TOTAL</th><th>ODO &amp; MILEAGE</th>
                    <th>PAYMENT</th><th>RECEIPT</th><th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={10}>
                      <div className="empty-state">
                        <div style={{ display: 'flex', justifyContent: 'center' }}><FuelIcon size={36} color="var(--color-text-dim)" /></div>
                        <div className="empty-state-text">No fuel entries found</div>
                        <div className="empty-state-sub">Try adjusting your filters or record a new entry</div>
                      </div>
                    </td></tr>
                  ) : paginated.map((e: any) => {
                    const d = new Date(e.date);
                    return (
                      <tr key={e.id} style={{ background: e.anomaly ? 'rgba(239,68,68,0.04)' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '11px' }}>{d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '12px', color: '#f97316' }}>{e.vehicleReg}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.vehicleModel}</div>
                        </td>
                        <td style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.location}</td>
                        <td>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>{e.fuelType}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '12px' }}>{e.qty} L</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>₹{e.rate}/L</div>
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '13px', color: '#f97316' }}>₹{e.amount.toLocaleString()}</td>
                        <td>
                          <div style={{ fontSize: '11px', fontWeight: 600 }}>{e.odo.toLocaleString()} km</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: e.mileage < 2.5 ? '#f87171' : '#4ade80' }}>{e.mileage} km/L</span>
                            {e.anomaly && <AlertTriangleIcon size={11} color="#f87171" />}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-assigned" style={{ fontSize: '10px', padding: '2px 6px', textTransform: 'capitalize' }}>{e.payment}</span>
                        </td>
                        <td>
                          {e.receipt ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => setVR(e)}
                              style={{ padding: '2px 7px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#4ade80' }}>
                              <PaperclipIcon size={11} /> View
                            </button>
                          ) : <span style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>None</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                            <button title="Edit" className="btn btn-secondary btn-sm" style={{ padding: '3px 5px' }}
                              onClick={() => { setEditEntry(e); setShowForm(true); }}>
                              <EditIcon size={13} />
                            </button>
                            {isAdmin && (
                              <button title="Delete" className="btn btn-secondary btn-sm"
                                style={{ padding: '3px 5px', color: 'var(--color-danger)' }}
                                onClick={() => setDT({ id: e.id, reg: e.vehicleReg })}>
                                <TrashIcon size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>
                {paginated.length > 0 ? `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}` : 'No results'}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeftIcon size={13} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)} style={{ minWidth: '28px', fontSize: '11px' }}>{p}</button>
                ))}
                <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRightIcon size={13} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: ANALYTICS ════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          <div className="card" style={{ padding: '16px' }}>
            <BarChart data={MONTHLY_SPEND}  color="#f97316" label="Monthly Fuel Expenditure (₹)" fmt={n => `₹${(n / 1000).toFixed(0)}k`} />
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <BarChart data={MONTHLY_VOLUME} color="#3b82f6" label="Monthly Fuel Volume (Litres)"  fmt={n => `${n}L`} />
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '12px' }}>Expenditure by Payment Method</div>
            <DonutChart slices={[
              { label: 'Fuel Card',     value: Math.round(totalSpend * 0.60), color: '#f97316' },
              { label: 'Corporate UPI', value: Math.round(totalSpend * 0.25), color: '#3b82f6' },
              { label: 'Cash',          value: Math.round(totalSpend * 0.15), color: '#22c55e' },
            ]} />
          </div>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '12px' }}>Top 5 Vehicles by Fuel Cost</div>
            {effRows.sort((a, b) => b.spend - a.spend).slice(0, 5).map((r, i) => (
              <div key={r.reg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-dim)', width: '14px' }}>#{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#f97316' }}>{r.reg}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{r.entries} entries • {r.qty.toFixed(0)}L</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>₹{r.spend.toLocaleString()}</div>
                  <div style={{ fontSize: '10px', color: r.status === 'poor' ? '#f87171' : r.status === 'average' ? '#eab308' : '#4ade80' }}>
                    {r.avgMileage} {r.avgMileage !== '—' ? 'km/L' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ TAB: EFFICIENCY ═══════════════════════════════════════════════ */}
      {activeTab === 'efficiency' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Vehicle Fuel Efficiency Monitoring</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Mileage = Distance ÷ Fuel Consumed &nbsp;|&nbsp; Cost/km = Fuel Spend ÷ (Volume × Mileage)
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: '700px', width: '100%' }}>
              <thead>
                <tr>
                  <th>VEHICLE</th><th>ENTRIES</th><th>TOTAL LITRES</th>
                  <th>TOTAL SPEND</th><th>AVG MILEAGE</th><th>COST/KM</th><th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {effRows.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>No efficiency data yet</td></tr>
                ) : effRows.sort((a, b) => b.spend - a.spend).map(r => (
                  <tr key={r.reg}>
                    <td style={{ fontWeight: 700, color: '#f97316' }}>{r.reg}</td>
                    <td>{r.entries}</td>
                    <td>{r.qty.toLocaleString()} L</td>
                    <td style={{ fontWeight: 700 }}>₹{r.spend.toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: r.avgMileage === '—' ? 'var(--color-text-dim)' : Number(r.avgMileage) < 2.5 ? '#f87171' : Number(r.avgMileage) < 3.2 ? '#eab308' : '#4ade80' }}>
                        {r.avgMileage}{r.avgMileage !== '—' ? ' km/L' : ''}
                      </span>
                    </td>
                    <td>₹{r.cperKm}/km</td>
                    <td>
                      {r.status === 'poor' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                          <AlertTriangleIcon size={10} /> Poor — Review
                        </span>
                      )}
                      {r.status === 'average' && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#eab308', background: 'rgba(234,179,8,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                          ⚠ Average
                        </span>
                      )}
                      {r.status === 'good' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#4ade80', background: 'rgba(74,222,128,0.12)', padding: '2px 8px', borderRadius: '10px' }}>
                          <CheckIcon size={10} /> Good
                        </span>
                      )}
                      {r.status === 'unknown' && (
                        <span style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ TAB: ANOMALIES ════════════════════════════════════════════════ */}
      {activeTab === 'anomalies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '12px', fontWeight: 600 }}>
            ⚠️ <strong>Anomaly Investigation Notices</strong> — These are flags for investigation only. Not automatic accusations of fuel theft.
          </div>
          {anomalies.length === 0 ? (
            <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}><CheckIcon size={32} color="#4ade80" /></div>
              <div style={{ fontWeight: 700 }}>No anomalies detected</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>All entries are within normal parameters.</div>
            </div>
          ) : anomalies.map((a: any) => (
            <div key={a.id} className="card" style={{ borderLeft: '4px solid #ef4444', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangleIcon size={16} color="#ef4444" />
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#f87171' }}>{a.vehicleReg}</span>
                  <span style={{ fontSize: '10px', background: 'var(--color-surface2)', padding: '2px 7px', borderRadius: '8px', color: 'var(--color-text-muted)' }}>{a.vehicleModel}</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{new Date(a.date).toLocaleDateString('en-GB')}</span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                Issue: <span style={{ color: '#f87171' }}>{a.anomalyReason}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', background: 'var(--color-surface2)', padding: '10px', borderRadius: '8px', marginBottom: '8px', fontSize: '11px' }}>
                <div><div style={{ color: 'var(--color-text-dim)', fontSize: '10px' }}>Filled</div><div style={{ fontWeight: 700 }}>{a.qty} L</div></div>
                <div><div style={{ color: 'var(--color-text-dim)', fontSize: '10px' }}>Amount</div><div style={{ fontWeight: 700 }}>₹{a.amount.toLocaleString()}</div></div>
                <div><div style={{ color: 'var(--color-text-dim)', fontSize: '10px' }}>Odometer</div><div style={{ fontWeight: 700 }}>{a.odo.toLocaleString()} km</div></div>
                <div><div style={{ color: 'var(--color-text-dim)', fontSize: '10px' }}>Mileage</div><div style={{ fontWeight: 700, color: '#f87171' }}>{a.mileage} km/L</div></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" style={{ fontSize: '11px' }}
                  onClick={() => alert(`Investigation marked for ${a.vehicleReg}`)}>
                  Mark Under Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete confirm ──────────────────────────────────────────────── */}
      {deleteTarget && (
        <ConfirmDeleteModal
          reg={deleteTarget.reg}
          onClose={() => setDT(null)}
          onConfirm={() => { deleteMut.mutate(deleteTarget.id); setDT(null); }}
        />
      )}

      {/* ── Receipt viewer ──────────────────────────────────────────────── */}
      {viewReceipt && (
        <div className="modal-overlay" onClick={() => setVR(null)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Fuel Receipt</span>
              <button className="modal-close" onClick={() => setVR(null)}><XIcon size={16} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--color-surface2)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                <PaperclipIcon size={28} color="#f97316" />
                <div style={{ marginTop: '8px', fontWeight: 700 }}>{viewReceipt.vehicleReg} — {viewReceipt.location}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  ₹{viewReceipt.amount.toLocaleString()} • {viewReceipt.qty}L • {new Date(viewReceipt.date).toLocaleDateString('en-GB')}
                </div>
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--color-surface)', borderRadius: '6px', fontSize: '11px', color: 'var(--color-text-dim)' }}>
                  Receipt preview not available in demo mode.<br />In production, the uploaded image/PDF renders here.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setVR(null)}>Close</button>
              <button className="btn btn-primary" style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => alert('Downloading receipt…')}>
                <DownloadIcon size={13} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
