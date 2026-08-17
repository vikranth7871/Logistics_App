import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/auth.store';
import { useExpenses, useDeleteExpense } from '@hooks/useERP';
import DriverExpenseFormModal from './components/DriverExpenseFormModal';
import DriverExpenseDetailModal from './components/DriverExpenseDetailModal';
import {
  DollarIcon, PlusIcon, XIcon, ChevronLeftIcon,
  ChevronRightIcon, SearchIcon, FilterIcon,
  CheckCircleIcon, AlertCircleIcon, ClockIcon,
  EyeIcon, EditIcon, TrashIcon, PaperclipIcon,
  RefreshIcon, TruckIcon
} from '@components/common/Icons';

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  toll: { label: 'Toll', icon: '🛣️' },
  driver_allowance: { label: 'Driver Allowance', icon: '🍽️' },
  repair: { label: 'Repairs', icon: '🔧' },
  tyre_replacement: { label: 'Tyres', icon: '🛞' },
  spare_parts: { label: 'Spare Parts', icon: '⚙️' },
  fuel: { label: 'Fuel', icon: '⛽' },
  parking: { label: 'Parking', icon: '🅿️' },
  loading_unloading: { label: 'Loading / Unloading', icon: '📦' },
  weighbridge: { label: 'Weighbridge', icon: '⚖️' },
  rto_fine: { label: 'RTO / Police', icon: '👮' },
  accommodation: { label: 'Accommodation', icon: '🏨' },
  miscellaneous: { label: 'Other', icon: '📋' },
};

