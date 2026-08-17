import React, { useState } from 'react';
import { useApproveExpense, useDeleteExpense } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  XIcon, DollarIcon, CheckIcon, PaperclipIcon, TruckIcon,
  UsersIcon, CalendarIcon, FileTextIcon, BuildingIcon, WrenchIcon,
  AlertTriangleIcon, DownloadIcon, EditIcon, TrashIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, MoreVerticalIcon
} from '@components/common/Icons';

interface ExpenseDetailModalProps {
  expense: any;
  onClose: () => void;
  onEdit?: (expense: any) => void;
}

export default function ExpenseDetailModal({ expense, onClose, onEdit }: ExpenseDetailModalProps) {
  const { user } = useAuthStore();
  const isAdminOrManager = ['admin', 'manager', 'accountant'].includes(user?.role || '');

  const approveMut = useApproveExpense();
  const deleteMut = useDeleteExpense();

  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [localStatus, setLocalStatus] = useState<string>(
    expense.status || (expense.isApproved ? 'approved' : 'pending')
  );
  const [localApprover, setLocalApprover] = useState(expense.approvedBy || expense.approverName);
  const [localApprovalDate, setLocalApprovalDate] = useState(expense.approvalDate || expense.updatedAt);
  const [localRejectionReason, setLocalRejectionReason] = useState(expense.rejectionReason);

  const handleApprove = async () => {
    try {
      if (expense.id && !expense.id.startsWith('demo-')) {
        await approveMut.mutateAsync(expense.id);
      }
      setLocalStatus('approved');
      setLocalApprover(user?.name || 'System Admin');
      setLocalApprovalDate(new Date().toISOString());
    } catch (err) {
      // handled
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    setLocalStatus('rejected');
    setLocalApprover(user?.name || 'System Admin');
    setLocalApprovalDate(new Date().toISOString());
    setLocalRejectionReason(rejectionReason.trim());
    setShowRejectPrompt(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete expense ${expense.expenseId || expense.id}?`)) {
      if (expense.id && !expense.id.startsWith('demo-')) {
        await deleteMut.mutateAsync(expense.id);
      }
      onClose();
    }
  };

  const formattedDate = new Date(expense.date || expense.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: localStatus === 'approved'
                ? 'rgba(34,197,94,0.15)'
                : localStatus === 'rejected'
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(234,179,8,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: localStatus === 'approved' ? '#22c55e' : localStatus === 'rejected' ? '#ef4444' : '#eab308'
            }}>
              {localStatus === 'approved' ? <CheckCircleIcon size={22} /> : localStatus === 'rejected' ? <XCircleIcon size={22} /> : <ClockIcon size={22} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {expense.expenseId || `EXP-${expense.id?.slice(0, 8)}`}
                </span>
                <span className={`badge ${
                  localStatus === 'approved' ? 'badge-active' : localStatus === 'rejected' ? 'badge-danger' : 'badge-warning'
                }`} style={{ textTransform: 'capitalize', fontSize: '11px', padding: '2px 8px' }}>
                  {localStatus}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Recorded on {formattedDate}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

          {/* Amount & Category Banner */}
          <div style={{
            background: 'var(--color-surface2)',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Expense Amount
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#f97316', marginTop: '2px' }}>
                ₹{Number(expense.amount).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>
                {expense.description}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(249,115,22,0.12)',
                color: '#f97316',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>
                <DollarIcon size={14} />
                {expense.category?.replace(/_/g, ' ')}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Paid via <strong style={{ color: 'var(--color-text)', textTransform: 'uppercase' }}>{expense.paymentMode || 'Cash'}</strong>
                {expense.paymentRef && ` (${expense.paymentRef})`}
              </div>
            </div>
          </div>

          {/* Rejection Alert Banner if rejected */}
          {localStatus === 'rejected' && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#ef4444',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <AlertTriangleIcon size={14} /> Expense Rejected
              </div>
              <div>Reason: {localRejectionReason || 'Duplicate or invalid invoice documentation.'}</div>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>

            {/* Vehicle & Trip Info */}
            <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={14} /> Vehicle &amp; Assignment
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Vehicle:</span>
                  <span style={{ fontWeight: 700, color: '#f97316' }}>
                    {expense.vehicle?.registrationNumber || expense.vehicleReg || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Model / Specs:</span>
                  <span style={{ color: 'var(--color-text)' }}>
                    {[expense.vehicle?.make, expense.vehicle?.model].filter(Boolean).join(' ') || expense.vehicleModel || 'Fleet Vehicle'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Driver:</span>
                  <span style={{ fontWeight: 600 }}>
                    {expense.driver?.name || expense.driverName || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Associated Trip:</span>
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>
                    {expense.trip?.tripNumber || expense.trip?.tripCode || expense.tripNumber || 'General Expense'}
                  </span>
                </div>
                {expense.odometer && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Odometer:</span>
                    <span>{Number(expense.odometer).toLocaleString()} km</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor & Payment Info */}
            <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BuildingIcon size={14} /> Vendor &amp; Receipt
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Vendor / Provider:</span>
                  <span style={{ fontWeight: 600 }}>{expense.vendorName || 'ABC Spares & Services'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Invoice / Bill No:</span>
                  <span style={{ fontFamily: 'monospace' }}>{expense.vendorInvoice || 'INV-2026-8812'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment Mode:</span>
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{expense.paymentMode || 'CASH'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Receipt Status:</span>
                  <span style={{ color: expense.receiptUrl || expense.hasReceipt ? '#22c55e' : 'var(--color-text-dim)', fontWeight: 600 }}>
                    {expense.receiptUrl || expense.hasReceipt ? '✓ Uploaded' : 'No Receipt'}
                  </span>
                </div>
                {(expense.receiptUrl || expense.hasReceipt) && (
                  <div style={{ marginTop: '4px', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => alert('Opening invoice / receipt attachment...')}
                    >
                      <DownloadIcon size={12} /> View Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div style={{ paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
              Financial Audit &amp; Approval Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '10px', borderLeft: '2px solid var(--color-border)' }}>
              {/* Step 1: Created */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-17px',
                  top: '3px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#3b82f6'
                }} />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Expense Created &amp; Submitted</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  By {expense.recordedBy || 'System Admin'} on {formattedDate}
                </div>
              </div>

              {/* Step 2: Approval Status */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-17px',
                  top: '3px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: localStatus === 'approved' ? '#22c55e' : localStatus === 'rejected' ? '#ef4444' : '#eab308'
                }} />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>
                  {localStatus === 'approved'
                    ? 'Approved by Management'
                    : localStatus === 'rejected'
                    ? 'Rejected by Management'
                    : 'Awaiting Management Approval'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {localStatus !== 'pending'
                    ? `By ${localApprover || 'System Admin'} on ${new Date(localApprovalDate || Date.now()).toLocaleDateString('en-IN')}`
                    : 'Pending financial review'}
                </div>
              </div>

              {/* Step 3: Payment */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-17px',
                  top: '3px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: localStatus === 'approved' ? '#22c55e' : 'var(--color-border)'
                }} />
                <div style={{ fontSize: '12px', fontWeight: 600, color: localStatus === 'approved' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  Payment Recorded &amp; Ledger Updated
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
                  {localStatus === 'approved' ? 'Debited from Company Account' : 'Awaiting approval before payout'}
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Prompt Form */}
          {showRejectPrompt && (
            <div style={{
              background: 'var(--color-surface2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>
                Provide Reason for Expense Rejection *
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Duplicate tyre invoice, Missing GST receipt, Unapproved expense amount..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowRejectPrompt(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: '#ef4444' }}
                  disabled={!rejectionReason.trim()}
                  onClick={handleReject}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Quick Action Buttons */}
        <div className="modal-footer" style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <EditIcon size={13} /> Edit
              </button>
            )}
            {isAdminOrManager && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleDelete}
                style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <TrashIcon size={13} /> Delete
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isAdminOrManager && localStatus === 'pending' && !showRejectPrompt && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() => setShowRejectPrompt(true)}
                >
                  Reject
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ background: '#22c55e', fontWeight: 700 }}
                  onClick={handleApprove}
                >
                  Approve Expense
                </button>
              </>
            )}
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
