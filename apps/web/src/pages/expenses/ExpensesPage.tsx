import React, { useState } from 'react';
import { useExpenses, useCreateExpense } from '@hooks/useERP';
import { PlusIcon, DollarIcon, XIcon, CheckIcon } from '@components/common/Icons';

const CATEGORIES = [
  'toll', 'driver_allowance', 'repair', 'tyre_replacement', 'spare_parts',
  'loading_unloading', 'brokerage', 'rto_fine', 'weighbridge', 'accommodation', 'miscellaneous',
];
const PAYMENT_MODES = ['cash', 'fastag', 'card', 'upi', 'bank_transfer'];

export default function ExpensesPage() {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useExpenses({ page, limit: 25, category: categoryFilter || undefined });
  const entries = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Expense Management</h1>
          <p className="page-subtitle">{meta.total} expense records</p>
        </div>
        <button
          className="btn btn-primary"
          id="add-expense-btn"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Add Expense
        </button>
      </div>

      <div className="filter-bar">
        <select
          className="form-select"
          style={{ width: '220px' }}
          value={categoryFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setCategoryFilter(e.target.value); setPage(1); }}
          id="expense-category-filter"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Payment</th>
                <th>Approved</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <DollarIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No expenses recorded</div>
                  </div>
                </td></tr>
              ) : (
                entries.map((e: any) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '12px' }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {e.category?.replace(/_/g, ' ')}
                      </span>
                      {e.description && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{e.description.slice(0, 50)}</div>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-danger)' }}>
                      ₹{Number(e.amount).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '12px' }}>{e.vehicle?.registrationNumber || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{e.driver?.name || '—'}</td>
                    <td><span className="badge badge-assigned">{e.paymentMode}</span></td>
                    <td>
                      {e.isApproved
                        ? <span className="badge badge-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckIcon size={12} /> Approved</span>
                        : <span className="badge badge-inactive">Pending</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ExpenseFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function ExpenseFormModal({ onClose }: { onClose: () => void }) {
  const mutation = useCreateExpense();
  const [form, setForm] = useState({
    category: 'toll', amount: '', date: new Date().toISOString().split('T')[0],
    description: '', paymentMode: 'cash', vehicleId: '', driverId: '',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({ ...form, amount: parseFloat(form.amount) });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarIcon size={18} /> Record Expense
          </span>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" required value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" step="0.01" className="form-input" required value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-select" value={form.paymentMode} onChange={e => set('paymentMode', e.target.value)}>
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Details about this expense…" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="expense-submit-btn" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
