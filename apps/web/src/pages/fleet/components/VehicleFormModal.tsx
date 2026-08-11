import { useState } from 'react';
import { useCreateVehicle } from '@hooks/useERP';
import { getErrorMessage } from '@api/client';

interface Props {
  onClose: () => void;
}

const FUEL_TYPES = ['diesel', 'petrol', 'cng', 'electric'];

export default function VehicleFormModal({ onClose }: Props) {
  const mutation = useCreateVehicle();

  const [form, setForm] = useState({
    registrationNumber: '',
    make: '',
    model: '',
    year: '',
    capacityTons: '',
    fuelType: 'diesel',
    engineNumber: '',
    chassisNumber: '',
    color: '',
    notes: '',
  });

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await mutation.mutateAsync({
      ...form,
      year: form.year ? parseInt(form.year) : undefined,
      capacityTons: form.capacityTons ? parseFloat(form.capacityTons) : undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title">
        <div className="modal-header">
          <span className="modal-title" id="vehicle-modal-title">Add New Vehicle</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-number">
                Registration Number <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="reg-number"
                className="form-input"
                style={{ textTransform: 'uppercase' }}
                placeholder="e.g. TN01AB1234"
                value={form.registrationNumber}
                onChange={(e) => set('registrationNumber', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="make">Make</label>
                <input
                  id="make"
                  className="form-input"
                  placeholder="e.g. Tata"
                  value={form.make}
                  onChange={(e) => set('make', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="model">Model</label>
                <input
                  id="model"
                  className="form-input"
                  placeholder="e.g. Prima 5530.S"
                  value={form.model}
                  onChange={(e) => set('model', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="year">Year</label>
                <input
                  id="year"
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
                <label className="form-label" htmlFor="capacity">Capacity (Tons)</label>
                <input
                  id="capacity"
                  type="number"
                  step="0.5"
                  className="form-input"
                  placeholder="25"
                  value={form.capacityTons}
                  onChange={(e) => set('capacityTons', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="fuel-type">Fuel Type</label>
                <select
                  id="fuel-type"
                  className="form-select"
                  value={form.fuelType}
                  onChange={(e) => set('fuelType', e.target.value)}
                >
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f} style={{ textTransform: 'capitalize' }}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="color">Color</label>
                <input
                  id="color"
                  className="form-input"
                  placeholder="White"
                  value={form.color}
                  onChange={(e) => set('color', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="engine-no">Engine Number</label>
                <input
                  id="engine-no"
                  className="form-input"
                  placeholder="Optional"
                  value={form.engineNumber}
                  onChange={(e) => set('engineNumber', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chassis-no">Chassis Number</label>
                <input
                  id="chassis-no"
                  className="form-input"
                  placeholder="Optional"
                  value={form.chassisNumber}
                  onChange={(e) => set('chassisNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                className="form-textarea"
                placeholder="Any additional notes…"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
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
              id="vehicle-submit-btn"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <span className="spinner" style={{ width: '14px', height: '14px' }} />
                  Creating…
                </>
              ) : (
                'Create Vehicle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
