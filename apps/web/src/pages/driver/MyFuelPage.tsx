import React, { useState } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useFuelEntries, useCreateFuelEntry, useVehicles } from '@hooks/useERP';
import { FuelIcon, PlusIcon, XIcon, ChevronLeftIcon, ChevronRightIcon } from '@components/common/Icons';

export default function MyFuelPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useFuelEntries({ page, limit: 15 });
  const fuelEntries = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  const totalLitres = fuelEntries.reduce((sum: number, f: any) => sum + Number(f.fuelQuantityLiters || f.litres || 0), 0);
  const totalCost = fuelEntries.reduce((sum: number, f: any) => sum + Number(f.totalAmount || f.totalCost || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Fuel Log</h1>
          <p className="page-subtitle">
            {meta.total} entries · {totalLitres.toFixed(0)}L logged · ₹{totalCost.toLocaleString('en-IN')} total cost
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Log Fuel Fill
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Litres</th>
                <th>Price/L (₹)</th>
                <th>Total Cost (₹)</th>
                <th>Odometer</th>
                <th>Station</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : fuelEntries.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                        <FuelIcon size={40} color="var(--color-text-dim)" />
                      </div>
                      <div className="empty-state-text">No fuel entries</div>
                      <div className="empty-state-sub">Log your first fuel fill using the button above</div>
                    </div>
                  </td>
                </tr>
              ) : (
                fuelEntries.map((f: any) => (
                  <tr key={f.id}>
                    <td style={{ fontSize: '12px' }}>{new Date(f.date || f.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {f.vehicle?.registrationNumber || '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{Number(f.fuelQuantityLiters || f.litres || 0).toFixed(1)}L</td>
                    <td>₹{Number(f.pricePerLiter || f.pricePerLitre || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(f.totalAmount || f.totalCost || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '12px' }}>{f.odometerReading ? `${Number(f.odometerReading).toLocaleString()} km` : '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>{f.location || f.fuelStation || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.totalPages > 1 && (
          <div style={{ padding: '0 16px 16px' }}>
            <div className="pagination">
              <span>Showing {fuelEntries.length} of {meta.total}</span>
              <div className="pagination-controls">
                <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ChevronLeftIcon size={14} /> Prev
                </button>
                <button className="page-btn active">{page}</button>
                <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={page >= meta.totalPages}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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
  const createMutation = useCreateFuelEntry();
  const { data: vehicleData } = useVehicles({ limit: 50 });
  const vehicles = Array.isArray(vehicleData?.items) ? vehicleData.items : Array.isArray(vehicleData) ? vehicleData : [];

  const [form, setForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    litres: '',
    pricePerLitre: '',
    odometerReading: '',
    fuelStation: '',
    notes: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const litresNum = parseFloat(form.litres) || 0;
  const priceNum = parseFloat(form.pricePerLitre) || 0;
  const totalCost = litresNum * priceNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      vehicleId: form.vehicleId,
      date: form.date,
      fuelQuantityLiters: litresNum,
      pricePerLiter: priceNum,
      totalAmount: totalCost,
      odometerReading: form.odometerReading ? parseFloat(form.odometerReading) : undefined,
      location: form.fuelStation || undefined,
      notes: form.notes || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <span className="modal-title">Log Fuel Fill</span>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select className="form-select" required value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.registrationNumber} ({v.make} {v.model})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" required value={form.date} onChange={(e) => set('date', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Litres *</label>
                <input type="number" className="form-input" required min={0.01} step={0.01} value={form.litres}
                  onChange={(e) => set('litres', e.target.value)} placeholder="0.0" />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Litre (₹) *</label>
                <input type="number" className="form-input" required min={0.01} step={0.01} value={form.pricePerLitre}
                  onChange={(e) => set('pricePerLitre', e.target.value)} placeholder="0.00" />
              </div>
            </div>

            {totalCost > 0 && (
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', padding: '10px 14px', fontSize: '14px', fontWeight: 600 }}>
                Total Cost: ₹{totalCost.toFixed(2)}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Odometer Reading (km)</label>
                <input type="number" className="form-input" value={form.odometerReading}
                  onChange={(e) => set('odometerReading', e.target.value)} placeholder="e.g. 45200" />
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Station / Location</label>
                <input className="form-input" value={form.fuelStation}
                  onChange={(e) => set('fuelStation', e.target.value)} placeholder="e.g. HP Petrol Bunk" />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Save Fuel Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
