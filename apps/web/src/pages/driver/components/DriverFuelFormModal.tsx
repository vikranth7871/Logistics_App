import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@store/auth.store';
import { useVehicles, useTrips, useCreateFuelEntry, useUpdateFuelEntry } from '@hooks/useERP';
import {
  XIcon, FuelIcon, TruckIcon, MapPinIcon,
  CameraIcon, CheckIcon, AlertTriangleIcon,
  PaperclipIcon, GaugeIcon, DollarIcon
} from '@components/common/Icons';

export const FUEL_STATIONS = [
  'Indian Oil Corporation (IOCL)',
  'Bharat Petroleum (BPCL)',
  'Hindustan Petroleum (HPCL)',
  'Nayara Energy',
  'Reliance Petroleum',
  'Shell India',
  'Company Depot / Yard Pump',
  'Other / Local Bunk',
];

export const FUEL_PAYMENT_MODES = [
  'Company Fleet Card (PetroCard / DriveTrack)',
  'Cash from Trip Advance',
  'Driver UPI / GPay',
  'Bunk Credit / Ledger Account',
];

interface DriverFuelFormModalProps {
  entry?: any | null;
  onClose: () => void;
  onSuccess: () => void;
  lastOdometer?: number;
}

export default function DriverFuelFormModal({
  entry,
  onClose,
  onSuccess,
  lastOdometer = 44360,
}: DriverFuelFormModalProps) {
  const { user } = useAuthStore();
  const createMutation = useCreateFuelEntry();
  const updateMutation = useUpdateFuelEntry();

  const { data: vehicleData } = useVehicles({ limit: 50 });
  const vehicles = Array.isArray(vehicleData?.items) ? vehicleData.items : Array.isArray(vehicleData) ? vehicleData : [];

  const { data: tripData } = useTrips({
    driverId: user?.driverId || undefined,
    limit: 50,
  });
  const trips = tripData?.items || [];

  const isEdit = Boolean(entry?.id);

  // Form State
  const [vehicleId, setVehicleId] = useState(entry?.vehicleId || entry?.vehicle?.id || '');
  const [tripId, setTripId] = useState(entry?.tripId || entry?.trip?.id || '');
  const [date, setDate] = useState(entry?.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10));
  const [litres, setLitres] = useState(entry?.fuelQuantityLiters || entry?.litres ? String(entry.fuelQuantityLiters || entry.litres) : '');
  const [pricePerLitre, setPricePerLitre] = useState(entry?.pricePerLiter || entry?.pricePerLitre ? String(entry.pricePerLiter || entry.pricePerLitre) : '100.25');
  const [odometer, setOdometer] = useState(entry?.odometerReading ? String(entry.odometerReading) : '45200');
  const [prevOdometer] = useState(entry?.previousOdometerReading || lastOdometer);
  const [stationBrand, setStationBrand] = useState(entry?.stationBrand || 'Indian Oil Corporation (IOCL)');
  const [stationLocation, setStationLocation] = useState(entry?.location || entry?.fuelStation || 'Ulundurpet Bypass Toll Pump, NH45');
  const [paymentMode, setPaymentMode] = useState(entry?.paymentMode || 'Company Fleet Card (PetroCard / DriveTrack)');
  const [isFullTank, setIsFullTank] = useState(entry?.isFullTank ?? true);
  const [notes, setNotes] = useState(entry?.notes || '');
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(entry?.receiptUrl || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default vehicle selection
  useEffect(() => {
    if (!vehicleId && vehicles.length > 0) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicles, vehicleId]);

  // Default active trip selection
  useEffect(() => {
    if (!tripId && trips.length > 0) {
      const active = trips.find((t: any) => t.status === 'in_progress' || t.status === 'assigned');
      if (active) setTripId(active.id);
      else setTripId(trips[0].id);
    }
  }, [trips, tripId]);

  const numLitres = parseFloat(litres) || 0;
  const numPrice = parseFloat(pricePerLitre) || 0;
  const totalCost = numLitres * numPrice;
  const numOdometer = parseFloat(odometer) || 0;

  // Real-time calculations
  const distanceTravelled = numOdometer > prevOdometer ? numOdometer - prevOdometer : 0;
  const calculatedMileage = distanceTravelled > 0 && numLitres > 0 ? (distanceTravelled / numLitres) : 0;

  // Abnormal Warnings
  const isHighQuantity = numLitres > 400;
  const isOdometerReversed = numOdometer > 0 && numOdometer < prevOdometer;
  const isLowMileage = calculatedMileage > 0 && calculatedMileage < 2.5;

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
    if (numLitres <= 0) {
      toast.error('Please enter a valid fuel quantity in Litres');
      return;
    }
    if (numPrice <= 0) {
      toast.error('Please enter a valid price per litre');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        vehicleId: vehicleId || (vehicles[0]?.id || 'veh-1'),
        tripId: tripId || undefined,
        date,
        fuelQuantityLiters: numLitres,
        pricePerLiter: numPrice,
        totalAmount: totalCost,
        odometerReading: numOdometer || undefined,
        location: `${stationBrand} - ${stationLocation}`.trim(),
        notes: notes.trim() || undefined,
        paymentMode,
        isFullTank,
        mileage: calculatedMileage > 0 ? parseFloat(calculatedMileage.toFixed(2)) : undefined,
        receiptUrl: receiptPreview || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync({ id: entry.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      toast.success(isEdit ? 'Fuel log updated' : 'Fuel fill logged successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save fuel log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
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
              <FuelIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                {isEdit ? `Edit Fuel Log #${entry?.fuelId || entry?.id?.slice(0, 8)}` : 'Log Fuel Fill'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Capture diesel quantity, odometer reading, pump slip &amp; calculate mileage
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Abnormal Fuel Warning Alerts */}
            {isHighQuantity && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '12px' }}>
                <AlertTriangleIcon size={18} />
                <span><strong>Unusually high fuel quantity:</strong> {numLitres}L exceeds typical single-tank fill (400L max). Please verify the fuel slip.</span>
              </div>
            )}

            {isOdometerReversed && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '12px' }}>
                <AlertTriangleIcon size={18} />
                <span><strong>Odometer reversal detected:</strong> Current reading ({numOdometer.toLocaleString()} km) is lower than previous logged reading ({prevOdometer.toLocaleString()} km).</span>
              </div>
            )}

            {/* Section 1: Vehicle & Linked Trip */}
            <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TruckIcon size={16} color="#f97316" /> Assigned Lorry &amp; Active Trip
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Vehicle Registration <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="form-select"
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                  >
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.make || 'Ashok Leyland 4220'})
                      </option>
                    ))}
                    {vehicles.length === 0 && (
                      <option value="veh-default">TN72BT7517 (Ashok Leyland 4220)</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Freight Trip</label>
                  <select
                    className="form-select"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                  >
                    <option value="">— Standalone Fuel Fill —</option>
                    {trips.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.tripNumber} ({t.origin} ➔ {t.destination})
                      </option>
                    ))}
                    {trips.length === 0 && (
                      <option value="trp-default">TRP-26-00003 (cbe ➔ tvl)</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Fuel Volume & Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Fuel Litres <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  placeholder="e.g. 200.5"
                  className="form-input"
                  value={litres}
                  onChange={(e) => setLitres(e.target.value)}
                  style={{ fontSize: '15px', fontWeight: 800, color: '#f97316' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price per Litre (₹/L) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="100.25"
                  className="form-input"
                  value={pricePerLitre}
                  onChange={(e) => setPricePerLitre(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Cost (₹)</label>
                <div style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.3)',
                  fontWeight: 800,
                  fontSize: '15px',
                  color: '#f97316',
                }}>
                  ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Section 3: Odometer & Mileage Calculator */}
            <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GaugeIcon size={16} color="#3b82f6" /> Odometer Telemetry &amp; Mileage
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Previous: <strong>{prevOdometer.toLocaleString()} km</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Current Odometer (km) <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 45200"
                    className="form-input"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Distance Travelled</label>
                  <div style={{ padding: '9px 12px', borderRadius: '6px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 700 }}>
                    {distanceTravelled > 0 ? `${distanceTravelled.toLocaleString()} km` : '—'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Calculated Mileage</label>
                  <div style={{
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: calculatedMileage >= 3.5 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                    border: `1px solid ${calculatedMileage >= 3.5 ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
                    fontSize: '13px',
                    fontWeight: 800,
                    color: calculatedMileage >= 3.5 ? '#22c55e' : '#f59e0b',
                  }}>
                    {calculatedMileage > 0 ? `${calculatedMileage.toFixed(2)} km/L` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Fuel Station & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Fuel Station Brand</label>
                <select
                  className="form-select"
                  value={stationBrand}
                  onChange={(e) => setStationBrand(e.target.value)}
                >
                  {FUEL_STATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">City / Pump Location</label>
                <input
                  type="text"
                  placeholder="e.g. Ulundurpet Toll NH45"
                  className="form-input"
                  value={stationLocation}
                  onChange={(e) => setStationLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Section 5: Payment & Full Tank Option */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  {FUEL_PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label className="form-label">Fill Type</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    checked={isFullTank}
                    onChange={(e) => setIsFullTank(e.target.checked)}
                  />
                  <span>Full Tank Fill (Autocut)</span>
                </label>
              </div>
            </div>

            {/* Section 6: Fuel Slip / Bill Upload */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Upload Fuel Bill Slip / Dispenser Meter Photo</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Photo or PDF</span>
              </label>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '8px',
                padding: '14px',
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
                      alt="Fuel Slip"
                      style={{ height: '52px', width: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>
                        ✓ {receiptFile?.name || 'fuel_slip_receipt.jpg'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Click to replace photo</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(249,115,22,0.15)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CameraIcon size={16} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>
                      Click or drag fuel dispenser slip / meter photo
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Added AdBlue 10L at IOCL pump..."
                className="form-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                  Saving Log...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> {isEdit ? 'Update Fuel Log' : 'Save Fuel Fill Entry'}
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
