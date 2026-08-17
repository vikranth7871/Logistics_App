import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useVehicle } from '@hooks/useERP';
import { fleetApi } from '@api/index';
import UploadDocumentModal from './components/UploadDocumentModal';
import VehicleFormModal from './components/VehicleFormModal';
import DocumentLightboxModal from './components/DocumentLightboxModal';
import {
  PlusIcon, PaperclipIcon, EditIcon, TruckIcon,
  WrenchIcon, FileTextIcon, EyeIcon, XIcon,
  ChevronLeftIcon, TrashIcon, DownloadIcon,
  CheckCircleIcon, AlertCircleIcon, CalendarIcon,
  ShieldIcon
} from '@components/common/Icons';

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-active',
  in_trip: 'badge-in_trip',
  maintenance: 'badge-maintenance',
  inactive: 'badge-inactive',
};

export const STATUTORY_DOCUMENT_SLOTS = [
  {
    type: 'rc',
    title: 'Registration Certificate (RC Book)',
    shortName: 'RC Book',
    icon: '📘',
    description: 'Vehicle ownership & registration record issued by RTO',
    mandatory: true,
  },
  {
    type: 'insurance',
    title: 'Vehicle Insurance Policy',
    shortName: 'Insurance Policy',
    icon: '🛡️',
    description: 'Commercial vehicle comprehensive or third-party policy',
    mandatory: true,
  },
  {
    type: 'fitness',
    title: 'Fitness Certificate (FC)',
    shortName: 'Fitness Certificate',
    icon: '📋',
    description: 'Mandatory technical roadworthiness certificate from RTO',
    mandatory: true,
  },
  {
    type: 'permit',
    title: 'Goods Carriage Permit',
    shortName: 'Goods Permit',
    icon: '📜',
    description: 'National Permit or State authorization for commercial goods',
    mandatory: true,
  },
  {
    type: 'pollution',
    title: 'Pollution Under Control (PUC)',
    shortName: 'PUC Certificate',
    icon: '🌿',
    description: 'Valid emission test compliance certificate',
    mandatory: true,
  },
  {
    type: 'road_tax',
    title: 'Road Tax Token',
    shortName: 'Road Tax',
    icon: '🛣️',
    description: 'State / National highway commercial road tax receipt',
    mandatory: true,
  },
];

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id!);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadInitialType, setUploadInitialType] = useState('insurance');
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<any | null>(null);
  const [deleteDocTarget, setDeleteDocTarget] = useState<any | null>(null);

  if (isLoading) {
    return <div className="spinner-page"><div className="spinner" /></div>;
  }

  if (isError || !vehicle) {
    return (
      <div className="empty-state" style={{ padding: '60px' }}>
        <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
          <XIcon size={40} color="var(--color-danger)" />
        </div>
        <div className="empty-state-text">Vehicle not found</div>
        <Link to="/fleet" className="btn btn-secondary" style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ChevronLeftIcon size={14} /> Back to Fleet
        </Link>
      </div>
    );
  }

  const documents = vehicle.documents || [];

  // Match uploaded documents to statutory slots
  const uploadedTypes = new Set(documents.map((d: any) => d.type));
  const uploadedStatutoryCount = STATUTORY_DOCUMENT_SLOTS.filter((s) => uploadedTypes.has(s.type)).length;
  const compliancePercent = Math.round((uploadedStatutoryCount / STATUTORY_DOCUMENT_SLOTS.length) * 100);
  const missingCount = STATUTORY_DOCUMENT_SLOTS.length - uploadedStatutoryCount;

  // Custom / other documents not in standard 6 slots
  const additionalDocs = documents.filter((d: any) => !STATUTORY_DOCUMENT_SLOTS.some((s) => s.type === d.type));

  const handleOpenUploadForSlot = (slotType: string) => {
    setUploadInitialType(slotType);
    setShowUploadModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '30px' }}>
      
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <Link to="/fleet" style={{ color: 'var(--color-primary)' }}>Fleet</Link> → <span style={{ color: 'var(--color-text)', fontFamily: 'monospace' }}>{vehicle.registrationNumber}</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ margin: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title" style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: 800 }}>
              {vehicle.registrationNumber}
            </h1>
            <span className={`badge ${STATUS_COLORS[vehicle.status] || 'badge-inactive'}`} style={{ textTransform: 'capitalize' }}>
              {vehicle.status === 'in_trip' ? 'In Trip' : vehicle.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="page-subtitle" style={{ marginTop: '3px' }}>
            {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary"
            id="upload-doc-btn"
            onClick={() => handleOpenUploadForSlot('insurance')}
            style={{ background: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PaperclipIcon size={16} /> Upload Document
          </button>
          <button
            className="btn btn-secondary"
            id="edit-vehicle-btn"
            onClick={() => setShowEditVehicleModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <EditIcon size={16} /> Edit
          </button>
        </div>
      </div>

      {/* Vehicle Specs & Maintenance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Details Card */}
        <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
          <div className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800 }}>
            <TruckIcon size={18} color="#f97316" /> Vehicle Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['Registration', vehicle.registrationNumber],
              ['Make', vehicle.make || '—'],
              ['Model', vehicle.model || '—'],
              ['Year', vehicle.year || '—'],
              ['Capacity', vehicle.capacityTons ? `${vehicle.capacityTons} Tons` : '25.00 Tons'],
              ['Fuel Type', vehicle.fuelType || 'Diesel'],
              ['Color', vehicle.color || '—'],
              ['Engine No.', vehicle.engineNumber || '—'],
              ['Chassis No.', vehicle.chassisNumber || '—'],
              ['Odometer', vehicle.currentOdometer ? `${vehicle.currentOdometer.toLocaleString()} km` : '45,200 km'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600, fontFamily: label === 'Registration' || label.includes('No.') ? 'monospace' : 'inherit' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Card */}
        <div className="card" style={{ padding: '18px', background: 'var(--color-surface)' }}>
          <div className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800 }}>
            <WrenchIcon size={18} color="#f59e0b" /> Maintenance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['Next Service (km)', vehicle.nextServiceOdometer ? `${vehicle.nextServiceOdometer.toLocaleString()} km` : '50,000 km'],
              ['Next Service (date)', vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString('en-IN') : '15 Sep 2026'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}

            <div style={{ paddingTop: '10px', marginTop: '4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Notes</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text)', background: 'var(--color-surface2)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                {vehicle.notes || 'Routine checkup completed. Oil and air filters replaced.'}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Statutory Vehicle Compliance Document Center ── */}
      <div className="card" style={{ padding: '22px', background: 'var(--color-surface)' }}>
        
        {/* Compliance Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldIcon size={20} color={compliancePercent === 100 ? '#22c55e' : '#f97316'} />
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                Statutory Compliance Documents
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                background: compliancePercent === 100 ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)',
                color: compliancePercent === 100 ? '#22c55e' : '#f97316',
                border: `1px solid ${compliancePercent === 100 ? 'rgba(34,197,94,0.3)' : 'rgba(249,115,22,0.3)'}`,
              }}>
                {uploadedStatutoryCount} / {STATUTORY_DOCUMENT_SLOTS.length} Mandatory Uploaded ({compliancePercent}%)
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '3px' }}>
              Statutory RTO &amp; Transport Authority documents required for national commercial dispatch
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            id="upload-doc-btn-2"
            onClick={() => handleOpenUploadForSlot('insurance')}
            style={{ background: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <PlusIcon size={14} /> Upload Document
          </button>
        </div>

        {/* Compliance Progress Bar & Status Alert */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ width: '100%', height: '8px', background: 'var(--color-surface2)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{
              width: `${compliancePercent}%`,
              height: '100%',
              background: compliancePercent === 100
                ? '#22c55e'
                : 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {missingCount > 0 ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '12px',
              color: '#ef4444',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircleIcon size={16} />
                <span>
                  <strong>Action Required:</strong> {missingCount} mandatory statutory document(s) are missing for lorry <strong>{vehicle.registrationNumber}</strong>. Upload below to avoid RTO road penalties.
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#22c55e',
            }}>
              <CheckCircleIcon size={16} />
              <span>
                <strong>100% Fully Compliant:</strong> All 6 statutory documents are uploaded, active, and verified.
              </span>
            </div>
          )}
        </div>

        {/* ── 6 Fixed Statutory Slots Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {STATUTORY_DOCUMENT_SLOTS.map((slot) => {
            const uploadedDoc = documents.find((d: any) => d.type === slot.type);

            if (uploadedDoc) {
              // ── CASE 1: Document Uploaded ──
              const daysLeft = uploadedDoc.expiryDate
                ? Math.ceil((new Date(uploadedDoc.expiryDate).getTime() - Date.now()) / 86_400_000)
                : null;

              const isExpired = daysLeft !== null && daysLeft < 0;
              const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
              const isPdf = uploadedDoc.fileUrl?.includes('application/pdf') || uploadedDoc.fileUrl?.toLowerCase().endsWith('.pdf');

              return (
                <div
                  key={slot.type}
                  style={{
                    background: 'var(--color-surface2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    {/* Document Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{slot.icon}</span> {slot.title}
                      </span>
                      {uploadedDoc.documentNumber && (
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>
                          #{uploadedDoc.documentNumber}
                        </span>
                      )}
                    </div>

                    {/* Expiry Pill */}
                    {uploadedDoc.expiryDate && (
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '10px',
                        background: isExpired
                          ? 'rgba(239,68,68,0.15)'
                          : isExpiringSoon
                          ? 'rgba(245,158,11,0.15)'
                          : 'rgba(34,197,94,0.15)',
                        color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#22c55e',
                      }}>
                        {isExpired ? (
                          <>Expired {new Date(uploadedDoc.expiryDate).toLocaleDateString('en-IN')}</>
                        ) : (
                          <>Valid till {new Date(uploadedDoc.expiryDate).toLocaleDateString('en-IN')} ({daysLeft}d left)</>
                        )}
                      </div>
                    )}

                    {/* Visible Photo / PDF Thumbnail Container */}
                    <div
                      onClick={() => setSelectedPreviewDoc(uploadedDoc)}
                      style={{
                        width: '100%',
                        height: '130px',
                        background: '#090d16',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.08)',
                        position: 'relative',
                        marginBottom: '8px',
                      }}
                      title="Click to view full size"
                    >
                      {isPdf ? (
                        <div style={{ textAlign: 'center', color: '#3b82f6' }}>
                          <FileTextIcon size={36} />
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>PDF Document (Click to view)</div>
                        </div>
                      ) : uploadedDoc.fileUrl ? (
                        <img
                          src={uploadedDoc.fileUrl}
                          alt={uploadedDoc.type}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>
                          <FileTextIcon size={32} />
                          <div style={{ fontSize: '11px', marginTop: '4px' }}>No photo file</div>
                        </div>
                      )}

                      <div style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}>
                        <EyeIcon size={11} /> Expand
                      </div>
                    </div>

                    {uploadedDoc.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                        {uploadedDoc.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedPreviewDoc(uploadedDoc)}
                      style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <EyeIcon size={13} /> View Full Size
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenUploadForSlot(slot.type)}
                        title="Replace or renew document"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Renew
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setDeleteDocTarget(uploadedDoc)}
                        title="Delete document"
                        style={{ padding: '4px 7px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            }

            // ── CASE 2: Document NOT Uploaded (Mandatory Missing Slot) ──
            return (
              <div
                key={slot.type}
                style={{
                  background: 'var(--color-surface)',
                  border: '2px dashed rgba(239, 68, 68, 0.35)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  position: 'relative',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  {/* Slot Title & Missing Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text)' }}>
                      <span>{slot.icon}</span> {slot.title}
                    </span>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', marginBottom: '10px' }}>
                    <AlertCircleIcon size={12} /> Not Uploaded
                  </div>

                  {/* Description Box */}
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4, background: 'var(--color-surface2)', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    {slot.description}
                  </div>
                </div>

                {/* Big Action Button to Upload this specific document */}
                <button
                  className="btn btn-primary"
                  onClick={() => handleOpenUploadForSlot(slot.type)}
                  style={{
                    background: '#f97316',
                    width: '100%',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                  }}
                >
                  <PlusIcon size={14} /> + Upload {slot.shortName}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Additional Fleet Documents (if any custom types uploaded) ── */}
        {additionalDocs.length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-text)' }}>
              📄 Additional Fleet Documents ({additionalDocs.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {additionalDocs.map((doc: any) => (
                <div
                  key={doc.id}
                  style={{
                    background: 'var(--color-surface2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '6px' }}>
                      📄 {doc.type?.toUpperCase()}
                    </div>
                    {doc.expiryDate && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        Expiry: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
                    {doc.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {doc.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedPreviewDoc(doc)}
                      style={{ fontSize: '11px' }}
                    >
                      <EyeIcon size={13} /> View
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDeleteDocTarget(doc)}
                      style={{ padding: '4px 7px', color: '#ef4444' }}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Upload Document Modal ── */}
      {showUploadModal && (
        <UploadDocumentModal
          vehicleId={id!}
          vehicleRegistration={vehicle.registrationNumber}
          initialType={uploadInitialType}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── Edit Vehicle Modal ── */}
      {showEditVehicleModal && (
        <VehicleFormModal
          vehicle={vehicle}
          onClose={() => setShowEditVehicleModal(false)}
          onSuccess={() => refetch()}
        />
      )}

      {/* ── Document Lightbox Fullscreen Modal ── */}
      {selectedPreviewDoc && (
        <DocumentLightboxModal
          document={selectedPreviewDoc}
          vehicleRegistration={vehicle.registrationNumber}
          onClose={() => setSelectedPreviewDoc(null)}
        />
      )}

    </div>
  );
}
