import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateVehicle, useUpdateVehicle } from '@hooks/useERP';
import { TruckIcon, XIcon, CheckIcon } from '@components/common/Icons';

interface Props {
  vehicle?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const FUEL_TYPES = ['diesel', 'petrol', 'cng', 'electric'];

export default function VehicleFormModal({ vehicle, onClose, onSuccess }: Props) {
  const isEdit = Boolean(vehicle?.id);
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle(vehicle?.id || '');

  const [form, setForm] = useState({
    registrationNumber: vehicle?.registrationNumber || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year ? String(vehicle.year) : '',
    capacityTons: vehicle?.capacityTons ? String(vehicle.capacityTons) : '',
    fuelType: vehicle?.fuelType || 'diesel',
    engineNumber: vehicle?.engineNumber || '',
    chassisNumber: vehicle?.chassisNumber || '',
    color: vehicle?.color || '',
    notes: vehicle?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...form,
        year: form.year ? parseInt(form.year) : undefined,
        capacityTons: form.capacityTons ? parseFloat(form.capacityTons) : undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      toast.success(isEdit ? 'Vehicle updated successfully' : 'Vehicle added to fleet');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TruckIcon size={20} color="#f97316" />
            <span className="modal-title">{isEdit ? `Edit Lorry ${vehicle?.registrationNumber}` : 'Add New Vehicle'}</span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><XIcon size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            <div className="form-group">
              <label className="form-label">
                Registration Number <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                className="form-input"
                style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                placeholder="e.g. TN72BT7517"
                value={form.registrationNumber}
                onChange={(e) => set('registrationNumber', e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Make</label>
                <input
                  className="form-input"
                  placeholder="e.g. Ashok Leyland / Tata"
                  value={form.make}
                  onChange={(e) => set('make', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  className="form-input"
                  placeholder="e.g. 4220 / Prima"
                  value={form.model}
                  onChange={(e) => set('model', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="2022"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  value={form.year}
                  onChange={(e) => set('year', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity (Tons)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="25.0"
                  value={form.capacityTons}
                  onChange={(e) => set('capacityTons', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  className="form-select"
                  value={form.fuelType}
                  onChange={(e) => set('fuelType', e.target.value)}
                >
                  {FUEL_TYPES.map((t) => (
                    <option key={t} value={t} style={{ textTransform: 'capitalize' }}>
                      {t.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Engine Number</label>
                <input
                  className="form-input"
                  placeholder="Engine serial number"
                  value={form.engineNumber}
                  onChange={(e) => set('engineNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Chassis Number</label>
                <input
                  className="form-input"
                  placeholder="Chassis VIN number"
                  value={form.chassisNumber}
                  onChange={(e) => set('chassisNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                className="form-input"
                placeholder="e.g. Yellow / Blue"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operational Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Special notes or cargo specialization..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ background: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <CheckIcon size={16} /> {isEdit ? 'Save Changes' : 'Create Vehicle'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
