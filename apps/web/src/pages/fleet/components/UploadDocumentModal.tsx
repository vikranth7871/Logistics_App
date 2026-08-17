import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { fleetApi } from '@api/index';
import {
  XIcon, PaperclipIcon, CameraIcon, CheckIcon,
  AlertCircleIcon, FileTextIcon, CalendarIcon
} from '@components/common/Icons';

export const DOCUMENT_TYPES = [
  { value: 'rc', label: 'Registration Certificate (RC Book)' },
  { value: 'insurance', label: 'Vehicle Insurance Policy' },
  { value: 'fitness', label: 'Fitness Certificate (FC)' },
  { value: 'permit', label: 'National / State Goods Permit' },
  { value: 'pollution', label: 'Pollution Under Control (PUC)' },
  { value: 'road_tax', label: 'Road Tax Token' },
  { value: 'other', label: 'Other Compliance Document' },
];

interface UploadDocumentModalProps {
  vehicleId: string;
  vehicleRegistration: string;
  initialType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDocumentModal({
  vehicleId,
  vehicleRegistration,
  initialType = 'insurance',
  onClose,
  onSuccess,
}: UploadDocumentModalProps) {
  const [type, setType] = useState(initialType);
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please choose a file or document photo to upload');
      return;
    }

    setIsSubmitting(true);
    try {
      await fleetApi.uploadVehicleDocument(
        vehicleId,
        file,
        {
          type,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          notes: notes.trim() || undefined,
        } as any,
        (progress) => setUploadProgress(progress)
      );

      toast.success('Document uploaded successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
        
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
              <PaperclipIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                Upload Vehicle Document
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                For Lorry <strong style={{ color: '#f97316', fontFamily: 'monospace' }}>{vehicleRegistration}</strong>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Document Type */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                Document Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-select"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {DOCUMENT_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Issue Date & Expiry Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expiry Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            {/* File Upload Box */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Select Document File <span style={{ color: '#ef4444' }}>*</span></span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>JPG, PNG, PDF up to 10MB</span>
              </label>

              <div style={{
                border: '2px dashed var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                background: 'var(--color-surface2)',
                cursor: 'pointer',
                position: 'relative',
              }}>
                <input
                  type="file"
                  required={!file}
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

                {preview ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ height: '56px', width: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#22c55e' }}>
                        ✓ {file?.name || 'document_file'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        {((file?.size || 0) / 1024).toFixed(0)} KB • Click to replace file
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(249,115,22,0.15)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CameraIcon size={18} />
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                      Click or drag document scan / photo here
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Supports clear camera photo or PDF certificates
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, background: '#f97316', height: '100%', transition: 'width 0.2s' }} />
              </div>
            )}

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes / Issuing Agency</label>
              <input
                type="text"
                placeholder="e.g. Issued by National Insurance Co. Ltd"
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
                  Uploading...
                </>
              ) : (
                <>
                  <CheckIcon size={16} /> Upload Document
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
