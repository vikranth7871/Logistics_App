import { useParams, Link } from 'react-router-dom';
import { useVehicle } from '@hooks/useERP';
import { PlusIcon, PaperclipIcon, EditIcon, TruckIcon, WrenchIcon, FileTextIcon, EyeIcon, XIcon, ChevronLeftIcon } from '@components/common/Icons';

const STATUS_COLORS: Record<string, string> = {
  active: 'badge-active',
  in_trip: 'badge-in_trip',
  maintenance: 'badge-maintenance',
  inactive: 'badge-inactive',
};

const DOC_LABELS: Record<string, string> = {
  insurance: 'Insurance',
  permit: 'Permit',
  fitness: 'Fitness Certificate',
  rc: 'RC Book',
  road_tax: 'Road Tax',
  pollution: 'PUC',
  other: 'Other',
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, isError } = useVehicle(id!);

  if (isLoading) {
    return <div className="spinner-page"><div className="spinner" /></div>;
  }

  if (isError || !vehicle) {
    return (
      <div className="empty-state">
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

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <Link to="/fleet">Fleet</Link> → {vehicle.registrationNumber}
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-title">{vehicle.registrationNumber}</h1>
            <span className={`badge ${STATUS_COLORS[vehicle.status] || 'badge-inactive'}`}>
              {vehicle.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="page-subtitle">
            {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" id="upload-doc-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <PaperclipIcon size={16} /> Upload Document
          </button>
          <button className="btn btn-secondary" id="edit-vehicle-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <EditIcon size={16} /> Edit
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Details */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TruckIcon size={18} color="var(--color-primary)" /> Vehicle Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['Registration', vehicle.registrationNumber],
              ['Make', vehicle.make || '—'],
              ['Model', vehicle.model || '—'],
              ['Year', vehicle.year || '—'],
              ['Capacity', vehicle.capacityTons ? `${vehicle.capacityTons} Tons` : '—'],
              ['Fuel Type', vehicle.fuelType || '—'],
              ['Color', vehicle.color || '—'],
              ['Engine No.', vehicle.engineNumber || '—'],
              ['Chassis No.', vehicle.chassisNumber || '—'],
              ['Odometer', vehicle.currentOdometer ? `${vehicle.currentOdometer.toLocaleString()} km` : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WrenchIcon size={18} color="var(--color-warning)" /> Maintenance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              ['Next Service (km)', vehicle.nextServiceOdometer ? vehicle.nextServiceOdometer.toLocaleString() : '—'],
              ['Next Service (date)', vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString('en-IN') : '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            {vehicle.notes && (
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Notes</div>
                <div style={{ fontSize: '13px' }}>{vehicle.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextIcon size={18} color="var(--color-info)" /> Documents
          </span>
          <button className="btn btn-primary btn-sm" id="upload-doc-btn-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <PlusIcon size={14} /> Upload
          </button>
        </div>

        {(!vehicle.documents || vehicle.documents.length === 0) ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <FileTextIcon size={40} color="var(--color-text-dim)" />
            </div>
            <div className="empty-state-text">No documents uploaded</div>
            <div className="empty-state-sub">Upload insurance, permit, fitness certificates, etc.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {vehicle.documents.map((doc: any) => {
              const daysLeft = doc.expiryDate
                ? Math.ceil((new Date(doc.expiryDate).getTime() - Date.now()) / 86_400_000)
                : null;

              return (
                <div
                  key={doc.id}
                  style={{
                    background: 'var(--color-surface2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    {DOC_LABELS[doc.type] || doc.type}
                  </div>
                  {doc.documentNumber && (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      No. {doc.documentNumber}
                    </div>
                  )}
                  {daysLeft !== null && (
                    <div style={{
                      fontSize: '11px',
                      color: daysLeft < 0 ? 'var(--color-danger)' : daysLeft <= 30 ? 'var(--color-warning)' : 'var(--color-success)',
                    }}>
                      Expires {new Date(doc.expiryDate).toLocaleDateString('en-IN')}
                      {daysLeft < 0 ? ` (Expired)` : ` (${daysLeft}d left)`}
                    </div>
                  )}
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '8px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <EyeIcon size={14} /> View
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
