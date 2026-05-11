import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  LayoutDashboard,
  Upload,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Activity,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & analytics' },
  { to: '/upload', icon: Upload, label: 'Upload Data', desc: 'Process student CSV' },
];

export default function AppShell() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-rose-500 flex items-center justify-center">
              <ShieldAlert size={16} className="text-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[var(--bg-surface)] pulse-dot" />
          </div>
          <div>
            <p className="font-display font-700 text-sm tracking-widest text-white uppercase">
              Failsafe
            </p>
            <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-wider uppercase">
              Intervention System
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label, desc }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white/8 border border-white/10 text-white'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-white/5 text-[var(--text-muted)] group-hover:text-white group-hover:bg-white/8'
                  }`}
                >
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-none mb-0.5">{label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{desc}</p>
                </div>
                {isActive && (
                  <ChevronRight size={12} className="ml-auto text-blue-400 flex-shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      <div className="px-3 py-3 mx-3 mb-3 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-emerald-400" />
          <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
            System Online
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">
          API: localhost:8000
        </p>
      </div>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/8 border border-transparent hover:border-rose-500/20 transition-all duration-200 group"
        >
          <div className="w-7 h-7 rounded-md bg-white/5 group-hover:bg-rose-500/15 flex items-center justify-center flex-shrink-0 transition-colors">
            <LogOut size={13} />
          </div>
          <div>
            <p className="text-sm font-medium text-left leading-none mb-0.5">Sign Out</p>
            <p className="text-[11px] text-[var(--text-muted)]">End session</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-[var(--bg-surface)] border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 bg-[var(--bg-surface)] border-r border-white/5 animate-slide-in-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-white/8 transition-colors"
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-surface)] border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-rose-500 flex items-center justify-center">
              <ShieldAlert size={12} className="text-white" />
            </div>
            <span className="font-display font-700 text-sm uppercase tracking-widest">Failsafe</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-[var(--text-muted)] hover:text-white hover:bg-white/8 transition-colors"
          >
            <Menu size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto grid-texture">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
