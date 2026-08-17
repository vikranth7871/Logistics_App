import React, { useState } from 'react';
import {
  XIcon, DownloadIcon, FileTextIcon,
  CheckCircleIcon, AlertCircleIcon, CalendarIcon
} from '@components/common/Icons';

interface DocumentLightboxModalProps {
  document: any;
  vehicleRegistration: string;
  onClose: () => void;
}

export default function DocumentLightboxModal({
  document: doc,
  vehicleRegistration,
  onClose,
}: DocumentLightboxModalProps) {
  if (!doc) return null;

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const isPdf = doc.fileUrl?.includes('application/pdf') || doc.fileUrl?.toLowerCase().endsWith('.pdf');

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ zIndex: 1200 }}>
      <div className="modal" style={{ maxWidth: '850px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                {doc.type ? doc.type.replace(/_/g, ' ').toUpperCase() : 'DOCUMENT'}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>
                ({vehicleRegistration})
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {doc.documentNumber ? `Document No: ${doc.documentNumber} • ` : ''}
              {doc.expiryDate ? `Expiry: ${new Date(doc.expiryDate).toLocaleDateString('en-IN')}` : ''}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isPdf && (
              <>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                  title="Zoom Out"
                  style={{ padding: '5px 10px' }}
                >
                  −
                </button>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '40px', textAlign: 'center' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                  title="Zoom In"
                  style={{ padding: '5px 10px' }}
                >
                  +
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  title="Rotate"
                  style={{ padding: '5px 8px', fontSize: '12px' }}
                >
                  🔄
                </button>
              </>
            )}

            {doc.fileUrl && (
              <a
                href={doc.fileUrl}
                download={`${vehicleRegistration}_${doc.type || 'document'}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
              >
                <DownloadIcon size={14} /> Download
              </a>
            )}

            <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
          </div>
        </div>

        {/* Image Preview Body */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: '#090d16',
          minHeight: '400px',
          maxHeight: '68vh',
        }}>
          {isPdf ? (
            <iframe
              src={doc.fileUrl}
              title="PDF Document Viewer"
              style={{ width: '100%', height: '560px', border: 'none', borderRadius: '6px' }}
            />
          ) : doc.fileUrl ? (
            <img
              src={doc.fileUrl}
              alt="Vehicle document preview"
              style={{
                maxWidth: '100%',
                maxHeight: '62vh',
                objectFit: 'contain',
                borderRadius: '6px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--color-text-dim)' }}>
              <FileTextIcon size={48} />
              <div style={{ marginTop: '8px' }}>No preview available</div>
            </div>
          )}
        </div>

        {/* Footer info */}
        {doc.notes && (
          <div style={{ padding: '12px 20px', background: 'var(--color-surface2)', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            <strong>Notes / Agency:</strong> {doc.notes}
          </div>
        )}

      </div>
    </div>
  );
}
