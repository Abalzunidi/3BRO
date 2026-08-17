import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarDays,
  MapPinned,
  Wallet,
  Banknote,
  CheckSquare,
  Images,
  Shield,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { APP_SECTIONS } from '@/lib/sections'

const icons = {
  dashboard: LayoutDashboard,
  schedule: CalendarDays,
  activities: MapPinned,
  budget: Wallet,
  payments: Banknote,
  tasks: CheckSquare,
  gallery: Images,
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { canAccess, isAdmin, member, logout } = useAuth()
  const visible = APP_SECTIONS.filter((item) => canAccess(item.id))

  const content = (
    <div className="flex h-full flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sidebar-border)]">
        <div className="flex items-center min-w-0">
          <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="3 BRO" className="h-10 w-10 rounded-xl object-cover shadow-sm shrink-0" />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden h-11 w-11 flex items-center justify-center rounded-xl hover:bg-accent cursor-pointer touch-manipulation shrink-0"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visible.map((item) => {
          const Icon = icons[item.id]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-3.5 py-3.5 text-sm font-medium transition-all duration-200 touch-manipulation min-h-12',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          )
        })}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3.5 py-3.5 text-sm font-medium transition-all duration-200 touch-manipulation min-h-12',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-foreground'
              )
            }
          >
            <Shield className="h-5 w-5 shrink-0" />
            Admin
          </NavLink>
        )}
      </nav>

      <div className="px-5 py-4 border-t border-[var(--sidebar-border)] space-y-2">
        {member && (
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate">{member.name}</p>
            <button
              type="button"
              onClick={() => {
                onClose()
                logout()
              }}
              className="text-xs text-primary font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground text-center">3bro © {new Date().getFullYear()}</p>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] z-30">
        {content}
      </aside>

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
