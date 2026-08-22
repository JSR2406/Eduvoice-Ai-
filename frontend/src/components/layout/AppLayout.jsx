import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Mic2, BookOpen, Clock, Settings, User,
  Menu, X, LogOut, Moon, Sun, Zap, FolderOpen, CreditCard, Coins
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generate',   icon: Mic2,            label: 'Generate Audio' },
  { to: '/templates',  icon: BookOpen,         label: 'Templates' },
  { to: '/history',    icon: Clock,            label: 'History' },
  { to: '/pricing',    icon: CreditCard,       label: 'Pricing & Plans' },
  { to: '/profile',    icon: User,             label: 'Profile' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Teacher'
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  const avatarUrl = profile?.avatar_url

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d0d1a' }}>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#13131f', borderRight: '1px solid rgba(99,102,241,0.12)' }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-indigo-900/30">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}
            >
              <Mic2 size={18} className="text-white" />
            </div>
            <span
              className="font-bold text-base"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              <span className="gradient-text">VoxGuru</span>
              <span className="text-slate-300"> AI</span>
            </span>
          </div>
          <button
            className="lg:hidden btn-ghost p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Generate CTA */}
        <div className="px-4 py-4 border-b border-indigo-900/20">
          <NavLink
            to="/generate"
            className="flex items-center gap-2 btn-primary w-full justify-center text-sm py-2.5"
            onClick={() => setSidebarOpen(false)}
          >
            <Zap size={15} />
            Quick Generate
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'nav-active'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-indigo-900/20">
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/40" />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#34d399)' }}
              >
                {initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.school || 'Teacher'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="btn-ghost flex-1 text-xs py-1.5 justify-center"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={handleSignOut}
              className="btn-ghost flex-1 text-xs py-1.5 justify-center text-red-400 hover:text-red-300"
            >
              <LogOut size={14} />
              <span className="ml-1">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-4 border-b"
          style={{ borderColor: 'rgba(99,102,241,0.12)', background: 'rgba(13,13,26,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <button
            className="lg:hidden btn-ghost p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
              <Coins size={14} />
              <span>1,000 Credits</span>
            </div>
            <span className="badge" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <Zap size={10} />
              Pro Plan
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
