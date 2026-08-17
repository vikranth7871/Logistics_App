import React, { useState } from 'react';
import {
  WrenchIcon, CheckIcon, BuildingIcon, DollarIcon,
  TruckIcon, ShieldIcon, FileTextIcon
} from '@components/common/Icons';

export default function SettingsTab() {
  const [companyName, setCompanyName] = useState('Lorry Fleet Logistics Pvt Ltd');
  const [gstin, setGstin] = useState('33AAACL1234F1Z8');
  const [currency, setCurrency] = useState('INR (₹)');
  const [fuelAlertThreshold, setFuelAlertThreshold] = useState('3.5');
  const [maintenanceReminderDays, setMaintenanceReminderDays] = useState('7');
  const [autoInvoiceOnTripComplete, setAutoInvoiceOnTripComplete] = useState(true);

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px', color: 'var(--color-text)' }}>
          Company &amp; Fleet Organization Settings
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Registered Enterprise Name</label>
            <input
              type="text"
              className="form-input"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company GSTIN Number</label>
            <input
              type="text"
              className="form-input"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px', color: 'var(--color-text)' }}>
          Operational Alert &amp; Billing Automation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Low Mileage Warning Threshold (KM/L)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={fuelAlertThreshold}
              onChange={(e) => setFuelAlertThreshold(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Maintenance Advance Notice (Days)</label>
            <input
              type="number"
              className="form-input"
              value={maintenanceReminderDays}
              onChange={(e) => setMaintenanceReminderDays(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={autoInvoiceOnTripComplete}
              onChange={(e) => setAutoInvoiceOnTripComplete(e.target.checked)}
            />
            <span>Auto-generate draft invoice when trip status is marked Delivered</span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          onClick={() => alert('Settings saved successfully')}
          style={{ background: '#f97316', fontWeight: 700 }}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