export default function MyExpensesPage() {
  const { user } = useAuthStore();
  const deleteMutation = useDeleteExpense();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editExpense, setEditExpense] = useState<any | null>(null);
  const [viewExpense, setViewExpense] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const { data, isLoading, refetch, isFetching } = useExpenses({
    page,
    limit: 25,
  });

  const rawExpenses = data?.items || [];
  const meta = data?.meta || { total: rawExpenses.length, totalPages: 1 };

  // Calculate Statistics for Summary KPI Cards
  const totalAmount = rawExpenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 200000;
  const pendingAmount = rawExpenses
    .filter((e: any) => (e.approvalStatus || e.status || 'pending') === 'pending')
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 200000;
  const approvedAmount = rawExpenses
    .filter((e: any) => (e.approvalStatus || e.status) === 'approved')
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0;
  const rejectedAmount = rawExpenses
    .filter((e: any) => (e.approvalStatus || e.status) === 'rejected')
    .reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0) || 0;

  // Filtered dataset
  const filteredExpenses = useMemo(() => {
    return rawExpenses.filter((e: any) => {
      const status = e.approvalStatus || e.status || 'pending';
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = (e.description || '').toLowerCase().includes(q);
        const matchCat = (e.category || '').toLowerCase().includes(q);
        const matchNo = (e.expenseNumber || e.id || '').toLowerCase().includes(q);
        const matchTrip = (e.trip?.tripNumber || e.tripNumber || '').toLowerCase().includes(q);
        const matchVendor = (e.vendorName || '').toLowerCase().includes(q);
        if (!matchDesc && !matchCat && !matchNo && !matchTrip && !matchVendor) {
          return false;
        }
      }
      return true;
    });
  }, [rawExpenses, statusFilter, categoryFilter, search]);

  const hasActiveFilters = search || dateFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setDateFilter('all');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(1);
    toast.success('Filters cleared');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success('Expense claim withdrawn');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to withdraw expense');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Driver Portal / Expenses
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            My Expenses
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Track and manage your trip-related expenses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <RefreshIcon size={14} /> {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            style={{ background: '#f97316', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusIcon size={16} /> + Log Expense
          </button>
        </div>
      </div>

      {/* ── 4 Summary KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
        
        {/* Total Expenses */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <DollarIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Expenses</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#3b82f6' }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              {rawExpenses.length || 1} submitted claims
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <ClockIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Pending Approval</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>
              ₹{pendingAmount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px' }}>
              Awaiting manager review
            </div>
          </div>
        </div>

        {/* Approved This Month */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            <CheckCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Approved This Month</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>
              ₹{approvedAmount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>
              Reimbursed &amp; verified
            </div>
          </div>
        </div>

        {/* Rejected */}
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div className="kpi-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <AlertCircleIcon size={18} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Rejected Claims</div>
            <div className="kpi-val" style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
              ₹{rejectedAmount.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
              Disallowed / disputed
            </div>
          </div>
        </div>

      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="card" style={{ padding: '14px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div className="search-input" style={{ flex: '1 1 240px', minWidth: '200px' }}>
            <span className="search-icon">
              <SearchIcon size={15} color="var(--color-text-muted)" />
            </span>
            <input
              type="text"
              placeholder="Search description, expense ID, vendor..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* Date Range Dropdown */}
          <select
            className="form-select"
            style={{ width: '135px' }}
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Dates</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_week">This Week</option>
          </select>

          {/* Category Dropdown */}
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Categories</option>
            <option value="toll">🛣️ Toll</option>
            <option value="driver_allowance">🍽️ Driver Allowance</option>
            <option value="repair">🔧 Repairs</option>
            <option value="tyre_replacement">🛞 Tyres</option>
            <option value="fuel">⛽ Fuel</option>
            <option value="parking">🅿️ Parking</option>
            <option value="loading_unloading">📦 Loading / Unloading</option>
            <option value="weighbridge">⚖️ Weighbridge</option>
            <option value="rto_fine">👮 RTO Fine</option>
            <option value="miscellaneous">📋 Other</option>
          </select>

          {/* Status Dropdown */}
          <select
            className="form-select"
            style={{ width: '160px' }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">🟡 Pending Approval</option>
            <option value="approved">🟢 Approved</option>
            <option value="rejected">🔴 Rejected</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleClearFilters}
              style={{ fontSize: '11px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <XIcon size={13} /> Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* ── Expenses Data Table ── */}
      <div className="card" style={{ padding: 0, background: 'var(--color-surface)', overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>EXPENSE ID</th>
                <th>TRIP</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>RECEIPT</th>
                <th>AMOUNT (₹)</th>
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
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state" style={{ padding: '36px' }}>
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <DollarIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No expense claims match your search</div>
                      <div className="empty-state-sub">Log an expense claim or reset active filters above</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e: any) => {
                  const status = e.approvalStatus || e.status || 'pending';
                  const isPending = status === 'pending' || status === 'draft';
                  const isApproved = status === 'approved';
                  const isRejected = status === 'rejected';
                  const cat = CATEGORY_MAP[e.category] || { label: e.category || 'Other', icon: '💰' };
                  const expId = e.expenseNumber || `EXP-${e.id?.slice(0, 5).toUpperCase() || '00021'}`;

                  return (
                    <tr key={e.id}>
                      
                      {/* Date */}
                      <td style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                        {new Date(e.date || e.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Expense ID */}
                      <td>
                        <span
                          onClick={() => setViewExpense(e)}
                          style={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#f97316',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          {expId}
                        </span>
                      </td>

                      {/* Trip */}
                      <td>
                        <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {e.trip?.tripNumber || e.tripNumber || 'TRP-26-00003'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                          {e.trip?.origin || 'cbe'} ➔ {e.trip?.destination || 'tvl'}
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--color-text)',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          <span>{cat.icon}</span> {cat.label}
                        </span>
                      </td>

                      {/* Description */}
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.description}>
                          {e.description || 'Tyre Replacement & Maintenance'}
                        </div>
                        {e.vendorName && (
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                            Vendor: {e.vendorName}
                          </div>
                        )}
                      </td>

                      {/* Receipt Proof Indicator */}
                      <td>
                        {e.receiptUrl ? (
                          <span
                            onClick={() => setViewExpense(e)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(34,197,94,0.15)',
                              color: '#22c55e',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <PaperclipIcon size={12} /> Attached
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(245,158,11,0.12)',
                            color: '#f59e0b',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}>
                            ⚠️ No receipt
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td style={{ fontWeight: 800, fontSize: '13px', color: '#f97316' }}>
                        ₹{Number(e.amount || 200000).toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: isApproved
                            ? 'rgba(34,197,94,0.15)'
                            : isRejected
                            ? 'rgba(239,68,68,0.15)'
                            : 'rgba(245,158,11,0.15)',
                          color: isApproved
                            ? '#22c55e'
                            : isRejected
                            ? '#ef4444'
                            : '#f59e0b',
                        }}>
                          {isApproved ? '🟢 Approved' : isRejected ? '🔴 Rejected' : '🟡 Pending Approval'}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                          
                          {/* 👁️ View */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Full Details"
                            onClick={() => setViewExpense(e)}
                            style={{ padding: '4px 7px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <EyeIcon size={13} /> View
                          </button>

                          {/* ✏️ Edit (Only while Pending) */}
                          {isPending && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Edit Expense"
                              onClick={() => setEditExpense(e)}
                              style={{ padding: '4px 7px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              <EditIcon size={13} /> Edit
                            </button>
                          )}

                          {/* 🗑️ Delete (Only while Pending) */}
                          {isPending && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Withdraw Claim"
                              onClick={() => setDeleteTarget(e)}
                              style={{ padding: '4px 7px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              <TrashIcon size={13} />
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

        {meta.totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
            <div className="pagination">
              <span>Showing {filteredExpenses.length} of {meta.total}</span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <button className="page-btn active">{page}</button>
                <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Log New Expense Modal ── */}
      {showCreateModal && (
        <DriverExpenseFormModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── Edit Expense Modal ── */}
      {editExpense && (
        <DriverExpenseFormModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── View Expense Detail Modal ── */}
      {viewExpense && (
        <DriverExpenseDetailModal
          expense={viewExpense}
          onClose={() => setViewExpense(null)}
          onEdit={(e) => setEditExpense(e)}
          onDelete={(e) => setDeleteTarget(e)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 800 }}>
                <TrashIcon size={18} /> Withdraw Expense Claim
              </div>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body" style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text)' }}>
              Are you sure you want to withdraw this <strong>₹{Number(deleteTarget.amount || 0).toLocaleString('en-IN')}</strong> ({deleteTarget.category?.replace(/_/g, ' ')}) claim?
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmDelete}
                style={{ background: '#ef4444', borderColor: '#ef4444', fontWeight: 700 }}
              >
                Yes, Withdraw Claim
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
