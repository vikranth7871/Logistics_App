import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  XIcon, ShieldIcon, CheckIcon, UsersIcon
} from '@components/common/Icons';

interface CreateRoleModalProps {
  editRole?: any;
  onClose: () => void;
  onSave: (role: any) => void;
}

const MODULE_DEFINITIONS = [
  {
    category: 'OPERATIONS',
    modules: ['Fleet', 'Drivers', 'Trips', 'Fuel', 'Maintenance'],
  },
  {
    category: 'FINANCE',
    modules: ['Expenses', 'Customers', 'Billing', 'Payments'],
  },
  {
    category: 'ADMINISTRATION',
    modules: ['Reports', 'Users', 'Roles & Permissions', 'Audit Logs', 'Settings'],
  },
];

export default function CreateRoleModal({ editRole, onClose, onSave }: CreateRoleModalProps) {
  const [name, setName] = useState(editRole?.name || '');
  const [description, setDescription] = useState(editRole?.description || '');
  const [categoryBadge, setCategoryBadge] = useState(editRole?.categoryBadge || 'Operations');
  const [color, setColor] = useState(editRole?.color || '#3b82f6');

  // Permission matrix state: { [module]: { view: bool, create: bool, edit: bool, delete: bool } }
  const [permissions, setPermissions] = useState<Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>>(() => {
    if (editRole?.permissions) return editRole.permissions;
    const initial: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {};
    MODULE_DEFINITIONS.forEach((cat) => {
      cat.modules.forEach((mod) => {
        initial[mod] = { view: true, create: false, edit: false, delete: false };
      });
    });
    return initial;
  });

  // Toggle single permission
  const handleToggle = (module: string, action: 'view' | 'create' | 'edit' | 'delete') => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module]?.[action],
      },
    }));
  };

  // Toggle all permissions for a module
  const handleToggleModuleAll = (module: string, enable: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: { view: enable, create: enable, edit: enable, delete: enable },
    }));
  };

  // Copy template from predefined roles
  const handleCopyTemplate = (template: string) => {
    const updated: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }> = {};
    MODULE_DEFINITIONS.forEach((cat) => {
      cat.modules.forEach((mod) => {
        if (template === 'admin') {
          updated[mod] = { view: true, create: true, edit: true, delete: true };
        } else if (template === 'manager') {
          const isOps = cat.category === 'OPERATIONS' || mod === 'Reports';
          updated[mod] = { view: isOps, create: isOps, edit: isOps, delete: mod === 'Fleet' };
        } else if (template === 'accountant') {
          const isFin = cat.category === 'FINANCE' || mod === 'Reports';
          updated[mod] = { view: isFin, create: isFin, edit: isFin, delete: false };
        } else if (template === 'dispatcher') {
          const isDisp = mod === 'Trips' || mod === 'Drivers' || mod === 'Fleet';
          updated[mod] = { view: isDisp, create: isDisp, edit: isDisp, delete: false };
        } else {
          updated[mod] = { view: false, create: false, edit: false, delete: false };
        }
      });
    });
    setPermissions(updated);
    toast.success(`Copied permission template for ${template.toUpperCase()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a role name');
      return;
    }

    const newRole = {
      id: editRole?.id || `role-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom organizational access role',
      categoryBadge,
      color,
      isSystem: false,
      usersCount: editRole?.usersCount || 0,
      permissions,
      created: editRole?.created || 'Custom Role',
      createdBy: 'System Admin',
      lastModified: '14 Aug 2026',
    };

    onSave(newRole);
    toast.success(editRole ? 'Role updated successfully' : 'Custom role created successfully');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f97316',
            }}>
              <ShieldIcon size={20} />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '17px', fontWeight: 800 }}>
                {editRole ? 'Edit Access Role' : 'Create Custom Access Role'}
              </span>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                Configure fine-grained View, Create, Edit, and Delete privileges per module
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>

            {/* Role Name & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Operations Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / Scope Badge</label>
                <select
                  className="form-select"
                  value={categoryBadge}
                  onChange={(e) => {
                    setCategoryBadge(e.target.value);
                    if (e.target.value === 'Operations') setColor('#f97316');
                    else if (e.target.value === 'Finance') setColor('#a855f7');
                    else if (e.target.value === 'Administration') setColor('#ef4444');
                    else setColor('#22c55e');
                  }}
                >
                  <option value="Operations">Operations Scope</option>
                  <option value="Finance">Finance &amp; Billing</option>
                  <option value="Administration">System Administration</option>
                  <option value="Mobile Access">Mobile Driver Access</option>
                </select>
              </div>
            </div>

            {/* Description & Quick Template */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Role Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Manage daily fleet operations, trip planning and driver tracking"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Copy Template From</label>
                <select
                  className="form-select"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) handleCopyTemplate(e.target.value);
                  }}
                >
                  <option value="" disabled>-- Select Preset --</option>
                  <option value="admin">System Admin (Full Access)</option>
                  <option value="manager">Fleet Manager</option>
                  <option value="dispatcher">Dispatcher / Operations</option>
                  <option value="accountant">Accountant / Finance</option>
                </select>
              </div>
            </div>

            {/* RBAC Permission Matrix */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Module Permissions Matrix
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Granular CRUD permissions
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {MODULE_DEFINITIONS.map((group) => (
                  <div key={group.category} style={{ background: 'var(--color-surface2)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <div style={{
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderBottom: '1px solid var(--color-border)',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#f97316',
                      letterSpacing: '0.05em'
                    }}>
                      {group.category}
                    </div>

                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)', textAlign: 'center' }}>
                          <th style={{ textAlign: 'left', padding: '6px 12px' }}>MODULE</th>
                          <th style={{ width: '65px', padding: '6px' }}>VIEW</th>
                          <th style={{ width: '65px', padding: '6px' }}>CREATE</th>
                          <th style={{ width: '65px', padding: '6px' }}>EDIT</th>
                          <th style={{ width: '65px', padding: '6px' }}>DELETE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.modules.map((mod) => {
                          const p = permissions[mod] || { view: false, create: false, edit: false, delete: false };
                          return (
                            <tr key={mod} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{mod}</td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={p.view}
                                  onChange={() => handleToggle(mod, 'view')}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={p.create}
                                  onChange={() => handleToggle(mod, 'create')}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={p.edit}
                                  onChange={() => handleToggle(mod, 'edit')}
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={p.delete}
                                  onChange={() => handleToggle(mod, 'delete')}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ position: 'sticky', bottom: 0, zIndex: 10, background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-role-btn"
              style={{ background: '#f97316', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
            >
              <CheckIcon size={16} /> {editRole ? 'Save Changes' : 'Save Access Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
