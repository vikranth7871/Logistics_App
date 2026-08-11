import React, { useState } from 'react';
import {
  useDashboard,
  useVehicleProfitability,
  useExpenseBreakdown,
} from '@hooks/useERP';
import {
  DownloadIcon,
  TrendingUpIcon,
  DollarIcon,
  FuelIcon,
  WrenchIcon,
  TruckIcon,
  PackageIcon,
  ClockIcon,
} from '@components/common/Icons';

export default function ReportsPage() {
  const [period, setPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState<'profitability' | 'expenses' | 'efficiency'>('profitability');

  const { data: kpiData, isLoading: kpiLoading } = useDashboard(period);
  const { data: profitData, isLoading: profitLoading } = useVehicleProfitability();
  const { data: expenseBreakdown, isLoading: expLoading } = useExpenseBreakdown();

  const vehiclesProfitability = profitData || [];
  const categoryBreakdown = expenseBreakdown || [];

  const handleExportCSV = () => {
    if (activeTab === 'profitability' && vehiclesProfitability.length > 0) {
      const headers = ['Vehicle Reg', 'Make/Model', 'Status', 'Trips', 'Total KM', 'Revenue (₹)', 'Fuel Cost (₹)', 'Maintenance (₹)', 'Expenses (₹)', 'Total Cost (₹)', 'Net Profit (₹)', 'Margin (%)', 'KM/L'];
      const rows = vehiclesProfitability.map((v: any) => [
        v.registrationNumber,
        `${v.make || ''} ${v.model || ''}`,
        v.status,
        v.tripCount,
        v.totalKm,
        v.revenue,
        v.fuelCost,
        v.maintenanceCost,
        v.expenseCost,
        v.totalCost,
        v.profit,
        `${v.marginPercent}%`,
        v.kmPerLiter,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `fleet_profitability_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeTab === 'expenses' && categoryBreakdown.length > 0) {
      const headers = ['Category', 'Amount (₹)', 'Count', 'Percentage Share'];
      const rows = categoryBreakdown.map((c: any) => [c.category, c.amount, c.count, `${c.percentage}%`]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `expense_breakdown_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Revenue, profitability & fleet performance breakdown</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: '150px' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">Year to Date</option>
            <option value="all">All Time</option>
          </select>
          <button
            className="btn btn-secondary"
            id="export-report-btn"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <DownloadIcon size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-dim)', fontSize: '13px' }}>
            <span>Total Revenue</span>
            <DollarIcon size={20} color="var(--color-success)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '8px', color: 'var(--color-success)' }}>
            {kpiLoading ? '...' : `₹${Number(kpiData?.revenue || 0).toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
            {kpiData?.totalTrips || 0} completed trips
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-dim)', fontSize: '13px' }}>
            <span>Fuel Expenses</span>
            <FuelIcon size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '8px', color: '#f59e0b' }}>
            {kpiLoading ? '...' : `₹${Number(kpiData?.fuelCost || 0).toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
            Avg {kpiData?.avgKmPerLiter || 0} KM/L
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-dim)', fontSize: '13px' }}>
            <span>Operating Costs</span>
            <WrenchIcon size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '8px', color: '#ef4444' }}>
            {kpiLoading ? '...' : `₹${Number(kpiData?.totalOperatingCosts || 0).toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
            Fuel, Maint. & Allowances
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-dim)', fontSize: '13px' }}>
            <span>Net Operating Profit</span>
            <TrendingUpIcon size={20} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '8px', color: Number(kpiData?.netProfit || 0) >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>
            {kpiLoading ? '...' : `₹${Number(kpiData?.netProfit || 0).toLocaleString('en-IN')}`}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
            Margin: <strong style={{ color: 'var(--color-primary)' }}>{kpiData?.marginPercent || 0}%</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: '8px' }}>
        <button
          className={`btn ${activeTab === 'profitability' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('profitability')}
          style={{ borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <TruckIcon size={16} /> Fleet Profitability ({vehiclesProfitability.length})
        </button>
        <button
          className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('expenses')}
          style={{ borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <DollarIcon size={16} /> Expense Breakdown
        </button>
        <button
          className={`btn ${activeTab === 'efficiency' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('efficiency')}
          style={{ borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ClockIcon size={16} /> Operational Efficiency
        </button>
      </div>

      {/* TAB 1: FLEET PROFITABILITY */}
      {activeTab === 'profitability' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Status</th>
                  <th>Trips</th>
                  <th>Freight Revenue (₹)</th>
                  <th>Fuel Cost (₹)</th>
                  <th>Maintenance (₹)</th>
                  <th>Total Cost (₹)</th>
                  <th>Net Profit (₹)</th>
                  <th>Margin (%)</th>
                  <th>Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {profitLoading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px' }}>
                      <div className="spinner" />
                    </td>
                  </tr>
                ) : vehiclesProfitability.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <TruckIcon size={36} color="var(--color-text-dim)" />
                        <div className="empty-state-text">No vehicle data available</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vehiclesProfitability.map((v: any) => {
                    const isProfitable = v.profit >= 0;
                    return (
                      <tr key={v.vehicleId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.registrationNumber}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                            {v.make} {v.model}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${v.status}`}>{v.status?.replace('_', ' ')}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{v.tripCount}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                          ₹{Number(v.revenue).toLocaleString('en-IN')}
                        </td>
                        <td style={{ color: '#f59e0b' }}>
                          ₹{Number(v.fuelCost).toLocaleString('en-IN')}
                        </td>
                        <td style={{ color: '#ef4444' }}>
                          ₹{Number(v.maintenanceCost).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          ₹{Number(v.totalCost).toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 700, color: isProfitable ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          ₹{Number(v.profit).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span
                            className={`badge ${isProfitable ? 'badge-paid' : 'badge-overdue'}`}
                            style={{ fontWeight: 600 }}
                          >
                            {v.marginPercent}%
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          {v.kmPerLiter ? `${v.kmPerLiter} KM/L` : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXPENSE BREAKDOWN */}
      {activeTab === 'expenses' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Expense Category Distribution
            </h3>
            {expLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" /></div>
            ) : categoryBreakdown.length === 0 ? (
              <div className="empty-state">
                <DollarIcon size={36} color="var(--color-text-dim)" />
                <div className="empty-state-text">No expense records found</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {categoryBreakdown.map((cat: any) => (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                        {cat.category.replace(/_/g, ' ')}
                      </span>
                      <span>
                        <strong>₹{Number(cat.amount).toLocaleString('en-IN')}</strong> ({cat.percentage}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${cat.percentage}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
              Category Summary Table
            </h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Records</th>
                    <th>Total Amount (₹)</th>
                    <th>Share (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((cat: any) => (
                    <tr key={cat.category}>
                      <td style={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {cat.category.replace(/_/g, ' ')}
                      </td>
                      <td>{cat.count}</td>
                      <td style={{ fontWeight: 600 }}>₹{Number(cat.amount).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-issued">{cat.percentage}%</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL EFFICIENCY */}
      {activeTab === 'efficiency' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '10px', borderRadius: '8px' }}>
                <TrendingUpIcon size={24} color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>Revenue Per KM</div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>₹{kpiData?.revenuePerKm || 0} / km</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
              Average earnings generated per kilometer driven across all trips.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>
                <WrenchIcon size={24} color="#ef4444" />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>Operating Cost Per KM</div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>₹{kpiData?.costPerKm || 0} / km</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
              Total expenses (fuel + maintenance + allowances) per kilometer driven.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px' }}>
                <FuelIcon size={24} color="#f59e0b" />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>Average Fleet Mileage</div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>{kpiData?.avgKmPerLiter || 0} KM/L</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
              Average fuel efficiency measured across all registered fuel fills.
            </p>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px' }}>
                <PackageIcon size={24} color="var(--color-success)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-dim)' }}>Total Distance Traveled</div>
                <div style={{ fontSize: '22px', fontWeight: 700 }}>{Number(kpiData?.totalKm || 0).toLocaleString('en-IN')} KM</div>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
              Total odometer distance covered by fleet vehicles in selected period.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
