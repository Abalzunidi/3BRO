import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { TripProvider } from '@/context/TripContext'
import { AuthProvider } from '@/context/AuthContext'
import { AuthGate } from '@/components/auth/AuthGate'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Schedule } from '@/pages/Schedule'
import { Activities } from '@/pages/Activities'
import { Budget } from '@/pages/Budget'
import { Tasks } from '@/pages/Tasks'
import { Gallery } from '@/pages/Gallery'
import { Payments } from '@/pages/Payments'
import { Admin } from '@/pages/Admin'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TripProvider>
          <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
              <Routes>
                <Route element={<AuthGate />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/activities" element={<Activities />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TripProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
