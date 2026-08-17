import React from 'react';
import {
  XIcon, DollarIcon, MapPinIcon, TruckIcon,
  CalendarIcon, FileTextIcon, CheckCircleIcon,
  AlertCircleIcon, ClockIcon, DownloadIcon,
  EditIcon, TrashIcon, CameraIcon, PaperclipIcon
} from '@components/common/Icons';

interface DriverExpenseDetailModalProps {
  expense: any;
  onClose: () => void;
  onEdit?: (expense: any) => void;
  onDelete?: (expense: any) => void;
}

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  toll: { label: 'Toll (FASTag / Cash)', icon: '🛣️' },
  driver_allowance: { label: 'Driver Allowance & Food', icon: '🍽️' },
  repair: { label: 'Vehicle Repair & Labor', icon: '🔧' },
  tyre_replacement: { label: 'Tyre Replacement', icon: '🛞' },
  fuel: { label: 'Fuel Top-up', icon: '⛽' },
  parking: { label: 'Parking & Halting', icon: '🅿️' },
  loading_unloading: { label: 'Loading / Unloading', icon: '📦' },
  weighbridge: { label: 'Weighbridge Fee', icon: '⚖️' },
  rto_fine: { label: 'RTO / Police Fine', icon: '👮' },
  accommodation: { label: 'Accommodation', icon: '🏨' },
  miscellaneous: { label: 'Miscellaneous', icon: '📋' },
};

export default function DriverExpenseDetailModal({
  expense,
  onClose,
  onEdit,
  onDelete,
}: DriverExpenseDetailModalProps) {
  if (!expense) return null;

  const status = expense.approvalStatus || expense.status || 'pending';
  const categoryInfo = CATEGORY_MAP[expense.category] || {
    label: (expense.category || 'General Expense').replace(/_/g, ' '),
    icon: '💰',
  };

  const isPending = status === 'pending' || status === 'draft';
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarIcon size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '17px', fontWeight: 800, fontFamily: 'monospace', color: '#f97316' }}>
                  {expense.expenseNumber || `EXP-${expense.id?.slice(0, 5).toUpperCase() || '00021'}`}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  {isApproved ? '🟢 Approved' : isRejected ? '🔴 Rejected' : '🟡 Pending Approval'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Submitted on {new Date(expense.date || expense.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

          {/* Amount & Category Banner */}
          <div style={{
            background: 'var(--color-surface2)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                CATEGORY &amp; PURPOSE
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{categoryInfo.icon}</span> {categoryInfo.label}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                TOTAL CLAIM AMOUNT
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f97316', marginTop: '2px' }}>
                ₹{Number(expense.amount || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Linked Trip & Vehicle Specifications */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Assigned Freight Trip</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px', fontFamily: 'monospace' }}>
                {expense.trip?.tripNumber || expense.tripNumber || 'TRP-26-00003'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {expense.trip?.origin || 'cbe'} ➔ {expense.trip?.destination || 'tvl'}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Vehicle Registration</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px', fontFamily: 'monospace' }}>
                {expense.vehicle?.registrationNumber || expense.vehicleNumber || 'TN72BT7517'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Ashok Leyland 4220
              </div>
            </div>
          </div>

          {/* Payment & Location Meta */}
          <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>PAYMENT METHOD</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '3px' }}>
                {expense.paymentMethod || 'Cash (Trip Advance)'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>VENDOR / SHOP</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '3px' }}>
                {expense.vendorName || 'TVS Tyre Care'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>BILL / REF NO.</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '3px', fontFamily: 'monospace' }}>
                {expense.referenceNumber || 'RCP-84920'}
              </div>
            </div>
          </div>

          {/* Description */}
          {expense.description && (
            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>EXPENSE DESCRIPTION</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text)', marginTop: '4px', lineHeight: 1.5 }}>
                {expense.description}
              </div>
            </div>
          )}

          {/* Receipt Proof Section */}
          <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PaperclipIcon size={15} color="#f97316" /> Bill / Cash Receipt Attachment
              </div>

              {expense.receiptUrl && (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <DownloadIcon size={13} /> View / Download Bill
                </a>
              )}
            </div>

            {expense.receiptUrl ? (
              <div style={{ textAlign: 'center', padding: '10px', background: 'var(--color-surface)', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                <img
                  src={expense.receiptUrl}
                  alt="Expense receipt"
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
              </div>
            ) : (
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(245,158,11,0.06)', border: '1px dashed rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CameraIcon size={18} color="#f59e0b" />
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                  ⚠️ No receipt photo attached. Verification may require physical bill voucher.
                </span>
              </div>
            )}
          </div>

          {/* Approval / Rejection Information */}
          <div style={{
            background: isApproved
              ? 'rgba(34,197,94,0.08)'
              : isRejected
              ? 'rgba(239,68,68,0.08)'
              : 'rgba(245,158,11,0.08)',
            border: `1px solid ${
              isApproved
                ? 'rgba(34,197,94,0.25)'
                : isRejected
                ? 'rgba(239,68,68,0.25)'
                : 'rgba(245,158,11,0.25)'
            }`,
            padding: '14px',
            borderRadius: '8px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: isApproved ? '#22c55e' : isRejected ? '#ef4444' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              {isApproved ? <CheckCircleIcon size={16} /> : isRejected ? <AlertCircleIcon size={16} /> : <ClockIcon size={16} />}
              {isApproved ? 'Approval Audit Confirmation' : isRejected ? 'Rejection Notice' : 'Workflow Status'}
            </div>

            {isApproved && (
              <div style={{ fontSize: '12px', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>Approved by: <strong style={{ color: '#22c55e' }}>{expense.approvedBy || 'System Admin'}</strong></div>
                <div>Approved on: <strong>{expense.approvedAt ? new Date(expense.approvedAt).toLocaleDateString('en-IN') : '12 Aug 2026'}</strong></div>
                <div style={{ marginTop: '2px', color: 'var(--color-text-muted)' }}>
                  Remarks: {expense.approvalRemarks || 'Approved for trip-related tyre replacement.'}
                </div>
              </div>
            )}

            {isRejected && (
              <div style={{ fontSize: '12px', color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div>Rejected by: <strong style={{ color: '#ef4444' }}>{expense.rejectedBy || 'Fleet Operations Manager'}</strong></div>
                <div>Rejected on: <strong>{expense.rejectedAt ? new Date(expense.rejectedAt).toLocaleDateString('en-IN') : '12 Aug 2026'}</strong></div>
                <div style={{ marginTop: '2px', color: '#ef4444', fontWeight: 600 }}>
                  Reason: {expense.rejectionReason || 'Receipt amount does not match the submitted amount.'}
                </div>
              </div>
            )}

            {isPending && (
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                This expense is currently queued for audit and reimbursement review by the fleet accounting team.
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>

          {isPending && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {onDelete && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    onClose();
                    onDelete(expense);
                  }}
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <TrashIcon size={14} /> Withdraw Claim
                </button>
              )}

              {onEdit && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onEdit(expense);
                  }}
                  style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}
                >
                  <EditIcon size={14} /> Edit Expense
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
