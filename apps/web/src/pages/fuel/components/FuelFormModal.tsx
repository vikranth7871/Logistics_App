import { useState, useEffect } from 'react';
import { useCreateFuelEntry, useUpdateFuelEntry, useVehicles, useDrivers, useTrips } from '@hooks/useERP';
import { XIcon, FuelIcon, DollarIcon, PaperclipIcon, CheckIcon } from '@components/common/Icons';

interface Props {
  editEntry?: any;
  onClose: () => void;
}

export default function FuelFormModal({ editEntry, onClose }: Props) {
  const isEdit = Boolean(editEntry);
  const createMut = useCreateFuelEntry();
  const updateMut = useUpdateFuelEntry();

  const { data: vehicleData } = useVehicles({ limit: 100 });
  const { data: driverData }  = useDrivers({ limit: 100 });
  const { data: tripData }    = useTrips({ limit: 50 });

  const vehiclesList: any[] = vehicleData?.items ?? [];
  const driversList:  any[] = driverData?.items  ?? driverData ?? [];
  const tripsList:    any[] = tripData?.items     ?? tripData   ?? [];

  const [vehicleId,    setVehicleId]    = useState(editEntry?.vehicleId    ?? '');
  const [driverId,     setDriverId]     = useState(editEntry?.driverId     ?? '');
  const [tripId,       setTripId]       = useState(editEntry?.tripId       ?? '');
  const [date,         setDate]         = useState(editEntry?.date?.slice(0, 16) ?? new Date().toISOString().slice(0, 16));
  const [location,     setLocation]     = useState(editEntry?.location     ?? '');
  const [fuelType,     setFuelType]     = useState(editEntry?.fuelType     ?? 'diesel');
  const [qty,          setQty]          = useState(editEntry?.qty          ?? '');
  const [rate,         setRate]         = useState(editEntry?.rate         ?? '');
  const [currentOdo,   setCurrentOdo]   = useState(editEntry?.odo          ?? '');
  const [prevOdo,      setPrevOdo]      = useState(editEntry?.prevOdo      ?? '');
  const [paymentMode,  setPaymentMode]  = useState(editEntry?.payment      ?? '');
  const [notes,        setNotes]        = useState(editEntry?.notes        ?? '');
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  /* Derived calculations */
  const totalAmount = qty && rate ? (Number(qty) * Number(rate)).toFixed(2) : '';
  const distance    = currentOdo && prevOdo && Number(currentOdo) > Number(prevOdo)
    ? (Number(currentOdo) - Number(prevOdo)).toFixed(0) : '';
  const mileage     = distance && qty && Number(qty) > 0
    ? (Number(distance) / Number(qty)).toFixed(2) : '';
  const costPerKm   = mileage && rate && Number(mileage) > 0
    ? (Number(rate) / Number(mileage)).toFixed(2) : '';

  /* Validation */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!vehicleId)                                        e.vehicleId   = 'Vehicle is required';
    if (!date)                                             e.date        = 'Date is required';
    if (!location.trim())                                  e.location    = 'Fuel station is required';
    if (!fuelType)                                         e.fuelType    = 'Fuel type is required';
    if (!qty || Number(qty) <= 0)                          e.qty         = 'Quantity must be > 0';
    if (!rate || Number(rate) <= 0)                        e.rate        = 'Rate must be > 0';
    if (!paymentMode)                                      e.paymentMode = 'Payment method is required';
    if (currentOdo && prevOdo && Number(currentOdo) <= Number(prevOdo))
      e.currentOdo = 'Current odometer must be greater than previous';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      vehicleId,
      driverId:             driverId   || undefined,
      tripId:               tripId     || undefined,
      date:                 new Date(date).toISOString(),
      location,
      fuelType,
      fuelQuantityLiters:   Number(qty),
      pricePerLiter:        Number(rate),
      totalAmount:          Number(totalAmount),
      currentOdometer:      currentOdo ? Number(currentOdo) : undefined,
      previousOdometer:     prevOdo    ? Number(prevOdo)    : undefined,
      distance:             distance   ? Number(distance)   : undefined,
      mileageKmpl:          mileage    ? Number(mileage)    : undefined,
      costPerKm:            costPerKm  ? Number(costPerKm)  : undefined,
      paymentMode,
      notes:                notes      || undefined,
    };

    if (isEdit) {
      updateMut.mutate({ id: editEntry.id, data: payload }, { onSuccess: onClose });
    } else {
      createMut.mutate(payload, { onSuccess: onClose });
    }
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  const field = (label: string, id: string, err?: string, required = false) => (
    <div style={{ marginBottom: '0' }}>
      <label htmlFor={id} style={{ fontSize: '11px', fontWeight: 700, color: err ? '#f87171' : 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
        {label}{required && <span style={{ color: '#f87171' }}> *</span>}
      </label>
      {err && <div style={{ fontSize: '10px', color: '#f87171', marginBottom: '3px' }}>{err}</div>}
    </div>
  );

  const inputStyle = (err?: string): React.CSSProperties => ({
    border: err ? '1px solid #ef4444' : '1px solid var(--color-border)',
    outline: 'none',
  });

  /* ── RENDER ──────────────────────────────────────────────────────────── */
  return (
    <div className="card" style={{ padding: '0', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', background: 'rgba(249,115,22,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FuelIcon size={16} color="#f97316" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{isEdit ? 'Edit Fuel Entry' : 'Record Fuel Entry'}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Fill in the details below. Total amount is auto-calculated.</div>
          </div>
        </div>
        <button className="modal-close" onClick={onClose} title="Close form"><XIcon size={18} /></button>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>

          {/* Vehicle */}
          <div>
            {field('Vehicle', 'ff-vehicle', errors.vehicleId, true)}
            <select id="ff-vehicle" className="form-select" style={{ width: '100%', ...inputStyle(errors.vehicleId) }}
              value={vehicleId} onChange={e => setVehicleId(e.target.value)}>
              <option value="">Select vehicle…</option>
              {vehiclesList.map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
            </select>
          </div>

          {/* Driver */}
          <div>
            {field('Driver (optional)', 'ff-driver')}
            <select id="ff-driver" className="form-select" style={{ width: '100%' }}
              value={driverId} onChange={e => setDriverId(e.target.value)}>
              <option value="">Select driver…</option>
              {driversList.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            {field('Date & Time', 'ff-date', errors.date, true)}
            <input id="ff-date" type="datetime-local" className="form-input" style={{ width: '100%', ...inputStyle(errors.date) }}
              value={date} onChange={e => setDate(e.target.value)} />
          </div>

          {/* Fuel Station */}
          <div>
            {field('Fuel Station / Location', 'ff-loc', errors.location, true)}
            <input id="ff-loc" type="text" className="form-input" placeholder="e.g. IOCL Bunk, NH-44" style={{ width: '100%', ...inputStyle(errors.location) }}
              value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          {/* Fuel Type */}
          <div>
            {field('Fuel Type', 'ff-type', errors.fuelType, true)}
            <select id="ff-type" className="form-select" style={{ width: '100%', ...inputStyle(errors.fuelType) }}
              value={fuelType} onChange={e => setFuelType(e.target.value)}>
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
              <option value="cng">CNG</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            {field('Quantity (Litres)', 'ff-qty', errors.qty, true)}
            <input id="ff-qty" type="number" className="form-input" placeholder="0.00" min="0.01" step="0.01" style={{ width: '100%', ...inputStyle(errors.qty) }}
              value={qty} onChange={e => setQty(e.target.value)} />
          </div>

          {/* Rate per litre */}
          <div>
            {field('Rate per Litre (₹)', 'ff-rate', errors.rate, true)}
            <input id="ff-rate" type="number" className="form-input" placeholder="0.00" min="0.01" step="0.01" style={{ width: '100%', ...inputStyle(errors.rate) }}
              value={rate} onChange={e => setRate(e.target.value)} />
          </div>

          {/* Total Amount — read-only */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Total Amount (₹) <span style={{ color: 'var(--color-text-dim)', fontWeight: 400, fontSize: '10px' }}>(auto-calculated)</span>
            </label>
            <input type="text" className="form-input" readOnly
              value={totalAmount ? `₹ ${Number(totalAmount).toLocaleString()}` : '—'}
              style={{ width: '100%', background: 'var(--color-surface)', color: '#f97316', fontWeight: 700, cursor: 'default' }} />
          </div>

          {/* Previous Odometer */}
          <div>
            {field('Previous Odometer (km)', 'ff-prevo')}
            <input id="ff-prevo" type="number" className="form-input" placeholder="e.g. 47800" style={{ width: '100%' }}
              value={prevOdo} onChange={e => setPrevOdo(e.target.value)} />
          </div>

          {/* Current Odometer */}
          <div>
            {field('Current Odometer (km)', 'ff-odo', errors.currentOdo)}
            <input id="ff-odo" type="number" className="form-input" placeholder="e.g. 48250" style={{ width: '100%', ...inputStyle(errors.currentOdo) }}
              value={currentOdo} onChange={e => setCurrentOdo(e.target.value)} />
          </div>

          {/* Distance — read-only */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Distance Covered (km) <span style={{ color: 'var(--color-text-dim)', fontWeight: 400, fontSize: '10px' }}>(auto)</span>
            </label>
            <input type="text" className="form-input" readOnly
              value={distance ? `${Number(distance).toLocaleString()} km` : '—'}
              style={{ width: '100%', background: 'var(--color-surface)', fontWeight: 600, cursor: 'default' }} />
          </div>

          {/* Mileage — read-only */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>
              Mileage (km/L) <span style={{ color: 'var(--color-text-dim)', fontWeight: 400, fontSize: '10px' }}>(auto)</span>
            </label>
            <input type="text" className="form-input" readOnly
              value={mileage ? `${mileage} km/L` : '—'}
              style={{
                width: '100%', background: 'var(--color-surface)', fontWeight: 600, cursor: 'default',
                color: mileage ? (Number(mileage) < 2.5 ? '#f87171' : '#4ade80') : 'var(--color-text-muted)',
              }} />
          </div>

          {/* Payment Method */}
          <div>
            {field('Payment Method', 'ff-pay', errors.paymentMode, true)}
            <select id="ff-pay" className="form-select" style={{ width: '100%', ...inputStyle(errors.paymentMode) }}
              value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
              <option value="">Select…</option>
              <option value="fuel_card">Fuel Card</option>
              <option value="cash">Cash</option>
              <option value="corporate_upi">Corporate UPI</option>
              <option value="company_account">Company Account</option>
            </select>
          </div>

          {/* Trip (optional) */}
          <div>
            {field('Associate Trip (optional)', 'ff-trip')}
            <select id="ff-trip" className="form-select" style={{ width: '100%' }}
              value={tripId} onChange={e => setTripId(e.target.value)}>
              <option value="">No trip</option>
              {tripsList.map((t: any) => <option key={t.id} value={t.id}>{t.tripCode || t.id} — {t.origin} → {t.destination}</option>)}
            </select>
          </div>

          {/* Receipt Upload */}
          <div>
            {field('Receipt Upload', 'ff-receipt')}
            <input id="ff-receipt" type="file" accept="image/*,application/pdf"
              style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)', width: '100%',
                border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '8px', background: 'var(--color-surface2)', cursor: 'pointer' }}
              onChange={e => { /* handle file upload in production */ }} />
          </div>

          {/* Notes */}
          <div style={{ gridColumn: '1 / -1' }}>
            {field('Notes (optional)', 'ff-notes')}
            <textarea id="ff-notes" className="form-input" rows={2} placeholder="Any additional notes about this fuel entry…"
              style={{ width: '100%', resize: 'vertical' }}
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        {/* Calculated summary bar */}
        {(totalAmount || mileage) && (
          <div style={{ margin: '0 16px 14px', padding: '10px 14px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px' }}>
            {totalAmount && <div><span style={{ color: 'var(--color-text-muted)' }}>Total: </span><strong style={{ color: '#f97316' }}>₹{Number(totalAmount).toLocaleString()}</strong></div>}
            {distance    && <div><span style={{ color: 'var(--color-text-muted)' }}>Distance: </span><strong>{distance} km</strong></div>}
            {mileage     && <div><span style={{ color: 'var(--color-text-muted)' }}>Mileage: </span><strong style={{ color: Number(mileage) < 2.5 ? '#f87171' : '#4ade80' }}>{mileage} km/L</strong></div>}
            {costPerKm   && <div><span style={{ color: 'var(--color-text-muted)' }}>Cost/km: </span><strong>₹{costPerKm}</strong></div>}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface2)', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}
            style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            {isSaving ? <><div className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Saving…</> : <><CheckIcon size={14} /> {isEdit ? 'Save Changes' : 'Record Entry'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
