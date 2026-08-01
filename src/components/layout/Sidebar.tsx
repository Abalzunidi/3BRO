import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  MapPinned,
  Wallet,
  CheckSquare,
  Images,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/activities', icon: MapPinned, label: 'Activities' },
  { to: '/budget', icon: Wallet, label: 'Budget' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/gallery', icon: Images, label: 'Gallery' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="3bro" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
          <div>
            <p className="font-display font-bold text-lg leading-none tracking-tight">3bro</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Travel Planner</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl hover:bg-accent cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--sidebar-border)]">
        <p className="text-xs text-muted-foreground text-center">3bro © {new Date().getFullYear()}</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] z-30">
        {content}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] lg:hidden shadow-2xl"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
