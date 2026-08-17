import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useRealtimeNotifications,
} from '@hooks/useNotifications';
import {
  BellIcon,
  CheckIcon,
  MapPinIcon,
  TruckIcon,
  ReceiptIcon,
  DollarIcon,
  WrenchIcon,
  AlertCircleIcon,
  XIcon,
} from '@components/common/Icons';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotifications(page);
  const markReadMutation = useMarkRead();
  const markAllReadMutation = useMarkAllRead();

  const notifications = data?.items || [];
  const meta = data?.meta || { total: 0 };

  const filteredItems = notifications.filter((n: any) =>
    filter === 'unread' ? !n.isRead : true
  );

  const handleItemClick = (n: any) => {
    if (!n.isRead) {
      markReadMutation.mutate(n.id);
    }

    onClose();

    // Navigate to entity if entityType and entityId exist
    if (n.entityType === 'trip' && n.entityId) {
      navigate(`/trips/${n.entityId}`);
    } else if (n.entityType === 'vehicle' && n.entityId) {
      navigate(`/fleet/${n.entityId}`);
    } else if (n.entityType === 'driver' && n.entityId) {
      navigate(`/drivers`);
    } else if (n.entityType === 'invoice' && n.entityId) {
      navigate(`/billing`);
    } else if (n.entityType === 'expense') {
      navigate(`/expenses`);
    }
  };

  return (
    <div
      className="card"
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '10px',
        width: '380px',
        maxHeight: '480px',
        zIndex: 1000,
        padding: 0,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>Notifications</div>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px',
              borderRadius: '6px',
            }}
          >
            <button
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '2px 8px', fontSize: '11px', height: 'auto' }}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '2px 8px', fontSize: '11px', height: 'auto' }}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            title="Mark all as read"
          >
            <CheckIcon size={12} /> Mark all read
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-dim)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={onClose}
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div className="spinner" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-dim)' }}>
            <BellIcon size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <div style={{ fontSize: '13px', fontWeight: 500 }}>No notifications found</div>
          </div>
        ) : (
          filteredItems.map((n: any) => (
            <div
              key={n.id}
              onClick={() => handleItemClick(n)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)',
                transition: 'background 0.2s ease',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = n.isRead
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(99, 102, 241, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = n.isRead
                  ? 'transparent'
                  : 'rgba(99, 102, 241, 0.06)';
              }}
            >
              {/* Type Icon */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: getIconBackground(n.severity),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '2px',
                  flexShrink: 0,
                }}
              >
                {getTypeIcon(n.type)}
              </div>

              {/* Text Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: n.isRead ? 600 : 700,
                      color: n.isRead ? 'var(--color-text)' : 'var(--color-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {n.title}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', flexShrink: 0 }}>
                    {formatTimeAgo(n.createdAt)}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-dim)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {n.message}
                </div>
              </div>

              {/* Unread Indicator Dot */}
              {!n.isRead && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    marginTop: '6px',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function NotificationBellButton() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: unreadApiCount } = useUnreadCount();
  const { data: notificationsData } = useNotifications(1);
  useRealtimeNotifications(); // Subscribes to real-time events & displays toast notifications

  // Calculate actual unread count
  const unreadCount = typeof unreadApiCount === 'number' && unreadApiCount > 0
    ? unreadApiCount
    : (notificationsData?.items || []).filter((n: any) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="notif-btn"
        id="notifications-btn"
        aria-label="Notifications"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ cursor: 'pointer' }}
      >
        <BellIcon size={18} />
        {unreadCount > 0 && (
          <span
            className="notif-dot"
            style={{
              background: '#f97316',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 800,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              boxShadow: '0 0 8px rgba(249,115,22,0.6)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationPanel onClose={() => setIsOpen(false)} />}
    </div>
  );
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'trip_assigned':
    case 'trip_started':
    case 'trip_delivered':
    case 'trip_completed':
      return <MapPinIcon size={16} color="var(--color-primary)" />;
    case 'document_expiring':
      return <TruckIcon size={16} color="var(--color-warning)" />;
    case 'license_expiring':
      return <AlertCircleIcon size={16} color="var(--color-warning)" />;
    case 'invoice_due':
      return <ReceiptIcon size={16} color="var(--color-info)" />;
    case 'expense_submitted':
      return <DollarIcon size={16} color="var(--color-success)" />;
    case 'maintenance_due':
      return <WrenchIcon size={16} color="var(--color-danger)" />;
    default:
      return <BellIcon size={16} color="var(--color-text)" />;
  }
}

function getIconBackground(severity: string) {
  switch (severity) {
    case 'success':
      return 'rgba(16, 185, 129, 0.15)';
    case 'warning':
      return 'rgba(245, 158, 11, 0.15)';
    case 'error':
      return 'rgba(239, 68, 68, 0.15)';
    default:
      return 'rgba(99, 102, 241, 0.15)';
  }
}

function formatTimeAgo(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSecs < 60) return 'just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}
