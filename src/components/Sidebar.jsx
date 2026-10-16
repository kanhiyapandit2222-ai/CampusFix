import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusSquare,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
  Bell,
  Menu,
  X,
  Wrench,
} from 'lucide-react';
import { getInitials } from '../utils/helpers';

/* ── Navigation configs ─────────────────────────────────── */
const STUDENT_NAV = [
  {
    section: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard' },
      { icon: ClipboardList,  label: 'My Complaints',     path: '/my-complaints', badge: null },
      { icon: PlusSquare,     label: 'Submit Complaint',  path: '/submit' },
    ],
  },
];

const ADMIN_NAV = [
  {
    section: 'Management',
    items: [
      { icon: ShieldCheck,    label: 'Admin Dashboard',  path: '/admin' },
      { icon: ClipboardList,  label: 'All Complaints',   path: '/admin/complaints' },
    ],
  },
  {
    section: 'System',
    items: [
      { icon: Settings,       label: 'Settings',         path: '/admin/settings' },
    ],
  },
];

/* ── Sidebar Component ──────────────────────────────────── */
export function Sidebar({ user, onLogout, isOpen, onClose }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();
  const isAdmin   = user?.role === 'admin';
  const navGroups = isAdmin ? ADMIN_NAV : STUDENT_NAV;

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${isOpen ? '' : ' hidden'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${isOpen ? ' open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Wrench size={18} />
          </div>
          <div className="sidebar-logo-text">
            <span className="brand-name">CampusFix</span>
            <span className="brand-tagline">Maintenance Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navGroups.map(group => (
            <div key={group.section}>
              <div className="nav-section-label">{group.section}</div>
              {group.items.map(item => {
                const Icon   = item.icon;
                const active = pathname === item.path ||
                               (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    className={`nav-item${active ? ' active' : ''}`}
                    onClick={() => handleNav(item.path)}
                  >
                    <Icon size={17} className="nav-icon" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div
            className="sidebar-user"
            onClick={onLogout}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogout(); }}
            role="button"
            tabIndex={0}
            title="Click to sign out"
          >
            <div className="user-avatar">{getInitials(user?.name ?? 'U')}</div>
            <div className="user-info">
              <div className="user-name">{user?.name ?? 'User'}</div>
              <div className="user-role">{user?.role === 'admin' ? 'Administrator' : `${user?.department ?? 'Student'}`}</div>
            </div>
            <LogOut size={15} style={{ color: 'rgba(214,240,232,.55)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Mobile Header ──────────────────────────────────────── */
export function MobileHeader({ onOpen, brandName = 'CampusFix' }) {
  return (
    <div className="mobile-header">
      <button className="hamburger" onClick={onOpen} aria-label="Open navigation">
        <Menu size={22} />
      </button>
      <span className="mobile-brand">{brandName}</span>
    </div>
  );
}
