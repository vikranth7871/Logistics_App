import React, { useState } from 'react';
import { useCreateMaintenance, useUpdateMaintenance, useVehicles } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  XIcon, WrenchIcon, CheckIcon, PaperclipIcon, TruckIcon,
  CalendarIcon, BuildingIcon, ClockIcon, DollarIcon, AlertTriangleIcon,
  FileTextIcon
} from '@components/common/Icons';

export const MAINTENANCE_TYPES = [
  { value: 'servicing', label: 'General Service', categoryBadge: 'General', icon: '🔧', color: '#3b82f6' },
  { value: 'oil_change', label: 'Oil Change', categoryBadge: 'Routine', icon: '💧', color: '#f59e0b' },
  { value: 'tyre_replacement', label: 'Tyre Replacement', categoryBadge: 'Replacement', icon: '🔘', color: '#ec4899' },
  { value: 'battery_replacement', label: 'Battery Replacement', categoryBadge: 'Replacement', icon: '🔋', color: '#eab308' },
  { value: 'brake_repair', label: 'Brake Inspection / Repair', categoryBadge: 'Inspection', icon: '🛑', color: '#ef4444' },
  { value: 'engine_repair', label: 'Engine Repair', categoryBadge: 'Major', icon: '⚙️', color: '#8b5cf6' },
  { value: 'electrical_repair', label: 'Electrical Repair', categoryBadge: 'Electrical', icon: '⚡', color: '#06b6d4' },
  { value: 'inspection', label: 'Safety / RTO Inspection', categoryBadge: 'Inspection', icon: '📋', color: '#10b981' },
  { value: 'accident_repair', label: 'Accident Repair & Bodywork', categoryBadge: 'Bodywork', icon: '🚗', color: '#f43f5e' },
  { value: 'other', label: 'Other Repairs', categoryBadge: 'Other', icon: '🛠️', color: '#64748b' },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority', color: '#94a3b8' },
  { value: 'medium', label: 'Medium Priority', color: '#3b82f6' },
  { value: 'high', label: 'High Priority', color: '#f59e0b' },
  { value: 'critical', label: 'Critical / Urgent', color: '#ef4444' },
];

interface MaintenanceFormModalProps {
  editRecord?: any;
  onClose: () => void;
}

export default function MaintenanceFormModal({ editRecord, onClose }: MaintenanceFormModalProps) {
  const { user } = useAuthStore();
  const isEdit = Boolean(editRecord);

  const createMut = useCreateMaintenance();
  const updateMut = useUpdateMaintenance();

  const { data: vehicleData } = useVehicles({ limit: 100 });
  const vehicles = Array.isArray(vehicleData?.items) ? vehicleData.items : [];

  // State
  const [maintenanceId] = useState(
    editRecord?.maintenanceId || `MNT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [vehicleId, setVehicleId] = useState(editRecord?.vehicleId || editRecord?.vehicle?.id || '');
  const [type, setType] = useState(editRecord?.type || 'servicing');
  const [priority, setPriority] = useState(editRecord?.priority || 'medium');
  const [serviceDate, setServiceDate] = useState(
    editRecord?.serviceDate ? new Date(editRecord.serviceDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [description, setDescription] = useState(editRecord?.description || '');
  const [odometerReading, setOdometerReading] = useState(editRecord?.odometerReading ? String(editRecord.odometerReading) : '');
  const [cost, setCost] = useState(editRecord?.cost ? String(editRecord.cost) : '');
  const [vendorName, setVendorName] = useState(editRecord?.vendorName || '');
  const [vendorLocation, setVendorLocation] = useState(editRecord?.vendorLocation || '');
  const [vendorPhone, setVendorPhone] = useState(editRecord?.vendorPhone || '');
  const [nextDueDate, setNextDueDate] = useState(editRecord?.nextDueDate || '');
  const [nextDueOdometer, setNextDueOdometer] = useState(editRecord?.nextDueOdometer ? String(editRecord.nextDueOdometer) : '');
  const [status, setStatus] = useState(editRecord?.status || 'scheduled');
  const [invoiceNumber, setInvoiceNumber] = useState(editRecord?.invoiceNumber || '');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!vehicleId) errs.vehicleId = 'Vehicle is required';
    if (!type) errs.type = 'Maintenance type is required';
    if (!serviceDate) errs.serviceDate = 'Service date is required';
    if (!description.trim()) errs.description = 'Description / Problem report is required';
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
      maintenanceId,
      vehicleId,
      type,
      priority,
      status,
      serviceDate: new Date(serviceDate).toISOString(),
      description: description.trim(),
      odometerReading: odometerReading ? Number(odometerReading) : undefined,
      cost: cost ? Number(cost) : 0,
      vendorName: vendorName.trim() || undefined,
      vendorLocation: vendorLocation.trim() || undefined,
      vendorPhone: vendorPhone.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      nextDueDate: nextDueDate || undefined,
      nextDueOdometer: nextDueOdometer ? Number(nextDueOdometer) : undefined,
    };

    try {
      if (isEdit && editRecord?.id) {
        await updateMut.mutateAsync({ id: editRecord.id, data: payload });
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
              <WrenchIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                {isEdit ? 'Edit Maintenance Task' : 'Schedule Vehicle Maintenance'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>{maintenanceId}</span>
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

            {/* Section 1: Vehicle & Schedule Info */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={13} /> 1. Vehicle &amp; Schedule Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="form-select"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    style={{ borderColor: errors.vehicleId ? '#ef4444' : undefined }}
                  >
                    <option value="">-- Select Fleet Vehicle --</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} — {v.make} {v.model} ({v.currentOdometer ? `${Number(v.currentOdometer).toLocaleString()} km` : ''})
                      </option>
                    ))}
                  </select>
                  {errors.vehicleId && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.vehicleId}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Maintenance Type <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {MAINTENANCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date &amp; Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    style={{ borderColor: errors.serviceDate ? '#ef4444' : undefined }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Odometer (km)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 48250"
                    value={odometerReading}
                    onChange={(e) => setOdometerReading(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">Description / Problem Reported <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Describe the service items, reported issues (e.g. Front axle brake noise, Clutch slippage, 50,000 km routine engine oil & filter service)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ borderColor: errors.description ? '#ef4444' : undefined }}
                />
                {errors.description && <div style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>{errors.description}</div>}
              </div>
            </div>

            {/* Section 2: Vendor & Workshop Info */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BuildingIcon size={13} /> 2. Service Station / Workshop Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Workshop / Vendor Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sai Motors, ABC Tyres, TVS Service..."
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Workshop Location / City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Madurai, TN / Coimbatore Bypass"
                    value={vendorLocation}
                    onChange={(e) => setVendorLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Contact Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +91 98421 00123"
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated / Actual Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g. 8500"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    style={{ fontWeight: 700, color: '#f97316' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Next Service Schedule Target */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarIcon size={13} /> 3. Next Service Due Targets
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Next Service Date Target</label>
                  <input
                    type="date"
                    className="form-input"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Next Service Odometer Target (km)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 72100"
                    value={nextDueOdometer}
                    onChange={(e) => setNextDueOdometer(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Invoice No. (if completed)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. INV-2026-8812"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Document Upload */}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PaperclipIcon size={13} /> 4. Service Invoice / Job Card Document
              </div>
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
                    Attach Service Bill, Job Card, or Part Invoices (PNG, JPG, PDF up to 10MB)
                  </div>
                </div>
                {documentFile && (
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckIcon size={13} /> Attached
                  </span>
                )}
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
              id="maintenance-save-btn"
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
                  {isEdit ? 'Save Changes' : 'Schedule Maintenance'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
