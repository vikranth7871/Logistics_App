import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { useDriver } from '@hooks/useERP';
import DriverProfileEditModal from './components/DriverProfileEditModal';
import {
  UsersIcon, TruckIcon, CheckCircleIcon, AlertCircleIcon,
  PhoneIcon, MailIcon, MapPinIcon, CalendarIcon,
  EditIcon, CheckIcon, ShieldIcon, ClockIcon,
  IdCardIcon, UserCheckIcon, AlertTriangleIcon
} from '@components/common/Icons';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const driverId = user?.driverId || 'drv-1';

  const { data: driverData, isLoading, refetch } = useDriver(driverId);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fallback defaults for rich display
  const driver = driverData || {
    id: driverId,
    name: user?.name || 'Selvam P',
    driverCode: 'DRV-00124',
    phone: '+91 98765 43210',
    email: user?.email || 'driver@lorryerp.com',
    licenseNumber: 'TN72-2018-0094182',
    licenseType: 'Heavy Commercial Vehicle (HGV / Multi-Axle Trailer)',
    licenseExpiry: '2028-03-13',
    joiningDate: '2021-01-01',
    status: 'active',
    address: 'Plot 42, Cross Street, Anna Nagar',
    city: 'Tirunelveli',
    state: 'Tamil Nadu',
    pincode: '627002',
    emergencyContactName: 'M. Palanisamy',
    emergencyRelationship: 'Father / Next of Kin',
    emergencyContactPhone: '+91 94432 10987',
    vehicleNumber: 'TN72BT7517',
    vehicleModel: 'Ashok Leyland 4220 (42T Multi-Axle)',
  };

  const licDays = driver.licenseExpiry
    ? Math.ceil((new Date(driver.licenseExpiry).getTime() - Date.now()) / 86_400_000)
    : 730;

  const isLicExpired = licDays !== null && licDays < 0;
  const isLicExpiringSoon = licDays !== null && licDays >= 0 && licDays <= 60;
  const isLicValid = licDays !== null && licDays > 60;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '2px' }}>
            Driver Portal / Account
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
            My Profile
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            Manage your personal, contact and driver information
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowEditModal(true)}
          style={{ background: '#f97316', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <EditIcon size={15} /> Edit Profile
        </button>
      </div>

      {/* ── Wide Profile Header Card ── */}
      <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Driver Avatar & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
              border: '3px solid var(--color-surface)',
            }}>
              {driver.name ? driver.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'SP'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  {driver.name || 'Selvam P'}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  background: 'rgba(34,197,94,0.15)',
                  color: '#22c55e',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  ● Active Account
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  background: 'rgba(59,130,246,0.15)',
                  color: '#3b82f6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  🚛 Currently on Trip (Chennai ➔ Tuticorin)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '12px', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                <span>Driver ID: <strong style={{ color: '#f97316', fontFamily: 'monospace' }}>{driver.driverCode || 'DRV-00124'}</strong></span>
                <span>•</span>
                <span>Assigned Lorry: <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>{driver.vehicleNumber || 'TN72BT7517'}</strong></span>
                <span>•</span>
                <span>DL: <strong style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>{driver.licenseNumber || 'TN72-2018-0094182'}</strong></span>
              </div>
            </div>
          </div>

          {/* Profile Completion Bar */}
          <div style={{
            background: 'var(--color-surface2)',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            minWidth: '220px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              <span>PROFILE COMPLETION</span>
              <span style={{ color: '#22c55e', fontWeight: 800 }}>85% Complete</span>
            </div>
            
            <div style={{ width: '100%', height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #f97316, #22c55e)', borderRadius: '4px' }} />
            </div>

            <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircleIcon size={12} color="#22c55e" /> Contact, DL &amp; Emergency info verified
            </div>
          </div>

        </div>
      </div>

      {/* ── Two-Column Information Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card 1: Personal Information */}
          <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <UsersIcon size={16} color="#f97316" /> Personal Information
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>Employee Record</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <InfoItem label="Full Name" value={driver.name || 'Selvam P'} />
              <InfoItem label="Driver ID" value={driver.driverCode || 'DRV-00124'} isMono />
              <InfoItem label="System Role" value="Commercial Fleet Driver" />
              <InfoItem label="Joining Date" value={new Date(driver.joiningDate || '2021-01-01').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
              <InfoItem label="Account Status" value="🟢 Active (On Duty)" />
              <InfoItem label="Operational Duty" value="Long Haul Inter-City Freight" />
            </div>
          </div>

          {/* Card 2: Contact Information */}
          <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <PhoneIcon size={16} color="#3b82f6" /> Contact Information
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEditModal(true)}
                style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <EditIcon size={12} /> Edit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <InfoItem label="Mobile Number" value={driver.phone || '+91 98765 43210'} />
              <InfoItem label="Email / Login ID" value={driver.email || 'driver@lorryerp.com'} />
              <div style={{ gridColumn: 'span 2' }}>
                <InfoItem
                  label="Residential Address"
                  value={driver.address ? `${driver.address}, ${driver.city || 'Tirunelveli'}, ${driver.state || 'Tamil Nadu'} - ${driver.pincode || '627002'}` : 'Plot 42, Cross Street, Anna Nagar, Tirunelveli - 627002'}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Assigned Vehicle */}
          <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <TruckIcon size={16} color="#22c55e" /> Assigned Vehicle
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/driver/trips')}
                style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                View Active Trip ➔
              </button>
            </div>

            <div style={{
              background: 'var(--color-surface2)',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'monospace', color: '#f97316' }}>
                  {driver.vehicleNumber || 'TN72BT7517'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text)', marginTop: '2px' }}>
                  {driver.vehicleModel || 'Ashok Leyland 4220 (42T Multi-Axle)'}
                </div>
                <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircleIcon size={12} /> Live GPS Tracking &amp; FASTag Connected
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  background: 'rgba(34,197,94,0.15)',
                  color: '#22c55e',
                }}>
                  ● In Transit
                </span>
                <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                  Chennai ➔ Tuticorin
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card 4: License & Compliance */}
          <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <IdCardIcon size={16} color="#f97316" /> Driving License &amp; Compliance
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                background: isLicValid ? 'rgba(34,197,94,0.15)' : isLicExpiringSoon ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: isLicValid ? '#22c55e' : isLicExpiringSoon ? '#f59e0b' : '#ef4444',
              }}>
                {isLicValid ? '🟢 Valid — 2 years remaining' : isLicExpiringSoon ? `🟡 Expiring in ${licDays} days` : '🔴 License Expired'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <InfoItem label="License Number" value={driver.licenseNumber || 'TN72-2018-0094182'} isMono />
              <InfoItem label="License Category" value={driver.licenseType || 'Heavy Goods Vehicle (HGV)'} />
              <InfoItem label="Issue Date" value="14 Mar 2018" />
              <InfoItem label="Expiry Date" value={new Date(driver.licenseExpiry || '2028-03-13').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
              <div style={{ gridColumn: 'span 2' }}>
                <InfoItem label="Endorsement Badges" value="HMV Commercial Badge • Hazardous Chemicals Certified" />
              </div>
            </div>
          </div>

          {/* Card 5: Emergency Contact */}
          <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <AlertCircleIcon size={16} color="#f59e0b" /> Emergency Contact
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowEditModal(true)}
                style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                <EditIcon size={12} /> Edit
              </button>
            </div>

            <div style={{
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: '8px',
              padding: '12px 14px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>CONTACT NAME</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                    👤 {driver.emergencyContactName || 'M. Palanisamy'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>RELATIONSHIP</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                    👥 {driver.emergencyRelationship || 'Father / Next of Kin'}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>EMERGENCY PHONE NUMBER</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#f59e0b', marginTop: '2px', fontFamily: 'monospace' }}>
                    📞 {driver.emergencyContactPhone || '+91 94432 10987'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Account Activity */}
          <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <ClockIcon size={16} color="#a855f7" /> Account Activity
              </div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>System Audit</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: 'var(--color-surface2)', padding: '10px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>LAST LOGIN</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                  Today, 9:42 AM
                </div>
              </div>

              <div style={{ background: 'var(--color-surface2)', padding: '10px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>PROFILE UPDATED</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                  12 Aug 2026
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', background: 'var(--color-surface2)', padding: '10px 12px', borderRadius: '6px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>LAST COMPLETED FREIGHT TRIP</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                  TRP-26-00002 • Salem Steel Plant ➔ Chennai Harbour (Delivered)
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Information Banner ── */}
      <div style={{
        background: 'rgba(249,115,22,0.06)',
        border: '1px solid rgba(249,115,22,0.2)',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldIcon size={20} color="#f97316" />
          <div style={{ fontSize: '12px', color: 'var(--color-text)' }}>
            <strong>Need to update restricted information?</strong> Contact your Fleet Manager or System Administrator to update your official driver license number, role permissions, or employment details.
          </div>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowEditModal(true)}
          style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <EditIcon size={12} /> Edit Contact Info
        </button>
      </div>

      {/* ── Profile Edit Modal ── */}
      {showEditModal && (
        <DriverProfileEditModal
          driver={driver}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => refetch()}
        />
      )}

    </div>
  );
}

function InfoItem({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--color-text)',
        fontFamily: isMono ? 'monospace' : 'inherit',
      }}>
        {value}
      </div>
    </div>
  );
}
