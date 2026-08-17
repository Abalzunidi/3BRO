import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrip } from '@/context/TripContext'
import { useTheme } from '@/context/ThemeContext'
import { Login } from '@/pages/Login'
import { pathToSection } from '@/lib/sections'
import { applyChrome } from '@/lib/chrome'

export function AuthGate() {
  const { loading } = useTrip()
  const { member, needsSetup, canAccess, firstPath } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const lockScreen = loading || needsSetup || !member

  useEffect(() => {
    applyChrome(lockScreen ? 'dark' : theme)
  }, [lockScreen, theme])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0c0b0a] pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
        <div className="text-center">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="3 BRO" className="h-28 w-28 mx-auto mb-4 object-contain" />
          <p className="text-sm text-[#a39888]">Loading…</p>
        </div>
      </div>
    )
  }

  if (needsSetup || !member) return <Login />

  const section = pathToSection(location.pathname)
  if (section && !canAccess(section)) {
    return <Navigate to={firstPath} replace />
  }

  return <Outlet />
}
