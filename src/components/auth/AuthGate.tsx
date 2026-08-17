import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTrip } from '@/context/TripContext'
import { Login } from '@/pages/Login'
import { pathToSection } from '@/lib/sections'

export function AuthGate() {
  const { loading } = useTrip()
  const { member, needsSetup, canAccess, firstPath } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="3 BRO" className="h-14 w-14 rounded-2xl mx-auto mb-3 object-cover" />
          <p className="text-sm text-muted-foreground">Loading…</p>
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
