import { useMemo, useState } from 'react'
import {
  MapPin,
  Calendar,
  CalendarCheck,
  Wallet,
  TrendingUp,
  Plane,
  Clock,
  Edit3,
  Compass,
} from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { DashboardCard } from '@/components/shared/DashboardCard'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarWidget } from '@/components/shared/Calendar'
import { useTrip } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { motion } from 'framer-motion'

export function Dashboard() {
  const { trip, schedule, activities, progress, totalSpent } = useTrip()
  const { isAdmin } = useAuth()
  const [calDate, setCalDate] = useState<Date | undefined>()

  const hasTripInfo = trip.name || trip.destination || trip.travelDate

  const countdown = useMemo(() => {
    if (!trip.travelDate) return null
    const d = parseISO(trip.travelDate)
    if (!isValid(d)) return null
    const days = differenceInCalendarDays(d, new Date())
    return days
  }, [trip.travelDate])

  const recentActivities = [...schedule, ...activities]
    .filter((a) => a.name)
    .slice(-5)
    .reverse()

  const markedDates = useMemo(() => {
    const dates: Date[] = []
    if (trip.travelDate) {
      const d = parseISO(trip.travelDate)
      if (isValid(d)) dates.push(d)
    }
    if (trip.returnDate) {
      const d = parseISO(trip.returnDate)
      if (isValid(d)) dates.push(d)
    }
    return dates
  }, [trip.travelDate, trip.returnDate])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {hasTripInfo
              ? `Welcome to ${trip.name || 'your trip'}`
              : 'Start planning your trip'}
          </p>
        </div>
      </motion.div>

      {!hasTripInfo ? (
        <EmptyState
          icon={Compass}
          title="Start planning your trip"
          description="Open Settings to set your trip name, destination, dates, and budget — then build your schedule."
        />
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <DashboardCard
          title="Trip Name"
          value={trip.name || 'Not set'}
          icon={Plane}
          placeholder={!trip.name}
          delay={0}
        />
        <DashboardCard
          title="Destination"
          value={trip.destination || 'Not set'}
          icon={MapPin}
          placeholder={!trip.destination}
          delay={0.05}
        />
        <DashboardCard
          title="Travel Date"
          value={trip.travelDate ? formatDate(trip.travelDate) : 'Not set'}
          icon={Calendar}
          placeholder={!trip.travelDate}
          delay={0.1}
        />
        <DashboardCard
          title="Return Date"
          value={trip.returnDate ? formatDate(trip.returnDate) : 'Not set'}
          icon={CalendarCheck}
          placeholder={!trip.returnDate}
          delay={0.15}
        />
        <DashboardCard
          title="Budget"
          value={trip.budget > 0 ? formatCurrency(trip.budget) : 'Not set'}
          icon={Wallet}
          placeholder={!trip.budget}
          delay={0.2}
        />
        <DashboardCard
          title="Progress"
          value={`${progress}%`}
          icon={TrendingUp}
          placeholder={progress === 0}
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trip Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressBar value={progress} label="Overall completion" />
            {trip.budget > 0 && (
              <ProgressBar
                value={Math.min(100, (totalSpent / trip.budget) * 100)}
                label="Budget used"
              />
            )}
            {progress === 0 && (
              <p className="text-sm text-muted-foreground">
                Add activities and tasks to track your planning progress.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Countdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {countdown !== null ? (
              <div className="text-center py-4">
                <p className="font-display text-5xl font-bold text-primary">
                  {countdown > 0 ? countdown : countdown === 0 ? '0' : Math.abs(countdown)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {countdown > 0
                    ? 'days until departure'
                    : countdown === 0
                      ? 'Departure day!'
                      : 'days since departure'}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Set a travel date to see the countdown</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No activities yet"
                description="Add activities from the Schedule or Activities page."
                className="border-0 bg-transparent py-10"
              />
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border p-3 hover:bg-accent/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{a.name}</p>
                      {'location' in a && a.location && (
                        <p className="text-xs text-muted-foreground truncate">{a.location}</p>
                      )}
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CalendarWidget selected={calDate} onSelect={setCalDate} markedDates={markedDates} />
      </div>

      {isAdmin && !hasTripInfo && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => {
              const btn = document.querySelector('[aria-label="Settings"]') as HTMLButtonElement | null
              btn?.click()
            }}
          >
            <Edit3 className="h-4 w-4" />
            Open Settings to get started
          </Button>
        </div>
      )}
    </div>
  )
}
