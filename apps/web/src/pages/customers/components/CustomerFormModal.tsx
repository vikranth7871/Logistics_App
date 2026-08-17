import React, { useState } from 'react';
import { useCreateCustomer, useUpdateCustomer } from '@hooks/useERP';
import {
  XIcon, BuildingIcon, CheckIcon, PaperclipIcon, PhoneIcon,
  MailIcon, DollarIcon, FileTextIcon, UserCheckIcon, UsersIcon
} from '@components/common/Icons';

export const PAYMENT_TERMS_OPTIONS = [
  { value: 0, label: 'Due Immediately' },
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' },
  { value: 45, label: '45 Days' },
  { value: 60, label: '60 Days' },
];

interface CustomerFormModalProps {
  editCustomer?: any;
  existingCustomers?: any[];
  onClose: () => void;
}

export default function CustomerFormModal({
  editCustomer,
  existingCustomers = [],
  onClose,
}: CustomerFormModalProps) {
  const isEdit = Boolean(editCustomer);
  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();

  // Form state
  const [customerType, setCustomerType] = useState(editCustomer?.customerType || 'company');
  const [name, setName] = useState(editCustomer?.name || '');
  const [contactPerson, setContactPerson] = useState(editCustomer?.contactPerson || '');
  const [phone, setPhone] = useState(editCustomer?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState(editCustomer?.alternatePhone || '');
  const [email, setEmail] = useState(editCustomer?.email || '');
  const [gstNumber, setGstNumber] = useState(editCustomer?.gstNumber || '');
  const [panNumber, setPanNumber] = useState(editCustomer?.panNumber || '');
  const [address, setAddress] = useState(editCustomer?.address || '');
  const [city, setCity] = useState(editCustomer?.city || '');
  const [state, setState] = useState(editCustomer?.state || 'Tamil Nadu');
  const [pincode, setPincode] = useState(editCustomer?.pincode || '');
  const [creditLimit, setCreditLimit] = useState(editCustomer?.creditLimit ? String(editCustomer.creditLimit) : '500000');
  const [creditDays, setCreditDays] = useState(editCustomer?.creditDays || 30);
  const [status, setStatus] = useState(editCustomer?.status || (editCustomer?.isActive === false ? 'inactive' : 'active'));
  const [notes, setNotes] = useState(editCustomer?.notes || '');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Customer name is required';
    if (!phone.trim()) errs.phone = 'Primary phone number is required';
    if (!gstNumber.trim()) errs.gstNumber = 'GST number is required';

    // Duplicate customer prevention validation (Requirement 22)
    const upperGst = gstNumber.trim().toUpperCase();
    const isDuplicateGst = existingCustomers.some(
      (c) => c.id !== editCustomer?.id && c.gstNumber?.toUpperCase() === upperGst
    );
    if (isDuplicateGst) {
      errs.gstNumber = 'A customer with this GST Number already exists in the system';
    }

    const isDuplicatePhone = existingCustomers.some(
      (c) => c.id !== editCustomer?.id && c.phone === phone.trim()
    );
    if (isDuplicatePhone) {
      errs.phone = 'A customer with this phone number already exists';
    }

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
      customerType,
      name: name.trim(),
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim() || undefined,
      email: email.trim() || undefined,
      gstNumber: gstNumber.trim().toUpperCase(),
      panNumber: panNumber.trim().toUpperCase() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || 'Coimbatore',
      state: state.trim() || 'Tamil Nadu',
      pincode: pincode.trim() || undefined,
      creditLimit: Number(creditLimit) || 0,
      creditDays: Number(creditDays) || 30,
      isActive: status === 'active',
      status,
      notes: notes.trim() || undefined,
    };

    try {
      if (isEdit && editCustomer?.id) {
        await updateMut.mutateAsync({ id: editCustomer.id, data: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      // Handled by react-query
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
              <BuildingIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                {isEdit ? 'Edit Customer Profile' : 'Register New Customer'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Set up commercial billing, credit limits, and contact details
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px', padding: '20px' }}>

            {/* Section 1: Basic Info */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BuildingIcon size={13} /> 1. Customer &amp; Business Information
              </div>

              {/* Customer Type Selector */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                {['company', 'individual'].map((type) => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      background: customerType === type ? 'rgba(249,115,22,0.12)' : 'var(--color-surface2)',
                      border: customerType === type ? '1px solid #f97316' : '1px solid var(--color-border)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      color: customerType === type ? '#f97316' : 'var(--color-text)',
                      fontWeight: customerType === type ? 700 : 500,
                    }}
                  >
                    <input
                      type="radio"
                      name="customerType"
                      value={type}
                      checked={customerType === type}
                      onChange={() => setCustomerType(type)}
                      style={{ accentColor: '#f97316' }}
                    />
                    {type === 'company' ? '🏢 Corporate Company' : '👤 Individual / Trader'}
                  </label>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Customer / Business Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ABC Traders Pvt Ltd, Chennai Auto Parts Co..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ borderColor: errors.name ? '#ef4444' : undefined, fontWeight: 600 }}
                  />
                  {errors.name && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Arun Kumar (Logistics Mgr)"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Mobile Phone <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 9944112233"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ borderColor: errors.phone ? '#ef4444' : undefined }}
                  />
                  {errors.phone && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.phone}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Alternate Phone / Landline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 0422 2456789"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. accounts@abctraders.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Taxation & Location */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileTextIcon size={13} /> 2. GST, PAN &amp; Address Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">GST Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 33AABCA1234B1ZP"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    style={{ fontFamily: 'monospace', borderColor: errors.gstNumber ? '#ef4444' : undefined }}
                  />
                  {errors.gstNumber && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.gstNumber}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. AABCA1234B"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    style={{ fontFamily: 'monospace' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City / Town</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Coimbatore, Chennai..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Billing / Dispatch Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 142/A, Mill Road, Industrial Estate..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Financial & Credit Controls */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarIcon size={13} /> 3. Financial &amp; Credit Limits
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Credit Limit (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    className="form-input"
                    placeholder="e.g. 500000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    style={{ fontWeight: 700, color: '#f97316' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Terms (Credit Days)</label>
                  <select
                    className="form-select"
                    value={creditDays}
                    onChange={(e) => setCreditDays(Number(e.target.value))}
                  >
                    {PAYMENT_TERMS_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Customer Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="active">Active (Can create trips &amp; invoices)</option>
                    <option value="inactive">Inactive (Temporarily on hold)</option>
                    <option value="blocked">Blocked (Disallow new trips)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Document & Internal Notes */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PaperclipIcon size={13} /> 4. Documents &amp; Internal Notes
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">GST Certificate / Transport Agreement (PDF/Image)</label>
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
                        if (e.target.files?.[0]) setDocumentFile(e.target.files[0]);
                      }}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>
                      Upload GST certificate, PAN copy, or transport rate contract (PDF, PNG, JPG)
                    </div>
                  </div>
                  {documentFile && (
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckIcon size={13} /> Attached
                    </span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Management Notes (Not visible on invoices)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Special freight rates for Chennai-Coimbatore route. Payment cycle every 1st and 15th..."
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
              id="customer-save-btn"
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
                  {isEdit ? 'Save Changes' : 'Register Customer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
