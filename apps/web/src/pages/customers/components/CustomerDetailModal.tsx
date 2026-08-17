import React, { useState } from 'react';
import { useDeleteCustomer } from '@hooks/useERP';
import { useAuthStore } from '@store/auth.store';
import {
  XIcon, BuildingIcon, CheckIcon, PaperclipIcon, PhoneIcon,
  MailIcon, DollarIcon, FileTextIcon, UsersIcon, MapPinIcon,
  AlertTriangleIcon, DownloadIcon, EditIcon, TrashIcon, CheckCircleIcon,
  TrendingUpIcon, WalletIcon, CalendarIcon, TruckIcon
} from '@components/common/Icons';

interface CustomerDetailModalProps {
  customer: any;
  onClose: () => void;
  onEdit?: (customer: any) => void;
}

export default function CustomerDetailModal({ customer, onClose, onEdit }: CustomerDetailModalProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const deleteMut = useDeleteCustomer();

  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'invoices' | 'ledger' | 'payments' | 'documents'>('overview');

  // Calculations
  const creditLimit = Number(customer.creditLimit || 500000);
  const outstanding = Number(customer.outstandingBalance || customer.outstanding || 120000);
  const totalBusiness = Number(customer.totalBusiness || 2500000);
  const totalPaid = Number(customer.totalPaid || 2000000);
  const availableCredit = Math.max(0, creditLimit - outstanding);
  const utilizationPct = Math.round((outstanding / (creditLimit || 1)) * 100);

  const isCreditWarning = utilizationPct >= 80;

  // Demo Ledger
  const ledgerEntries = [
    { date: '11/08/2026', ref: 'INV-2026-00023', desc: 'Trip Billing (Chennai → Madurai)', debit: 200000, credit: 0, balance: 200000 },
    { date: '15/08/2026', ref: 'PAY-2026-00012', desc: 'NEFT Payment Received', debit: 0, credit: 100000, balance: 100000 },
    { date: '18/08/2026', ref: 'INV-2026-00029', desc: 'Trip Billing (Coimbatore → Salem)', debit: 20000, credit: 0, balance: 120000 },
  ];

  // Demo Trips
  const customerTrips = [
    { tripNumber: 'TRP-2026-00023', route: 'Chennai → Madurai', vehicle: 'TN72BT7517', date: '11 Aug 2026', amount: 200000, status: 'Delivered' },
    { tripNumber: 'TRP-2026-00029', route: 'Coimbatore → Salem', vehicle: 'TN01AB2345', date: '18 Aug 2026', amount: 20000, status: 'In Transit' },
    { tripNumber: 'TRP-2026-00018', route: 'Tirunelveli → Chennai', vehicle: 'TN02EF5678', date: '02 Aug 2026', amount: 150000, status: 'Delivered' },
  ];

  // Demo Invoices
  const customerInvoices = [
    { invoiceNumber: 'INV-2026-00023', date: '11 Aug 2026', amount: 200000, paid: 100000, balance: 100000, status: 'Partially Paid' },
    { invoiceNumber: 'INV-2026-00029', date: '18 Aug 2026', amount: 20000, paid: 0, balance: 20000, status: 'Unpaid' },
    { invoiceNumber: 'INV-2026-00018', date: '02 Aug 2026', amount: 150000, paid: 150000, balance: 0, status: 'Paid' },
  ];

  // Demo Payments
  const customerPayments = [
    { date: '15 Aug 2026', ref: 'PAY-2026-00012', amount: 100000, mode: 'Bank Transfer (NEFT)', invoiceRef: 'INV-2026-00023' },
    { date: '05 Aug 2026', ref: 'PAY-2026-00008', amount: 150000, mode: 'RTGS / Wire', invoiceRef: 'INV-2026-00018' },
  ];

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove customer ${customer.name}?`)) {
      if (customer.id && !customer.id.startsWith('demo-')) {
        await deleteMut.mutateAsync(customer.id);
      }
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: customer.avatarColor || 'rgba(249,115,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '15px',
              color: '#fff',
            }}>
              {customer.avatarInitials || customer.name?.slice(0, 2).toUpperCase() || 'AB'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title" style={{ fontSize: '18px', fontWeight: 800 }}>
                  {customer.name}
                </span>
                <span className={`badge ${customer.status === 'blocked' ? 'badge-danger' : customer.isActive === false ? 'badge-inactive' : 'badge-active'}`}>
                  {customer.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>GST: <strong style={{ fontFamily: 'monospace', color: 'var(--color-text)' }}>{customer.gstNumber || '33AABCA1234B1ZP'}</strong></span>
                <span>•</span>
                <span>{customer.city || 'Coimbatore'}, {customer.state || 'Tamil Nadu'}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface2)', padding: '0 16px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'trips', label: 'Trips (3)' },
            { id: 'invoices', label: 'Invoices (3)' },
            { id: 'ledger', label: 'Customer Ledger' },
            { id: 'payments', label: 'Payments' },
            { id: 'documents', label: 'Documents & Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 14px',
                border: 'none',
                background: 'none',
                color: activeTab === tab.id ? '#f97316' : 'var(--color-text-muted)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Financial Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Business</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text)', marginTop: '2px' }}>
                    ₹{totalBusiness.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10px', color: '#22c55e', marginTop: '2px' }}>Lifetime Freight</div>
                </div>

                <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Paid</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#22c55e', marginTop: '2px' }}>
                    ₹{totalPaid.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>80% Settled</div>
                </div>

                <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Outstanding</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>
                    ₹{outstanding.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10px', color: '#f87171', marginTop: '2px' }}>Due for collection</div>
                </div>

                <div className="card" style={{ padding: '12px', background: 'var(--color-surface2)', margin: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Available Credit</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>
                    ₹{availableCredit.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-dim)', marginTop: '2px' }}>Limit: ₹{creditLimit.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Credit Limit Protection Warning (Requirement 13) */}
              {isCreditWarning && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ef4444',
                  fontSize: '12px',
                }}>
                  <AlertTriangleIcon size={18} />
                  <div>
                    <strong>Credit Limit Warning:</strong> Customer has utilized <strong>{utilizationPct}%</strong> of their allowed credit limit. Manager approval is required before creating new freight trips or booking invoices.
                  </div>
                </div>
              )}

              {/* Info Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                {/* Contact Information */}
                <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UsersIcon size={14} /> Contact &amp; Personnel
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Contact Person:</span>
                      <span style={{ fontWeight: 600 }}>{customer.contactPerson || 'Arun Kumar'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Mobile Phone:</span>
                      <span style={{ fontWeight: 600, color: '#f97316' }}>{customer.phone || '9944112233'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Email:</span>
                      <span>{customer.email || 'abc.traders@email.com'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Customer Since:</span>
                      <span>15 Jan 2026</span>
                    </div>
                  </div>
                </div>

                {/* Billing & Tax Details */}
                <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileTextIcon size={14} /> Commercial &amp; Tax Information
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>GST Number:</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{customer.gstNumber || '33AABCA1234B1ZP'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Payment Terms:</span>
                      <span style={{ fontWeight: 600 }}>{customer.creditDays || 30} Days Credit</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Dispatch Address:</span>
                      <span style={{ textAlign: 'right', color: 'var(--color-text)' }}>{customer.address || 'Industrial Estate, Coimbatore'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: TRIPS HISTORY ── */}
          {activeTab === 'trips' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Trips Dispatched for Customer</span>
                <button className="btn btn-primary btn-sm" style={{ background: '#f97316', fontSize: '11px' }}>
                  + Book Trip
                </button>
              </div>
              <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Trip ID</th>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Date</th>
                    <th>Freight (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTrips.map((t) => (
                    <tr key={t.tripNumber}>
                      <td style={{ fontWeight: 700, color: '#3b82f6' }}>{t.tripNumber}</td>
                      <td>{t.route}</td>
                      <td style={{ fontWeight: 600 }}>{t.vehicle}</td>
                      <td>{t.date}</td>
                      <td style={{ fontWeight: 700 }}>₹{t.amount.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${t.status === 'Delivered' ? 'badge-active' : 'badge-in_trip'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 3: INVOICES ── */}
          {activeTab === 'invoices' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Customer Invoices</span>
                <button className="btn btn-primary btn-sm" style={{ background: '#f97316', fontSize: '11px' }}>
                  + Create Invoice
                </button>
              </div>
              <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Total (₹)</th>
                    <th>Paid (₹)</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerInvoices.map((inv) => (
                    <tr key={inv.invoiceNumber}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{inv.invoiceNumber}</td>
                      <td>{inv.date}</td>
                      <td style={{ fontWeight: 700 }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                      <td style={{ color: '#22c55e' }}>₹{inv.paid.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: inv.balance > 0 ? '#f87171' : '#22c55e' }}>
                        ₹{inv.balance.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${inv.status === 'Paid' ? 'badge-active' : inv.status === 'Partially Paid' ? 'badge-warning' : 'badge-danger'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 4: CUSTOMER LEDGER (Requirement 12) ── */}
          {activeTab === 'ledger' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Customer Statement &amp; Ledger</span>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Showing debits, credits, and running balance</div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <DownloadIcon size={13} /> Export Ledger PDF
                </button>
              </div>
              <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Debit (₹)</th>
                    <th style={{ textAlign: 'right' }}>Credit (₹)</th>
                    <th style={{ textAlign: 'right' }}>Balance (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.map((l, i) => (
                    <tr key={i}>
                      <td>{l.date}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.ref}</td>
                      <td>{l.desc}</td>
                      <td style={{ textAlign: 'right', color: l.debit > 0 ? '#f87171' : 'inherit', fontWeight: l.debit > 0 ? 700 : 400 }}>
                        {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', color: l.credit > 0 ? '#22c55e' : 'inherit', fontWeight: l.credit > 0 ? 700 : 400 }}>
                        {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#f97316' }}>
                        ₹{l.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 5: PAYMENTS ── */}
          {activeTab === 'payments' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Payment Receipts</span>
                <button className="btn btn-primary btn-sm" style={{ background: '#f97316', fontSize: '11px' }}>
                  + Record Payment
                </button>
              </div>
              <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Receipt Ref</th>
                    <th>Amount Received</th>
                    <th>Payment Mode</th>
                    <th>Settled Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {customerPayments.map((p) => (
                    <tr key={p.ref}>
                      <td>{p.date}</td>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>{p.ref}</td>
                      <td style={{ fontWeight: 800, color: '#22c55e' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                      <td>{p.mode}</td>
                      <td style={{ fontFamily: 'monospace' }}>{p.invoiceRef}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── TAB 6: DOCUMENTS & NOTES ── */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Internal Management Notes</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text)', background: 'var(--color-surface)', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                  {customer.notes || 'Customer prefers payment within 15 days. Primary contact available between 9 AM and 6 PM. Special freight rate agreed for Chennai–Coimbatore route.'}
                </div>
              </div>

              <div className="card" style={{ padding: '14px', background: 'var(--color-surface2)', margin: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Uploaded Verification Documents</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['GST Registration Certificate.pdf', 'Company PAN Card Copy.pdf', 'Master Freight Contract 2026.pdf'].map((doc) => (
                    <div
                      key={doc}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                      onClick={() => alert(`Opening ${doc}...`)}
                    >
                      <PaperclipIcon size={14} color="#f97316" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <EditIcon size={13} /> Edit Profile
              </button>
            )}
            {isAdmin && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleDelete}
                style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <TrashIcon size={13} /> Delete
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => alert('Exporting customer profile PDF...')}>
              <DownloadIcon size={13} /> Export PDF
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
