import React, { useState } from 'react';
import { useFuelEntries, useCreateFuelEntry } from '@hooks/useERP';
import { PlusIcon, FuelIcon, ChevronLeftIcon, ChevronRightIcon, XIcon, DollarIcon } from '@components/common/Icons';

const PAYMENT_MODES = ['cash', 'card', 'fleet_card', 'credit', 'upi'];

export default function FuelPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useFuelEntries({ page, limit: 25 });
  const entries = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fuel Management</h1>
          <p className="page-subtitle">{meta.total} fuel entries recorded</p>
        </div>
        <button
          className="btn btn-primary"
          id="add-fuel-btn"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Record Fuel
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Location</th>
                <th>Quantity (L)</th>
                <th>Rate (₹/L)</th>
                <th>Total (₹)</th>
                <th>Mileage (km/L)</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : entries.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <FuelIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No fuel entries yet</div>
                    <div className="empty-state-sub">Record your first fuel fill-up</div>
                  </div>
                </td></tr>
              ) : (
                entries.map((e: any) => (
                  <tr key={e.id}>
                    <td style={{ fontSize: '12px' }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontWeight: 600, fontSize: '12px' }}>{e.vehicle?.registrationNumber || '—'}</td>
                    <td style={{ fontSize: '12px' }}>{e.location || '—'}</td>
                    <td>{e.fuelQuantityLiters} L</td>
                    <td>₹{e.pricePerLiter}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(e.totalAmount).toLocaleString('en-IN')}</td>
                    <td>{e.mileageKmpl ? `${e.mileageKmpl} km/L` : '—'}</td>
                    <td><span className="badge badge-assigned">{e.paymentMode}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {entries.length} of {meta.total}</span>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => setPage((p: number) => p - 1)}
                  disabled={page <= 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <button className="page-btn active">{page}</button>
                <button
                  className="page-btn"
                  onClick={() => setPage((p: number) => p + 1)}
                  disabled={page >= meta.totalPages}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Next <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && <FuelFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

function FuelFormModal({ onClose }: { onClose: () => void }) {
  const mutation = useCreateFuelEntry();
  const [form, setForm] = useState({
    vehicleId: '', date: new Date().toISOString().split('T')[0],
    location: '', fuelQuantityLiters: '', pricePerLiter: '',
    odometerReading: '', paymentMode: 'cash', billNumber: '', notes: '',
  });
  const set = (k: string, v: string) => setForm((f: typeof form) => ({ ...f, [k]: v }));

  const total = form.fuelQuantityLiters && form.pricePerLiter
    ? (parseFloat(form.fuelQuantityLiters) * parseFloat(form.pricePerLiter)).toFixed(2)
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mutation.mutateAsync({
      ...form,
      fuelQuantityLiters: parseFloat(form.fuelQuantityLiters),
      pricePerLiter: parseFloat(form.pricePerLiter),
      totalAmount: total ? parseFloat(total) : 0,
      odometerReading: form.odometerReading ? parseFloat(form.odometerReading) : undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FuelIcon size={18} /> Record Fuel Entry
          </span>
          <button className="modal-close" onClick={onClose} style={{ display: 'flex', alignItems: 'center' }}>
            <XIcon size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle ID *</label>
                <input className="form-input" required placeholder="Vehicle UUID" value={form.vehicleId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('vehicleId', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" required value={form.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity (Liters) *</label>
                <input type="number" step="0.1" className="form-input" required value={form.fuelQuantityLiters} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('fuelQuantityLiters', e.target.value)} placeholder="50" />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Liter (₹) *</label>
                <input type="number" step="0.01" className="form-input" required value={form.pricePerLiter} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('pricePerLiter', e.target.value)} placeholder="95.50" />
              </div>
            </div>
            {total && (
              <div className="alert alert-info" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarIcon size={16} /> Total: <strong>₹{parseFloat(total).toLocaleString('en-IN')}</strong>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Odometer Reading (km)</label>
                <input type="number" className="form-input" value={form.odometerReading} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('odometerReading', e.target.value)} placeholder="45000" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-select" value={form.paymentMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => set('paymentMode', e.target.value)}>
                  {PAYMENT_MODES.map((m: string) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-input" value={form.location} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('location', e.target.value)} placeholder="e.g. HP Petrol, Ambattur" />
              </div>
              <div className="form-group">
                <label className="form-label">Bill Number</label>
                <input className="form-input" value={form.billNumber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('billNumber', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" id="fuel-submit-btn" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Record Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
