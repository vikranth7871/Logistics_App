import React, { useState, useEffect } from 'react';
import { useCreateExpense, useUpdateExpense, useVehicles, useDrivers, useTrips } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  XIcon, DollarIcon, CheckIcon, PaperclipIcon, TruckIcon,
  UsersIcon, CalendarIcon, FileTextIcon, BuildingIcon, WrenchIcon
} from '@components/common/Icons';

export const EXPENSE_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance', icon: '🔧', color: '#f59e0b' },
  { value: 'fuel', label: 'Fuel', icon: '⛽', color: '#3b82f6' },
  { value: 'toll', label: 'Toll Charges', icon: '🛣️', color: '#a855f7' },
  { value: 'repair', label: 'Repair & Overhaul', icon: '⚙️', color: '#10b981' },
  { value: 'tyre_replacement', label: 'Tyres & Tubes', icon: '🔘', color: '#06b6d4' },
  { value: 'spare_parts', label: 'Spare Parts', icon: '🔩', color: '#ec4899' },
  { value: 'driver_allowance', label: 'Driver Allowance', icon: '👤', color: '#f97316' },
  { value: 'salary', label: 'Driver / Staff Salary', icon: '💼', color: '#8b5cf6' },
  { value: 'insurance', label: 'Insurance Premium', icon: '🛡️', color: '#6366f1' },
  { value: 'permit', label: 'Permit & Taxes', icon: '📄', color: '#14b8a6' },
  { value: 'parking', label: 'Parking / Halting', icon: '🅿️', color: '#84cc16' },
  { value: 'cleaning', label: 'Washing & Cleaning', icon: '🧼', color: '#38bdf8' },
  { value: 'battery', label: 'Battery & Electrical', icon: '🔋', color: '#eab308' },
  { value: 'loading_unloading', label: 'Loading / Unloading', icon: '📦', color: '#f43f5e' },
  { value: 'rto_fine', label: 'RTO / Traffic Fine', icon: '⚠️', color: '#ef4444' },
  { value: 'brokerage', label: 'Brokerage / Commission', icon: '🤝', color: '#64748b' },
  { value: 'weighbridge', label: 'Weighbridge Fee', icon: '⚖️', color: '#0ea5e9' },
  { value: 'miscellaneous', label: 'Other / Misc', icon: '📝', color: '#94a3b8' },
];

export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'fastag', label: 'FASTag' },
  { value: 'company_account', label: 'Company Account' },
];

interface ExpenseFormModalProps {
  editEntry?: any;
  onClose: () => void;
}

