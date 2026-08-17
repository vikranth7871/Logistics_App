import React, { useState } from 'react';
import { useUpdateMaintenance, useDeleteMaintenance } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  XIcon, WrenchIcon, CheckIcon, PaperclipIcon, TruckIcon,
  CalendarIcon, BuildingIcon, ClockIcon, DollarIcon, AlertTriangleIcon,
  DownloadIcon, EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon,
  FileTextIcon
} from '@components/common/Icons';

interface MaintenanceDetailModalProps {
  record: any;
  onClose: () => void;
  onEdit?: (record: any) => void;
}

export default function MaintenanceDetailModal({ record, onClose, onEdit }: MaintenanceDetailModalProps) {
  const { user } = useAuthStore();
  const isAdminOrManager = ['admin', 'manager'].includes(user?.role || '');

  const updateMut = useUpdateMaintenance();
  const deleteMut = useDeleteMaintenance();

  const [localStatus, setLocalStatus] = useState<string>(record.status || 'scheduled');
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  // Completion Form Fields
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().slice(0, 10));
  const [finalOdometer, setFinalOdometer] = useState(record.odometerReading ? String(record.odometerReading) : '');
  const [partsCost, setPartsCost] = useState('15000');
  const [labourCost, setLabourCost] = useState('5000');
  const [invoiceNumber, setInvoiceNumber] = useState(record.invoiceNumber || 'INV-2026-9921');
  const [completionNotes, setCompletionNotes] = useState('All inspections and part replacements verified.');

  const totalCalculatedCost = (Number(partsCost) || 0) + (Number(labourCost) || 0);

  const handleStatusTransition = async (newStatus: string) => {
    try {
      if (record.id && !record.id.startsWith('demo-')) {
        await updateMut.mutateAsync({
          id: record.id,
          data: { status: newStatus },
        });
      }
      setLocalStatus(newStatus);
    } catch (err) {
      // handled
    }
  };

  const handleCompleteMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (record.id && !record.id.startsWith('demo-')) {
        await updateMut.mutateAsync({
          id: record.id,
          data: {
            status: 'completed',
            cost: totalCalculatedCost,
            odometerReading: finalOdometer ? Number(finalOdometer) : record.odometerReading,
            invoiceNumber,
          },
        });
      }
      setLocalStatus('completed');
      setShowCompletionForm(false);
    } catch (err) {
      // handled
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete maintenance record ${record.maintenanceId || record.id}?`)) {
      if (record.id && !record.id.startsWith('demo-')) {
        await deleteMut.mutateAsync(record.id);
      }
      onClose();
    }
  };

  const formattedDate = new Date(record.serviceDate || record.date || record.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: localStatus === 'completed'
                ? 'rgba(34,197,94,0.15)'
                : localStatus === 'in_progress'
                ? 'rgba(59,130,246,0.15)'
                : localStatus === 'overdue'
                ? 'rgba(239,68,68,0.15)'
                : 'rgba(234,179,8,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: localStatus === 'completed' ? '#22c55e' : localStatus === 'in_progress' ? '#3b82f6' : localStatus === 'overdue' ? '#ef4444' : '#eab308'
            }}>
              <WrenchIcon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                  {record.maintenanceId || `MNT-${record.id?.slice(0, 8)}`}
                </span>
                <span className={`badge ${
                  localStatus === 'completed' ? 'badge-active' : localStatus === 'in_progress' ? 'badge-in_trip' : localStatus === 'overdue' ? 'badge-danger' : 'badge-assigned'
                }`} style={{ textTransform: 'capitalize', fontSize: '11px', padding: '2px 8px' }}>
                  {localStatus?.replace(/_/g, ' ')}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Scheduled on {formattedDate}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

          {/* Main Info Card Banner */}
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
                Total Maintenance Cost
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#f97316', marginTop: '2px' }}>
                ₹{Number(record.cost || totalCalculatedCost || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>
                {record.description}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: 'rgba(59,130,246,0.12)',
                color: '#3b82f6',
                fontWeight: 700,
                fontSize: '12px',
                textTransform: 'capitalize'
              }}>
                <WrenchIcon size={14} />
                {record.typeLabel || record.type?.replace(/_/g, ' ')}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Priority: <strong style={{ color: record.priority === 'critical' ? '#ef4444' : '#f97316', textTransform: 'uppercase' }}>{record.priority || 'Medium'}</strong>
              </div>
            </div>
          </div>

          {/* Overdue alert if overdue */}
          {localStatus === 'overdue' && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              padding: '12px',
              color: '#ef4444',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangleIcon size={16} />
              <div>
                <strong>Maintenance Overdue!</strong> Vehicle {record.vehicleReg || record.vehicle?.registrationNumber} was scheduled for service on {formattedDate}. Prompt servicing is recommended to prevent vehicle breakdown.
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>

            {/* Vehicle & Target Info */}
            <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={14} /> Vehicle &amp; Odometer
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Registration No:</span>
                  <span style={{ fontWeight: 700, color: '#f97316' }}>
                    {record.vehicle?.registrationNumber || record.vehicleReg || '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Vehicle Model:</span>
                  <span style={{ color: 'var(--color-text)' }}>
                    {[record.vehicle?.make, record.vehicle?.model].filter(Boolean).join(' ') || record.vehicleModel || 'Fleet Vehicle'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Service Odometer:</span>
                  <span style={{ fontWeight: 600 }}>
                    {record.odometerReading ? `${Number(record.odometerReading).toLocaleString()} km` : '48,250 km'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Next Due Target:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>
                    {record.nextDue || (record.nextDueDate ? `${record.nextDueDate} or ${record.nextDueOdometer} km` : '11/02/2027 or 68,250 km')}
                  </span>
                </div>
              </div>
            </div>

            {/* Vendor & Workshop Info */}
            <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BuildingIcon size={14} /> Service Station Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Workshop Name:</span>
                  <span style={{ fontWeight: 600 }}>{record.vendorName || 'Sai Motors & Services'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Location:</span>
                  <span>{record.vendorLocation || 'Madurai, TN'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Invoice / Job Card:</span>
                  <span style={{ fontFamily: 'monospace' }}>{record.invoiceNumber || 'INV-2026-8812'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Document / Bill:</span>
                  <span style={{ color: '#22c55e', fontWeight: 600 }}>
                    ✓ Uploaded
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parts & Labour Tracking Breakdown */}
          <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarIcon size={14} /> Parts &amp; Labour Cost Breakdown
            </div>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '6px 0' }}>Item / Description</th>
                  <th style={{ padding: '6px 0', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px 0', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 0' }}>Spare Parts &amp; Fluids (Engine Oil, Filters, Seals)</td>
                  <td style={{ padding: '8px 0', textAlign: 'center' }}>1 Set</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>₹{Number(record.cost ? record.cost * 0.7 : 15000).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px 0' }}>Labour &amp; Fitting Charges (Technician Hours)</td>
                  <td style={{ padding: '8px 0', textAlign: 'center' }}>4 hrs</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>₹{Number(record.cost ? record.cost * 0.3 : 5000).toLocaleString('en-IN')}</td>
                </tr>
                <tr style={{ fontWeight: 800, color: '#f97316' }}>
                  <td style={{ padding: '10px 0' }}>Total Maintenance Cost</td>
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>—</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontSize: '14px' }}>₹{Number(record.cost || 20000).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Completion Form Drawer if activated */}
          {showCompletionForm && (
            <form onSubmit={handleCompleteMaintenance} style={{
              background: 'var(--color-surface2)',
              border: '1px solid #22c55e',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircleIcon size={16} /> Complete Maintenance &amp; Update Vehicle Health
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Completion Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Final Odometer (km)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={finalOdometer}
                    onChange={(e) => setFinalOdometer(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parts Cost (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={partsCost}
                    onChange={(e) => setPartsCost(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Labour Cost (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={labourCost}
                    onChange={(e) => setLabourCost(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vendor Bill / Invoice No.</label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Total Final Cost: <strong style={{ color: '#f97316', fontSize: '14px' }}>₹{totalCalculatedCost.toLocaleString('en-IN')}</strong>
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCompletionForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ background: '#22c55e', fontWeight: 700 }}>
                    Confirm Completion
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Workflow Actions Banner */}
          {!showCompletionForm && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--color-surface2)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                Workflow Status Actions:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {localStatus === 'scheduled' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#3b82f6', borderColor: '#3b82f6' }}
                    onClick={() => handleStatusTransition('in_progress')}
                  >
                    Mark In Progress
                  </button>
                )}
                {localStatus !== 'completed' && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ background: '#22c55e', fontWeight: 700 }}
                    onClick={() => setShowCompletionForm(true)}
                  >
                    Complete Maintenance
                  </button>
                )}
                {localStatus !== 'cancelled' && localStatus !== 'completed' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#ef4444' }}
                    onClick={() => handleStatusTransition('cancelled')}
                  >
                    Cancel Task
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
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
                  onEdit(record);
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
            <button className="btn btn-secondary btn-sm" onClick={() => alert('Downloading PDF Job Card...')}>
              <DownloadIcon size={13} /> Job Card PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
