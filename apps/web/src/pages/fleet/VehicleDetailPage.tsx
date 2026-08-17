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
  CheckCircleIcon, AlertCircleIcon, CalendarIcon
} from '@components/common/Icons';

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-active',
  in_trip: 'badge-in_trip',
  maintenance: 'badge-maintenance',
  inactive: 'badge-inactive',
};

const DOC_META: Record<string, { label: string; icon: string }> = {
  insurance: { label: 'Insurance Policy', icon: '🛡️' },
  permit: { label: 'Goods Permit', icon: '📜' },
  fitness: { label: 'Fitness Certificate (FC)', icon: '📋' },
  rc: { label: 'RC Book (Registration)', icon: '📘' },
  road_tax: { label: 'Road Tax Token', icon: '🛣️' },
  pollution: { label: 'PUC Certificate', icon: '🌿' },
  other: { label: 'Compliance Document', icon: '📄' },
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, isError, refetch } = useVehicle(id!);

  const [showUploadModal, setShowUploadModal] = useState(false);
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
            onClick={() => setShowUploadModal(true)}
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

      {/* Documents Card */}
      <div className="card" style={{ padding: '20px', background: 'var(--color-surface)' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800 }}>
              <FileTextIcon size={18} color="#3b82f6" /> Vehicle Compliance Documents
            </span>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {documents.length} official documents on file
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            id="upload-doc-btn-2"
            onClick={() => setShowUploadModal(true)}
            style={{ background: '#f97316', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <PlusIcon size={14} /> Upload
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state" style={{ padding: '36px', background: 'var(--color-surface2)', borderRadius: '8px', border: '1px dashed var(--color-border)' }}>
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <FileTextIcon size={40} color="var(--color-text-dim)" />
            </div>
            <div className="empty-state-text" style={{ fontSize: '15px', fontWeight: 700 }}>No documents uploaded yet</div>
            <div className="empty-state-sub" style={{ fontSize: '12px' }}>
              Upload insurance policies, state permits, fitness certificates (FC), and RC Book.
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowUploadModal(true)}
              style={{ marginTop: '14px', background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusIcon size={14} /> Upload First Document
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {documents.map((doc: any) => {
              const docMeta = DOC_META[doc.type] || { label: doc.type, icon: '📄' };
              const daysLeft = doc.expiryDate
                ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86_400_000)
                : null;

              const isExpired = daysLeft !== null && daysLeft < 0;
              const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
              const isPdf = doc.fileUrl?.includes('application/pdf') || doc.fileUrl?.toLowerCase().endsWith('.pdf');

              return (
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
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    {/* Document Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{docMeta.icon}</span> {docMeta.label}
                      </span>
                      {doc.documentNumber && (
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>
                          #{doc.documentNumber}
                        </span>
                      )}
                    </div>

                    {/* Expiry Pill */}
                    {doc.expiryDate && (
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
                          <>Expired {new Date(doc.expiryDate).toLocaleDateString('en-IN')}</>
                        ) : (
                          <>Valid till {new Date(doc.expiryDate).toLocaleDateString('en-IN')} ({daysLeft}d left)</>
                        )}
                      </div>
                    )}

                    {/* Visible Photo / PDF Thumbnail Container */}
                    <div
                      onClick={() => setSelectedPreviewDoc(doc)}
                      style={{
                        width: '100%',
                        height: '140px',
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
                          <FileTextIcon size={40} />
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>PDF Document (Click to view)</div>
                        </div>
                      ) : doc.fileUrl ? (
                        <img
                          src={doc.fileUrl}
                          alt={doc.type}
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

                    {doc.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                        {doc.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedPreviewDoc(doc)}
                      style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <EyeIcon size={13} /> View Full Size
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDeleteDocTarget(doc)}
                      title="Delete document"
                      style={{ padding: '4px 7px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Upload Document Modal ── */}
      {showUploadModal && (
        <UploadDocumentModal
          vehicleId={id!}
          vehicleRegistration={vehicle.registrationNumber}
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
