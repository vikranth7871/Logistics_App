import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  WrenchIcon, CheckIcon, BuildingIcon, DollarIcon,
  TruckIcon, ShieldIcon, FileTextIcon, BellIcon,
  SlidersIcon, KeyIcon, LockIcon
} from '@components/common/Icons';

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState('Lorry Fleet Logistics Pvt Ltd');
  const [gstin, setGstin] = useState('33AAACL1234F1Z8');
  const [panNumber, setPanNumber] = useState('AAACL1234F');
  const [registeredEmail, setRegisteredEmail] = useState('billing@lorryfleet.com');
  const [registeredPhone, setRegisteredPhone] = useState('+91 99440 01122');
  const [officeAddress, setOfficeAddress] = useState('Plot 42, Transport Nagar, Madhavaram, Chennai - 600060');

  // Operational Thresholds
  const [fuelAlertThreshold, setFuelAlertThreshold] = useState('3.5');
  const [maintenanceReminderDays, setMaintenanceReminderDays] = useState('7');
  const [insuranceExpiryDays, setInsuranceExpiryDays] = useState('30');
  const [autoInvoiceOnTripComplete, setAutoInvoiceOnTripComplete] = useState(true);
  const [allowDriverCashExpenses, setAllowDriverCashExpenses] = useState(true);
  const [maxCashExpenseLimit, setMaxCashExpenseLimit] = useState('5000');
  const [gtaTaxRate, setGtaTaxRate] = useState('5');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('System configuration saved successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Administration / Configuration
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            System Settings
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Configure company profile, GSTIN terms, operational thresholds, and automated freight workflows.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <CheckIcon size={16} /> Save All Changes
        </button>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* ── Panel 1: Company Profile & Tax Details ── */}
        <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(249,115,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316',
            }}>
              <BuildingIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Company &amp; Tax Registration
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Legal company details appearing on customer freight invoices
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Registered Enterprise Name</label>
              <input
                type="text"
                className="form-input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Company GSTIN</label>
                <input
                  type="text"
                  className="form-input"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Billing Support Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={registeredEmail}
                  onChange={(e) => setRegisteredEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={registeredPhone}
                  onChange={(e) => setRegisteredPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Head Office Address</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Panel 2: Operational Thresholds & Alerts ── */}
        <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59,130,246,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}>
              <SlidersIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Operational &amp; Maintenance Rules
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Thresholds for automated alerts, mileage flags, and document expiries
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Low Mileage Warning (KM/L)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={fuelAlertThreshold}
                  onChange={(e) => setFuelAlertThreshold(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default GTA GST Rate (%)</label>
                <select
                  className="form-select"
                  value={gtaTaxRate}
                  onChange={(e) => setGtaTaxRate(e.target.value)}
                >
                  <option value="5">5% (Without ITC - Standard GTA)</option>
                  <option value="12">12% (With Input Tax Credit)</option>
                  <option value="18">18% (Forward Charge)</option>
                  <option value="0">0% (Exempted Freight)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Service Advance Notice (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={maintenanceReminderDays}
                  onChange={(e) => setMaintenanceReminderDays(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">FC / Insurance Reminder (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={insuranceExpiryDays}
                  onChange={(e) => setInsuranceExpiryDays(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={autoInvoiceOnTripComplete}
                  onChange={(e) => setAutoInvoiceOnTripComplete(e.target.checked)}
                />
                <span>Auto-generate draft invoice when trip status is marked Delivered</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={allowDriverCashExpenses}
                  onChange={(e) => setAllowDriverCashExpenses(e.target.checked)}
                />
                <span>Allow drivers to log unverified cash toll/loading slips up to ₹{maxCashExpenseLimit}</span>
              </label>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
