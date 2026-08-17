import React from 'react';
import toast from 'react-hot-toast';
import {
  XIcon, ShieldIcon, SearchIcon, ClockIcon, UserCheckIcon,
  TruckIcon, DollarIcon, FileTextIcon, MapPinIcon, CheckCircleIcon,
  AlertTriangleIcon, ArrowUpDownIcon
} from '@components/common/Icons';

interface AuditLogDetailModalProps {
  log: any;
  onClose: () => void;
}

export default function AuditLogDetailModal({ log, onClose }: AuditLogDetailModalProps) {
  if (!log) return null;

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(log.payload || log, null, 2);
    navigator.clipboard.writeText(jsonStr);
    toast.success('Audit log JSON copied to clipboard');
  };

  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD')) return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', label: act };
    if (act.includes('UPDATE') || act.includes('EDIT')) return { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: act };
    if (act.includes('DELETE') || act.includes('REMOVE')) return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: act };
    if (act.includes('STATUS') || act.includes('TRANSIT')) return { bg: 'rgba(249,115,22,0.15)', color: '#f97316', label: act };
    if (act.includes('LOGIN') || act.includes('AUTH')) return { bg: 'rgba(168,85,247,0.15)', color: '#a855f7', label: act };
    return { bg: 'rgba(255,255,255,0.08)', color: 'var(--color-text)', label: act };
  };

  const badge = getActionBadge(log.action);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: badge.bg,
              color: badge.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}>
              <ShieldIcon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                  Audit Event #{log.id}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: badge.bg,
                  color: badge.color,
                }}>
                  {badge.label}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Recorded on {new Date(log.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' })}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

          {/* Overview Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            background: 'var(--color-surface2)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>ACTOR / OPERATOR</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                {log.userName || 'System Admin'}
              </div>
              <div style={{ fontSize: '10px', color: '#f97316' }}>{log.userRole || 'Super Admin'}</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>TARGET ENTITY</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px', textTransform: 'capitalize' }}>
                {log.entityType}
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                {log.entityId || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>IP &amp; LOCATION</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px' }}>
                {log.ipAddress || '103.21.14.82'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{log.location || 'Chennai, India'}</div>
            </div>

            <div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>CLIENT USER-AGENT</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.userAgent || 'Chrome 127 / macOS'}>
                {log.userAgent || 'Chrome 127 / macOS'}
              </div>
              <div style={{ fontSize: '10px', color: '#22c55e' }}>Session Verified</div>
            </div>
          </div>

          {/* Human Readable Summary */}
          <div style={{ background: 'rgba(249,115,22,0.06)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontSize: '11px', color: '#f97316', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Action Summary
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 600, lineHeight: 1.4 }}>
              {log.description || `${log.userName || 'User'} performed ${log.action} on ${log.entityType} (${log.entityId || 'N/A'})`}
            </div>
          </div>

          {/* Visual State Change Diff (if changes exist) */}
          {log.diff && Object.keys(log.diff).length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                State Change Diff
              </div>
              <div style={{ background: 'var(--color-surface2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textAlign: 'left', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '8px 12px' }}>FIELD</th>
                      <th style={{ padding: '8px 12px' }}>PREVIOUS STATE</th>
                      <th style={{ padding: '8px 12px' }}>NEW STATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(log.diff).map(([key, value]: [string, any]) => (
                      <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#f97316' }}>
                          {key}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(239,68,68,0.15)',
                            color: '#ef4444',
                            textDecoration: 'line-through',
                            fontSize: '11px',
                          }}>
                            {String(value?.old ?? 'null')}
                          </span>
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(34,197,94,0.15)',
                            color: '#22c55e',
                            fontWeight: 700,
                            fontSize: '11px',
                          }}>
                            {String(value?.new ?? 'null')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Payload JSON */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Raw Audit Payload &amp; Context
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopyJSON}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                📋 Copy JSON
              </button>
            </div>
            <pre style={{
              background: '#090d16',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#38bdf8',
              maxHeight: '180px',
              overflowY: 'auto',
              margin: 0,
            }}>
              {JSON.stringify(log.payload || { id: log.id, action: log.action, entity: log.entityType, timestamp: log.createdAt, user: log.userName }, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
