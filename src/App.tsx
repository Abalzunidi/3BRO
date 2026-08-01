import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'
import { TripProvider } from '@/context/TripContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Schedule } from '@/pages/Schedule'
import { Activities } from '@/pages/Activities'
import { Budget } from '@/pages/Budget'
import { Tasks } from '@/pages/Tasks'
import { Gallery } from '@/pages/Gallery'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TripProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/gallery" element={<Gallery />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TripProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
