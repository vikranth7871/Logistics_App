import React, { useState, useEffect } from 'react';
import { useCreateInvoice, useCustomers, useTrips } from '@hooks/useERP';
import {
  XIcon, ReceiptIcon, TrashIcon, PlusIcon, CheckIcon,
  BuildingIcon, MapPinIcon, DollarIcon, TruckIcon
} from '@components/common/Icons';

interface Props {
  editInvoice?: any;
  onClose: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export default function CreateInvoiceModal({ editInvoice, onClose }: Props) {
  const createInvoiceMutation = useCreateInvoice();
  const { data: customerData } = useCustomers({ limit: 100 });
  const { data: tripData } = useTrips({ limit: 100 });

  const customers = Array.isArray(customerData?.items) ? customerData.items : [];
  const trips = Array.isArray(tripData?.items) ? tripData.items : [];

  const [invoiceNumber] = useState(
    editInvoice?.invoiceNumber || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [customerId, setCustomerId] = useState(editInvoice?.customerId || editInvoice?.customer?.id || '');
  const [tripId, setTripId] = useState(editInvoice?.tripId || editInvoice?.trip?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(
    editInvoice?.invoiceDate ? new Date(editInvoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    editInvoice?.dueDate ? new Date(editInvoice.dueDate).toISOString().split('T')[0] : ''
  );
  const [gstRatePercent, setGstRatePercent] = useState<number>(editInvoice?.gstRatePercent ?? 5);
  const [advanceAmount, setAdvanceAmount] = useState<string>(editInvoice?.advanceAmount ? String(editInvoice.advanceAmount) : '0');
  const [paymentTerms, setPaymentTerms] = useState(editInvoice?.paymentTerms || 'Payment due within 15 days');
  const [notes, setNotes] = useState(editInvoice?.notes || '');

  const [lineItems, setLineItems] = useState<LineItem[]>(
    editInvoice?.lineItems || [
      { description: 'Freight Services (Full Truck Load)', quantity: 1, unitPrice: 120000, amount: 120000 },
    ]
  );

  // Auto-fill Customer and Freight when Trip is selected
  const handleTripChange = (selectedTripId: string) => {
    setTripId(selectedTripId);
    if (selectedTripId) {
      const selectedTrip = trips.find((t: any) => t.id === selectedTripId);
      if (selectedTrip) {
        if (selectedTrip.customerId || selectedTrip.customer?.id) {
          setCustomerId(selectedTrip.customerId || selectedTrip.customer?.id);
        }
        if (selectedTrip.rate || selectedTrip.agreedRate || selectedTrip.totalFreight) {
          const freight = Number(selectedTrip.rate || selectedTrip.agreedRate || selectedTrip.totalFreight || 0);
          setLineItems([
            {
              description: `Freight Charges: ${selectedTrip.origin || 'Origin'} → ${selectedTrip.destination || 'Destination'} (${selectedTrip.tripNumber || selectedTrip.tripCode || 'Trip'})`,
              quantity: 1,
              unitPrice: freight,
              amount: freight,
            },
          ]);
        }
      }
    }
  };

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
  const advance = Number(advanceAmount) || 0;
  const grandTotal = Math.max(0, subtotal + taxTotal - advance);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a customer');
      return;
    }

    await createInvoiceMutation.mutateAsync({
      customerId,
      tripId: tripId || undefined,
      invoiceNumber,
      invoiceDate,
      dueDate: dueDate || undefined,
      lineItems: lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      })),
      gstRatePercent: Number(gstRatePercent) || 0,
      advanceAmount: advance,
      grandTotal,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  const isSaving = createInvoiceMutation.isPending;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316',
            }}>
              <ReceiptIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                {editInvoice ? 'Edit Freight Invoice' : 'Create Customer Invoice'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>{invoiceNumber}</span>
                <span> • Generate GST tax invoice from trip or standalone billing</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Trip Link & Customer Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Link Completed Trip (Auto-fills Freight &amp; Route)</label>
                <select
                  className="form-select"
                  value={tripId}
                  onChange={(e) => handleTripChange(e.target.value)}
                >
                  <option value="">-- Standalone / General Billing --</option>
                  {trips.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.tripNumber || t.tripCode || t.id.slice(0, 8)} ({t.origin} → {t.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Customer <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.gstNumber ? `(${c.gstNumber})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates & Terms */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Invoice Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GST Tax Rate (%)</label>
                <select
                  className="form-select"
                  value={gstRatePercent}
                  onChange={(e) => setGstRatePercent(Number(e.target.value))}
                >
                  <option value={0}>0% (Exempt / RCM)</option>
                  <option value={5}>5% (GTA Transport Service)</option>
                  <option value={12}>12% (Forward Charge)</option>
                  <option value={18}>18% (Standard Service)</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Invoice Line Items
                </span>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}
                >
                  <PlusIcon size={12} /> Add Item
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lineItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 80px 110px 110px 36px',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Item / Freight Description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    />
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      required
                      style={{ fontSize: '12px', textAlign: 'center' }}
                    />
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="Rate (₹)"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                      required
                      style={{ fontSize: '12px', textAlign: 'right' }}
                    />
                    <div
                      style={{
                        padding: '6px 8px',
                        background: 'var(--color-surface2)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textAlign: 'right',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      ₹{(item.amount || 0).toLocaleString('en-IN')}
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px', color: '#ef4444' }}
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Advance Deduction & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <div>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label">Payment Terms &amp; Bank Details</label>
                  <input
                    type="text"
                    className="form-input"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g. Due within 15 days via NEFT/RTGS"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes for Customer</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Vehicle registration, Driver contact, delivery confirmation notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Totals Summary Card */}
              <div
                style={{
                  background: 'var(--color-surface2)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>GST ({gstRatePercent}%):</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>₹{taxTotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)' }}>
                  <span>Advance Received (-):</span>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    style={{ width: '90px', padding: '3px 6px', fontSize: '11px', textAlign: 'right' }}
                  />
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '6px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800 }}>
                  <span>Net Balance Due:</span>
                  <span style={{ color: '#f97316' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
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
              id="submit-invoice-btn"
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              {isSaving ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Generating...
                </>
              ) : (
                <>
                  <CheckIcon size={16} />
                  {editInvoice ? 'Save Invoice' : 'Create & Issue Invoice'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
