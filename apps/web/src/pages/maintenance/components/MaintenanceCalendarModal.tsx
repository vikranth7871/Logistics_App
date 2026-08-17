import React, { useState } from 'react';
import {
  XIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon,
  WrenchIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon
} from '@components/common/Icons';

interface MaintenanceCalendarModalProps {
  records: any[];
  onClose: () => void;
  onSelectRecord: (record: any) => void;
}

export default function MaintenanceCalendarModal({
  records,
  onClose,
  onSelectRecord,
}: MaintenanceCalendarModalProps) {
  const [currentMonth, setCurrentMonth] = useState('August 2026');

  // Days in August 2026 (Aug 1 is Saturday)
  const daysInMonth = 31;
  const startDayOffset = 6; // Saturday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Group records by day of month
  const recordsByDay: Record<number, any[]> = {};
  records.forEach((r) => {
    const d = new Date(r.serviceDate || r.date);
    const day = d.getDate();
    if (!recordsByDay[day]) recordsByDay[day] = [];
    recordsByDay[day].push(r);
  });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(59,130,246,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <CalendarIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>
                Maintenance Schedule Calendar
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Fleet servicing workload &amp; upcoming inspection schedule
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '18px' }}>
          {/* Controls & Month Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <ChevronLeftIcon size={14} />
              </button>
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text)' }}>
                {currentMonth}
              </span>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <ChevronRightIcon size={14} />
              </button>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
              <span><span style={{ color: '#22c55e' }}>●</span> Completed</span>
              <span><span style={{ color: '#3b82f6' }}>●</span> In Progress</span>
              <span><span style={{ color: '#eab308' }}>●</span> Scheduled</span>
              <span><span style={{ color: '#ef4444' }}>●</span> Overdue</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            background: 'var(--color-surface2)',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--color-border)'
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
              <div key={dayName} style={{
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                padding: '6px 0'
              }}>
                {dayName}
              </div>
            ))}

            {/* Empty slots before Aug 1 (Saturday) */}
            {Array.from({ length: startDayOffset }).map((_, idx) => (
              <div key={`empty-${idx}`} style={{ minHeight: '75px', opacity: 0.2 }} />
            ))}

            {/* Day slots */}
            {daysArray.map((day) => {
              const dayRecords = recordsByDay[day] || [];
              const isToday = day === 14;

              return (
                <div
                  key={`day-${day}`}
                  style={{
                    minHeight: '75px',
                    background: isToday ? 'rgba(249,115,22,0.08)' : 'var(--color-surface)',
                    border: isToday ? '1px solid #f97316' : '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: isToday ? 800 : 600,
                    color: isToday ? '#f97316' : 'var(--color-text-muted)',
                    textAlign: 'right'
                  }}>
                    {day}
                  </div>

                  {/* Badges for tasks on this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {dayRecords.map((r: any) => {
                      const color =
                        r.status === 'completed'
                          ? '#22c55e'
                          : r.status === 'in_progress'
                          ? '#3b82f6'
                          : r.status === 'overdue'
                          ? '#ef4444'
                          : '#eab308';

                      return (
                        <div
                          key={r.id}
                          onClick={() => {
                            onClose();
                            onSelectRecord(r);
                          }}
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '2px 4px',
                            borderRadius: '4px',
                            background: `rgba(${r.status === 'completed' ? '34,197,94' : r.status === 'in_progress' ? '59,130,246' : r.status === 'overdue' ? '239,68,68' : '234,179,8'}, 0.15)`,
                            color: color,
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={`${r.vehicleReg || r.vehicle?.registrationNumber}: ${r.typeLabel || r.type} - ₹${Number(r.cost || 0).toLocaleString()}`}
                        >
                          {r.vehicleReg || r.vehicle?.registrationNumber?.slice(-4)}: {r.typeLabel || r.type}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
