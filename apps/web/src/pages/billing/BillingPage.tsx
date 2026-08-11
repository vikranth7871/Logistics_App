import { useInvoices } from '@hooks/useERP';
import React, { useState } from 'react';
import { PlusIcon, ReceiptIcon, EyeIcon, DownloadIcon } from '@components/common/Icons';
import CreateInvoiceModal from './components/CreateInvoiceModal';

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-draft', issued: 'badge-issued', partially_paid: 'badge-assigned',
  paid: 'badge-paid', overdue: 'badge-overdue', cancelled: 'badge-maintenance',
};

export default function BillingPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useInvoices({ page, limit: 20, status: statusFilter || undefined });
  const invoices = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      {isModalOpen && <CreateInvoiceModal onClose={() => setIsModalOpen(false)} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-subtitle">{meta.total} invoices</p>
        </div>
        <button
          className="btn btn-primary"
          id="create-invoice-btn"
          onClick={() => setIsModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Create Invoice
        </button>
      </div>

      <div className="filter-bar">
        <select className="form-select" style={{ width: '180px' }} value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setStatusFilter(e.target.value); setPage(1); }} id="invoice-status-filter">
          <option value="">All Statuses</option>
          {['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice No.</th>
                <th>Customer</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Grand Total (₹)</th>
                <th>Paid (₹)</th>
                <th>Balance Due (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <ReceiptIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No invoices yet</div>
                  </div>
                </td></tr>
              ) : (
                invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '12px' }}>{inv.invoiceNumber}</td>
                    <td style={{ fontSize: '12px' }}>{inv.customer?.name || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontSize: '12px', color: new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? 'var(--color-danger)' : undefined }}>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(inv.grandTotal).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--color-success)' }}>₹{Number(inv.paidAmount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: Number(inv.balanceDue) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      ₹{Number(inv.balanceDue || 0).toLocaleString('en-IN')}
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[inv.status] || ''}`}>{inv.status?.replace(/_/g, ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button className="btn btn-secondary btn-sm" title="View Invoice" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}>
                          <EyeIcon size={14} /> View
                        </button>
                        <button className="btn btn-secondary btn-sm" title="Download PDF" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}>
                          <DownloadIcon size={14} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
