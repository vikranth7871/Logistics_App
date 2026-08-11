import React, { useState } from 'react';
import apiClient from '@api/client';
import { useQuery } from '@tanstack/react-query';
import { SearchIcon } from '@components/common/Icons';

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, entityFilter],
    queryFn: () => apiClient.get('/audit-logs', { params: { page, limit: 25, entityType: entityFilter || undefined } }).then(r => r.data.data),
  });

  const logs = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">{meta.total} system activity entries</p>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-select" style={{ width: '180px' }} value={entityFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setEntityFilter(e.target.value); setPage(1); }}>
          <option value="">All Entities</option>
          <option value="vehicle">Vehicle</option>
          <option value="driver">Driver</option>
          <option value="trip">Trip</option>
          <option value="fuel">Fuel</option>
          <option value="expense">Expense</option>
          <option value="invoice">Invoice</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <SearchIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No audit logs found</div>
                  </div>
                </td></tr>
              ) : (
                logs.map((l: any) => (
                  <tr key={l.id}>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {new Date(l.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{l.userName || 'System'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{l.userRole}</div>
                    </td>
                    <td>
                      <span className="badge badge-assigned" style={{ textTransform: 'uppercase' }}>
                        {l.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', textTransform: 'capitalize' }}>{l.entityType}</td>
                    <td style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                      {l.entityId || '—'}
                    </td>
                    <td style={{ fontSize: '12px' }}>{l.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