export default function ExpenseFormModal({ editEntry, onClose }: ExpenseFormModalProps) {
  const { user } = useAuthStore();
  const isEdit = Boolean(editEntry);

  const createMut = useCreateExpense();
  const updateMut = useUpdateExpense();

  const { data: vehicleData } = useVehicles({ limit: 100 });
  const { data: driverData } = useDrivers({ limit: 100 });
  const { data: tripData } = useTrips({ limit: 100 });

  const vehicles = Array.isArray(vehicleData?.items) ? vehicleData.items : [];
  const drivers = Array.isArray(driverData?.items) ? driverData.items : [];
  const trips = Array.isArray(tripData?.items) ? tripData.items : [];

  // Form State
  const [expenseId] = useState(
    editEntry?.expenseId || `EXP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [category, setCategory] = useState(editEntry?.category || 'maintenance');
  const [description, setDescription] = useState(editEntry?.description || '');
  const [amount, setAmount] = useState(editEntry?.amount ? String(editEntry.amount) : '');
  const [date, setDate] = useState(
    editEntry?.date ? new Date(editEntry.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [paymentMode, setPaymentMode] = useState(editEntry?.paymentMode || 'cash');
  const [paymentRef, setPaymentRef] = useState(editEntry?.paymentRef || '');
  const [vehicleId, setVehicleId] = useState(editEntry?.vehicleId || editEntry?.vehicle?.id || '');
  const [driverId, setDriverId] = useState(editEntry?.driverId || editEntry?.driver?.id || '');
  const [tripId, setTripId] = useState(editEntry?.tripId || editEntry?.trip?.id || '');
  const [odometer, setOdometer] = useState(editEntry?.odometer ? String(editEntry.odometer) : '');
  const [vendorName, setVendorName] = useState(editEntry?.vendorName || '');
  const [vendorPhone, setVendorPhone] = useState(editEntry?.vendorPhone || '');
  const [vendorInvoice, setVendorInvoice] = useState(editEntry?.vendorInvoice || '');
  const [notes, setNotes] = useState(editEntry?.notes || '');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill Vehicle and Driver when Trip is selected
  const handleTripChange = (selectedTripId: string) => {
    setTripId(selectedTripId);
    if (selectedTripId) {
      const selectedTrip = trips.find((t: any) => t.id === selectedTripId);
      if (selectedTrip) {
        if (selectedTrip.vehicleId || selectedTrip.vehicle?.id) {
          setVehicleId(selectedTrip.vehicleId || selectedTrip.vehicle?.id);
        }
        if (selectedTrip.driverId || selectedTrip.driver?.id) {
          setDriverId(selectedTrip.driverId || selectedTrip.driver?.id);
        }
      }
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!category) errs.category = 'Category is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!amount || Number(amount) <= 0) errs.amount = 'Valid amount (> 0) is required';
    if (!date) errs.date = 'Date & time is required';
    if (!paymentMode) errs.paymentMode = 'Payment mode is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload: any = {
      expenseId,
      category,
      description: description.trim(),
      amount: parseFloat(amount),
      date: new Date(date).toISOString(),
      paymentMode,
      paymentRef: paymentRef.trim() || undefined,
      vehicleId: vehicleId || undefined,
      driverId: driverId || undefined,
      tripId: tripId || undefined,
      odometer: odometer ? Number(odometer) : undefined,
      vendorName: vendorName.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      vendorInvoice: vendorInvoice.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit && editEntry?.id) {
        await updateMut.mutateAsync({ id: editEntry.id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      // Error handled by react-query toast
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
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
              color: '#f97316'
            }}>
              <DollarIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                {isEdit ? 'Edit Expense Record' : 'Record New Expense'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>{expenseId}</span>
                <span>•</span>
                <span>Created by {user?.name || 'System Admin'}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px' }}>

            {/* Section 1: Basic Details */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileTextIcon size={13} /> 1. Expense Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ borderColor: errors.category ? '#ef4444' : undefined }}
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 20000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ borderColor: errors.amount ? '#ef4444' : undefined, fontWeight: 700, fontSize: '14px', color: '#f97316' }}
                  />
                  {errors.amount && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.amount}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date & Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ borderColor: errors.date ? '#ef4444' : undefined }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">Description / Purpose <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tyre replacement MRF 10.00 R20, Clutch plate repair, Toll charges Madurai..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ borderColor: errors.description ? '#ef4444' : undefined }}
                />
                {errors.description && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.description}</div>}
              </div>
            </div>

            {/* Section 2: Vehicle, Driver & Trip Linkage */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={13} /> 2. Vehicle &amp; Trip Association
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Link Trip (Auto-populates Vehicle & Driver)</label>
                  <select
                    className="form-select"
                    value={tripId}
                    onChange={(e) => handleTripChange(e.target.value)}
                  >
                    <option value="">-- None / General Expense --</option>
                    {trips.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.tripNumber || t.tripCode || t.id.slice(0, 8)} ({t.origin} → {t.destination})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle</label>
                  <select
                    className="form-select"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} — {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Incurred</label>
                  <select
                    className="form-select"
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                  >
                    <option value="">-- Select Driver --</option>
                    {drivers.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.phone || 'Driver'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Odometer Reading (km)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 62100"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Vendor & Payment Details */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BuildingIcon size={13} /> 3. Vendor &amp; Payment Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Vendor / Workshop Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ABC Tyres, TVS Workshop..."
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Invoice / Bill No.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. INV-98421"
                    value={vendorInvoice}
                    onChange={(e) => setVendorInvoice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Ref / UTR No.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. UPI/12345678, CHQ-4021"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Document & Notes */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PaperclipIcon size={13} /> 4. Receipts &amp; Supporting Notes
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">Upload Receipt / Invoice (Image or PDF)</label>
                <div style={{
                  border: '1px dashed var(--color-border)',
                  borderRadius: '8px',
                  padding: '14px',
                  background: 'var(--color-surface2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <PaperclipIcon size={20} color="var(--color-text-muted)" />
                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ fontSize: '12px', color: 'var(--color-text)' }}
                      onChange={(e) => {
                        if (e.target.files?.[0]) setReceiptFile(e.target.files[0]);
                      }}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                      PNG, JPG, PDF up to 10MB
                    </div>
                  </div>
                  {receiptFile && (
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckIcon size={13} /> Attached
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Any warranty details, part serial numbers, or approval remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
              id="expense-save-btn"
              disabled={isSaving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              {isSaving ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon size={16} />
                  {isEdit ? 'Save Changes' : 'Record Expense'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
