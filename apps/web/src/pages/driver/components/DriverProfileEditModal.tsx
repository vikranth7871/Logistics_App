import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useUpdateDriver } from '@hooks/useERP';
import {
  XIcon, UsersIcon, PhoneIcon, MailIcon,
  MapPinIcon, CheckIcon, AlertCircleIcon
} from '@components/common/Icons';

interface DriverProfileEditModalProps {
  driver: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DriverProfileEditModal({
  driver,
  onClose,
  onSuccess,
}: DriverProfileEditModalProps) {
  const updateMutation = useUpdateDriver(driver?.id || '');

  const [name, setName] = useState(driver?.name || 'Selvam P');
  const [phone, setPhone] = useState(driver?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(driver?.email || 'driver@lorryerp.com');
  const [address, setAddress] = useState(driver?.address || 'Plot 42, Cross Street, Anna Nagar');
  const [city, setCity] = useState(driver?.city || 'Tirunelveli');
  const [state, setState] = useState(driver?.state || 'Tamil Nadu');
  const [pincode, setPincode] = useState(driver?.pincode || '627002');
  
  const [emergencyContactName, setEmergencyContactName] = useState(driver?.emergencyContactName || 'M. Palanisamy');
  const [emergencyRelationship, setEmergencyRelationship] = useState(driver?.emergencyRelationship || 'Father / Next of Kin');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(driver?.emergencyContactPhone || '+91 94432 10987');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyRelationship: emergencyRelationship.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
      };

      if (driver?.id) {
        await updateMutation.mutateAsync(payload);
      }
      toast.success('Profile contact details updated successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        
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
              <UsersIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                Edit Driver Profile
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Update contact information and emergency contacts
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Section 1: Personal Contact */}
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PhoneIcon size={14} color="#f97316" /> Personal Contact Details
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Section 2: Residential Address */}
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPinIcon size={14} color="#3b82f6" /> Residential Address
            </div>

            <div className="form-group">
              <label className="form-label">Street / House Address</label>
              <input
                type="text"
                placeholder="Plot / Door No, Street Name, Area"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </div>

            {/* Section 3: Emergency Contact */}
            <div style={{ background: 'var(--color-surface2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)', marginTop: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircleIcon size={14} color="#f59e0b" /> Emergency Contact
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    placeholder="e.g. M. Palanisamy"
                    className="form-input"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    placeholder="e.g. Father / Spouse / Brother"
                    className="form-input"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '10px' }}>
                <label className="form-label">Emergency Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 94432 10987"
                  className="form-input"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                />
              </div>
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
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
