import { useState } from 'react';
import { useCreateInvoice, useCustomers } from '@hooks/useERP';
import { TrashIcon, PlusIcon } from '@components/common/Icons';

interface Props {
  onClose: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function CreateInvoiceModal({ onClose }: Props) {
  const createInvoiceMutation = useCreateInvoice();
  const { data: customerData } = useCustomers({ limit: 100 });
  const customers = customerData?.items || [];

  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState('');
  const [gstRatePercent, setGstRatePercent] = useState<number>(18);
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days');
  const [notes, setNotes] = useState('');

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: 'Freight Services', quantity: 1, unitPrice: 0, amount: 0 },
  ]);

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    const item = { ...updated[index] };

    if (field === 'description') {
      item.description = value as string;
    } else {
      const numVal = Math.max(0, Number(value) || 0);
      if (field === 'quantity') item.quantity = numVal;
      if (field === 'unitPrice') item.unitPrice = numVal;
      item.amount = item.quantity * item.unitPrice;
    }

    updated[index] = item;
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: '', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  const taxTotal = (subtotal * (gstRatePercent || 0)) / 100;
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    await createInvoiceMutation.mutateAsync({
      customerId,
      invoiceDate,
      dueDate: dueDate || undefined,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
      gstRatePercent: Number(gstRatePercent) || 0,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        style={{ maxWidth: '650px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
      >
        <div className="modal-header">
          <span className="modal-title" id="invoice-modal-title">
            Create New Invoice
          </span>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="invoice-customer">
                Select Customer <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                id="invoice-customer"
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="invoice-date">
                  Invoice Date <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  type="date"
                  id="invoice-date"
                  className="form-input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="invoice-due-date">
                  Due Date
                </label>
                <input
                  type="date"
                  id="invoice-due-date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                Line Items <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 80px 110px 100px 32px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      placeholder="Unit Price (₹)"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                      required
                    />
                    <div style={{ fontWeight: 600, fontSize: '13px', textAlign: 'right', paddingRight: '4px' }}>
                      ₹{item.amount.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      onClick={() => removeLineItem(idx)}
                      disabled={lineItems.length === 1}
                      title="Remove item"
                    >
                      <TrashIcon size={14} color="var(--color-danger)" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={addLineItem}
              >
                <PlusIcon size={14} /> Add Line Item
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="invoice-gst">
                  GST Rate (%)
                </label>
                <select
                  id="invoice-gst"
                  className="form-select"
                  value={gstRatePercent}
                  onChange={(e) => setGstRatePercent(Number(e.target.value))}
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="invoice-terms">
                  Payment Terms
                </label>
                <input
                  type="text"
                  id="invoice-terms"
                  className="form-input"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>
            </div>

            {/* Totals Summary */}
            <div
              style={{
                background: 'var(--color-surface-hover)',
                borderRadius: '6px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-dim)' }}>
                <span>GST ({gstRatePercent}%):</span>
                <span>₹{taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '15px',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '6px',
                  marginTop: '2px',
                }}
              >
                <span>Grand Total:</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invoice-notes">
                Notes
              </label>
              <textarea
                id="invoice-notes"
                className="form-input"
                rows={2}
                placeholder="Optional notes or payment instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createInvoiceMutation.isPending || !customerId}
            >
              {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
