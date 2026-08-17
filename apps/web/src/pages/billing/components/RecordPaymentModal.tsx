import React, { useState } from 'react';
import { useRecordPayment, useInvoices, useCustomers } from '@hooks/useERP';
import {
  XIcon, DollarIcon, CheckIcon, BuildingIcon, ReceiptIcon,
  CalendarIcon, FileTextIcon
} from '@components/common/Icons';

interface RecordPaymentModalProps {
  invoice?: any;
  onClose: () => void;
}

export default function RecordPaymentModal({ invoice, onClose }: RecordPaymentModalProps) {
  const recordPaymentMut = useRecordPayment();

  const { data: invoiceData } = useInvoices({ limit: 100 });
  const { data: customerData } = useCustomers({ limit: 100 });

  const invoices = Array.isArray(invoiceData?.items) ? invoiceData.items : [];
  const customers = Array.isArray(customerData?.items) ? customerData.items : [];

  const [invoiceId, setInvoiceId] = useState(invoice?.id || '');
  const [customerId, setCustomerId] = useState(invoice?.customerId || invoice?.customer?.id || '');
  const [amount, setAmount] = useState(
    invoice?.balanceDue ? String(invoice.balanceDue) : invoice?.grandTotal ? String(invoice.grandTotal) : '50000'
  );
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('HDFC Bank - 502000123456');
  const [notes, setNotes] = useState('');

  // Handle invoice selection
  const handleInvoiceChange = (selectedId: string) => {
    setInvoiceId(selectedId);
    const selectedInv = invoices.find((i: any) => i.id === selectedId);
    if (selectedInv) {
      if (selectedInv.customerId || selectedInv.customer?.id) {
        setCustomerId(selectedInv.customerId || selectedInv.customer?.id);
      }
      if (selectedInv.balanceDue) {
        setAmount(String(selectedInv.balanceDue));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await recordPaymentMut.mutateAsync({
        invoiceId: invoiceId || undefined,
        customerId: customerId || undefined,
        amount: Number(amount),
        paymentDate: new Date(paymentDate).toISOString(),
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        bankAccount: bankAccount || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      // Handled
    }
  };

  const isSaving = recordPaymentMut.isPending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(34,197,94,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
            }}>
              <DollarIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                Record Customer Payment
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Post collections against invoice and update customer outstanding balance
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>

            <div className="form-group">
              <label className="form-label">Settle Invoice</label>
              <select
                className="form-select"
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
              >
                <option value="">-- General Payment / On-Account Deposit --</option>
                {invoices.map((inv: any) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.customer?.name} (Due: ₹{Number(inv.balanceDue || inv.grandTotal).toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Customer</label>
              <select
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Payment Amount (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="number"
                  step="1"
                  className="form-input"
                  placeholder="e.g. 50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontWeight: 800, fontSize: '15px', color: '#22c55e' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="upi">UPI (GPay / PhonePe / QR)</option>
                  <option value="bank_transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="cash">Cash Collection</option>
                  <option value="cheque">Cheque Deposit</option>
                  <option value="other">Fuel Card / Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">UTR / Cheque / Ref Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. UTR-982142981"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Deposited To Bank Account</label>
              <select
                className="form-select"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
              >
                <option value="HDFC Bank - 502000123456">HDFC Bank (Current A/c: 502000123456)</option>
                <option value="ICICI Bank - 001205008912">ICICI Bank (Current A/c: 001205008912)</option>
                <option value="State Bank of India - 33129841029">State Bank of India (Cash Credit: 33129841029)</option>
                <option value="Cash-in-Hand">Cash-in-Hand Drawer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Collection Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="e.g. Part payment received via UPI from manager Mr. Arun Kumar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="confirm-payment-btn"
              disabled={isSaving}
              style={{ background: '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              {isSaving ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Processing...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
