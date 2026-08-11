import React, { useState } from 'react';
import { useCustomers } from '@hooks/useERP';
import { PlusIcon, SearchIcon, BuildingIcon, UsersIcon } from '@components/common/Icons';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCustomers({ page, limit: 20, search: search || undefined });
  const customers = data?.items || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{meta.total} customers registered</p>
        </div>
        <button
          className="btn btn-primary"
          id="add-customer-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusIcon size={16} /> Add Customer
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input">
          <span className="search-icon" style={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon size={16} color="var(--color-text-muted)" />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone or GST…"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }}
            id="customer-search"
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>GST Number</th>
                <th>Credit Limit</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" /></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <BuildingIcon size={40} color="var(--color-text-dim)" />
                    </div>
                    <div className="empty-state-text">No customers found</div>
                  </div>
                </td></tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      {c.contactPerson && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <UsersIcon size={12} /> {c.contactPerson}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>{c.phone || '—'}</div>
                      {c.email && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{c.email}</div>}
                    </td>
                    <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{c.gstNumber || '—'}</td>
                    <td style={{ fontSize: '12px' }}>₹{Number(c.creditLimit || 0).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: Number(c.outstandingBalance) > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
                      ₹{Number(c.outstandingBalance || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td><button className="btn btn-secondary btn-sm">View</button></td>
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
