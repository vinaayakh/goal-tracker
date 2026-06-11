import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, History, Target, Plus } from 'lucide-react'
import type { ReactNode } from 'react'
import { useUI } from '../../store/useUI'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history', label: 'Activity', icon: History },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="grid place-items-center size-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
        <Target size={18} className="text-white" />
      </div>
      <span className="text-lg font-semibold tracking-tight text-ink">
        Goal<span className="text-gradient">Tracker</span>
      </span>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const openCreate = useUI((s) => s.openCreate)
  const { pathname } = useLocation()

  return (
    <div className="min-h-full">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col gap-2 p-4 border-r border-white/8">
        <div className="py-3">
          <Logo />
        </div>
        <nav className="flex flex-col gap-1 mt-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive || (item.to === '/' && pathname.startsWith('/goal/'))
                    ? 'bg-white/10 text-ink'
                    : 'text-ink-soft hover:text-ink hover:bg-white/6',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={openCreate}
          className="mt-3 flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"
        >
          <Plus size={18} /> New Goal
        </button>
        <div className="mt-auto px-3 text-xs text-ink-faint">
          Local-first · your data stays on this device
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 pb-28 lg:pb-12 pt-5">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-white/10 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-center justify-around">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[11px] font-medium transition-colors',
                  isActive || (item.to === '/' && pathname.startsWith('/goal/'))
                    ? 'text-ink'
                    : 'text-ink-faint',
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </div>
        <motion.button
          onClick={openCreate}
          whileTap={{ scale: 0.9 }}
          className="absolute -top-7 right-5 grid place-items-center size-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/40"
        >
          <Plus size={24} />
        </motion.button>
      </nav>
    </div>
  )
}
