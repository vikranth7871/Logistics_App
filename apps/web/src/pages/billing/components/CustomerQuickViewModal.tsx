import React from 'react';
import {
  XIcon, BuildingIcon, DollarIcon, WalletIcon, ReceiptIcon,
  PhoneIcon, MailIcon, MapPinIcon, AlertTriangleIcon, CheckCircleIcon
} from '@components/common/Icons';

interface CustomerQuickViewModalProps {
  customerName: string;
  onClose: () => void;
  onViewFullProfile?: () => void;
}

export default function CustomerQuickViewModal({
  customerName,
  onClose,
  onViewFullProfile,
}: CustomerQuickViewModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316'
            }}>
              <BuildingIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                {customerName}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Customer Credit &amp; Outstanding Balance Snapshot
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '18px' }}>
          {/* Financials Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Invoiced</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text)', marginTop: '2px' }}>
                ₹8,50,000
              </div>
              <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '2px' }}>7 Lifetime Invoices</div>
            </div>

            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Total Collected</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>
                ₹6,20,000
              </div>
              <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>73% Paid</div>
            </div>

            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Outstanding Due</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                ₹2,30,000
              </div>
              <div style={{ fontSize: '10px', color: '#f87171', marginTop: '2px' }}>2 Unpaid Invoices</div>
            </div>

            <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Credit Limit</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#f97316', marginTop: '2px' }}>
                ₹5,00,000
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>₹2,70,000 Available</div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0, fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Primary Contact:</span>
              <span style={{ fontWeight: 600 }}>Arun Kumar (Logistics Mgr)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Phone:</span>
              <span style={{ fontWeight: 600, color: '#f97316' }}>+91 99441 12233</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
              <span>Coimbatore, Tamil Nadu</span>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
