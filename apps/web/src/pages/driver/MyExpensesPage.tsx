import React, { useState } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useExpenses, useCreateExpense, useTrips } from '@hooks/useERP';
import { DollarIcon, PlusIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '@components/common/Icons';

const EXPENSE_CATEGORIES = [
  'fuel', 'toll', 'food', 'loading', 'unloading', 'repair',
  'tire', 'police_fine', 'other',
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'badge-inactive',
  approved: 'badge-active',
  rejected: 'badge-maintenance',
};

export default function MyExpensesPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useExpenses({
    page,
    limit: 15,
    // filter by current user's driver context
  });

  const expenses = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const totalAmount = expenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Expenses</h1>
          <p className="page-subtitle">
            {meta.total} expense records · Total ₹{totalAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Log Expense
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Trip</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <DollarIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No expenses logged</div>
                      <div className="empty-state-sub">Log your first trip expense using the button above</div>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((e: any) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '12px' }}>{new Date(e.date || e.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-primary)' }}>
                      {e.trip?.tripNumber || '—'}
                    </td>
                    <td>
                      <span style={{
                        background: 'rgba(99,102,241,0.1)', color: 'var(--color-primary)',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'capitalize',
                      }}>
                        {e.category?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', fontSize: '13px' }}>{e.description || '—'}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(e.amount || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[e.approvalStatus || 'pending'] || 'badge-inactive'}`}>
                        {e.approvalStatus || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {expenses.length} of {meta.total}</span>
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

      {showForm && (
        <ExpenseFormModal onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

function ExpenseFormModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuthStore();
  const createMutation = useCreateExpense();
  const { data: tripData } = useTrips({
    driverId: (user as any)?.driverId || undefined,
    status: 'in_progress',
    limit: 20,
  });
  const trips = tripData?.items || [];

  const [form, setForm] = useState({
    tripId: '',
    category: 'fuel',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...form,
      amount: parseFloat(form.amount),
      tripId: form.tripId || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <span className="modal-title">Log New Expense</span>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Trip (optional)</label>
              <select className="form-select" value={form.tripId} onChange={(e) => set('tripId', e.target.value)}>
                <option value="">— Not linked to a trip —</option>
                {trips.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.tripNumber} ({t.origin} → {t.destination})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" required value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number" className="form-input" required min={0} step={0.01}
                value={form.amount} onChange={(e) => set('amount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea" rows={2}
                value={form.description} onChange={(e) => set('description', e.target.value)}
                placeholder="What was this expense for?"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Submitting…' : 'Submit Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
