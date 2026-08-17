import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/auth.store';
import { useTrips, useCreateExpense, useUpdateExpense } from '@hooks/useERP';
import { expenseApi } from '@api/index';
import {
  XIcon, DollarIcon, MapPinIcon, TruckIcon,
  CameraIcon, FileTextIcon, CheckIcon, CheckCircleIcon,
  PaperclipIcon
} from '@components/common/Icons';

export const EXPENSE_CATEGORIES = [
  { value: 'toll', label: 'Toll (FASTag / Cash)', icon: '🛣️' },
  { value: 'driver_allowance', label: 'Driver Allowance & Food', icon: '🍽️' },
  { value: 'repair', label: 'Vehicle Repair & Labor', icon: '🔧' },
  { value: 'tyre_replacement', label: 'Tyre Replacement / Puncture', icon: '🛞' },
  { value: 'fuel', label: 'Fuel / AdBlue Top-up', icon: '⛽' },
  { value: 'parking', label: 'Parking & Halting Fee', icon: '🅿️' },
  { value: 'loading_unloading', label: 'Loading / Unloading Charges', icon: '📦' },
  { value: 'weighbridge', label: 'Weighbridge Fee', icon: '⚖️' },
  { value: 'rto_fine', label: 'RTO / Police Clearance', icon: '👮' },
  { value: 'accommodation', label: 'Accommodation / Stay', icon: '🏨' },
  { value: 'miscellaneous', label: 'Miscellaneous / Other', icon: '📋' },
];

export const PAYMENT_METHODS = [
  'Cash (Trip Advance)',
  'Driver UPI / GPay',
  'FASTag Electronic Toll',
  'Company Fuel Card',
  'Direct Bank Transfer',
];

interface DriverExpenseFormModalProps {
  expense?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DriverExpenseFormModal({ expense, onClose, onSuccess }: DriverExpenseFormModalProps) {
  const { user } = useAuthStore();
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();

  const { data: tripData } = useTrips({
    driverId: user?.driverId || undefined,
    limit: 50,
  });
  const trips = tripData?.items || [];

  const isEdit = Boolean(expense?.id);

  const [category, setCategory] = useState(expense?.category || 'toll');
  const [amount, setAmount] = useState(expense?.amount ? String(expense.amount) : '');
  const [date, setDate] = useState(expense?.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [tripId, setTripId] = useState(expense?.tripId || expense?.trip?.id || '');
  const [location, setLocation] = useState(expense?.location || '');
  const [paymentMethod, setPaymentMethod] = useState(expense?.paymentMethod || 'Cash (Trip Advance)');
  const [vendorName, setVendorName] = useState(expense?.vendorName || '');
  const [referenceNumber, setReferenceNumber] = useState(expense?.referenceNumber || '');
  const [description, setDescription] = useState(expense?.description || '');
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(expense?.receiptUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected trip details
  const selectedTrip = trips.find((t: any) => t.id === tripId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount in ₹');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        category,
        amount: numAmount,
        date,
        tripId: tripId || undefined,
        vehicleId: selectedTrip?.vehicleId || selectedTrip?.vehicle?.id || undefined,
        location: location.trim() || undefined,
        paymentMethod,
        vendorName: vendorName.trim() || undefined,
        referenceNumber: referenceNumber.trim() || undefined,
        description: description.trim() || undefined,
      };

      let resultId = expense?.id;
      if (isEdit) {
        await updateMutation.mutateAsync({ id: expense.id, data: payload });
      } else {
        const created = await createMutation.mutateAsync(payload);
        resultId = created?.id;
      }

      // If a receipt file was uploaded
      if (receiptFile && resultId) {
        try {
          await expenseApi.uploadReceipt(resultId, receiptFile);
        } catch (uploadErr) {
          console.warn('Receipt upload notice:', uploadErr);
        }
      }

      toast.success(isEdit ? 'Expense claim updated' : 'Expense logged successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save expense claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <DollarIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                {isEdit ? `Edit Expense Claim #${expense?.expenseNumber || expense?.id?.slice(0, 8)}` : 'Log New Trip Expense'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Submit receipts for Toll, Food, Repairs, Fuel or Loading fees
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Section 1: Basic Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Expense Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="form-select"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.icon} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Amount Claimed (₹) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="e.g. 1500"
                  className="form-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ fontSize: '15px', fontWeight: 700, color: '#f97316' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Expense Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / Toll Plaza / Depot</label>
                <input
                  type="text"
                  placeholder="e.g. Ulundurpet Toll NH45"
                  className="form-input"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Section 2: Trip & Vehicle Linking */}
            <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={16} color="#f97316" /> Linked Trip &amp; Vehicle
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Select Assigned Trip</label>
                  <select
                    className="form-select"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                  >
                    <option value="">— Standalone / Depot Expense —</option>
                    {trips.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.tripNumber} ({t.origin} ➔ {t.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Lorry Registration</label>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={selectedTrip?.vehicle?.registrationNumber || selectedTrip?.vehicleNumber || 'TN72BT7517'}
                    style={{ fontFamily: 'monospace', fontWeight: 700, background: 'var(--color-surface)', color: 'var(--color-text)' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Payment & Vendor Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Vendor / Shop Name</label>
                <input
                  type="text"
                  placeholder="e.g. TVS Tyre Care"
                  className="form-input"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bill / Receipt Ref No.</label>
                <input
                  type="text"
                  placeholder="e.g. RCP-8492"
                  className="form-input"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Section 4: Receipt / Bill Upload Box */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Upload Bill / Cash Receipt / FASTag Slip</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Photo or PDF</span>
              </label>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                background: 'var(--color-surface2)',
                cursor: 'pointer',
                position: 'relative',
              }}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                  }}
                />

                {receiptPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <img
                      src={receiptPreview}
                      alt="Receipt Preview"
                      style={{ height: '56px', width: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>
                        ✓ {receiptFile?.name || 'receipt_document.jpg'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Click to replace bill photo</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(249,115,22,0.15)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CameraIcon size={17} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                      Click or drag receipt photo / bill slip
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                      Supports JPG, PNG, PDF up to 10MB
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Expense Description / Purpose</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Explain the reason for the expense (e.g. Front left tyre punctured on NH45, replaced with tube vulcanization)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

          </div>

          {/* Modal Footer */}
          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                background: '#f97316',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 700,
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Saving Claim...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> {isEdit ? 'Update Expense Claim' : 'Submit for Approval'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
