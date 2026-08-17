import { useState } from 'react'
import { Cloud, CloudOff, LogOut, Menu, Moon, RefreshCw, Search, Settings, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/shared/SearchInput'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/context/ThemeContext'
import { useTrip } from '@/context/TripContext'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme()
  const { trip, updateTrip, synced, loading, refresh } = useTrip()
  const { toast } = useToast()
  const { isAdmin, logout } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [form, setForm] = useState(trip)

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    const ok = await refresh()
    setRefreshing(false)
    toast(ok ? 'Updated' : 'Could not update', ok ? 'success' : 'error')
  }

  const openSettings = () => {
    setForm(trip)
    setSettingsOpen(true)
  }

  const saveSettings = () => {
    updateTrip({
      name: form.name,
      destination: form.destination,
      travelDate: form.travelDate,
      returnDate: form.returnDate,
      budget: Number(form.budget) || 0,
    })
    setSettingsOpen(false)
    toast('Trip settings saved')
  }

  return (
    <>
      <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 border-b border-border bg-card/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 pt-[env(safe-area-inset-top,0px)]">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-12 w-12 shrink-0 touch-manipulation"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center lg:hidden min-w-0">
          <img src={`${import.meta.env.BASE_URL}logo-mark.png`} alt="3 BRO" className="h-8 w-8 rounded-lg object-cover shrink-0" />
        </div>

        <div className="hidden md:block flex-1 max-w-md ml-2">
          <SearchInput placeholder="Search trips, activities..." readOnly onChange={() => {}} />
        </div>

        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-0.5 shrink-0">
          <span
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground"
            title={synced ? 'Synced' : 'Offline — saving locally'}
          >
            {loading ? null : synced ? (
              <>
                <Cloud className="h-3.5 w-3.5 text-emerald-500" />
                Synced
              </>
            ) : (
              <>
                <CloudOff className="h-3.5 w-3.5 text-amber-500" />
                Local
              </>
            )}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-12 w-12 touch-manipulation"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onClick={openSettings}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search across your trip plans</DialogDescription>
          </DialogHeader>
          <SearchInput placeholder="Search..." />
          <p className="text-xs text-muted-foreground text-center py-4">Search is UI only for now</p>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trip Settings</DialogTitle>
            <DialogDescription>Configure your trip details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer Adventure"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="e.g. Istanbul, Turkey"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="travel-date">Travel Date</Label>
                <Input
                  id="travel-date"
                  type="date"
                  value={form.travelDate}
                  onChange={(e) => setForm({ ...form, travelDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="return-date">Return Date</Label>
                <Input
                  id="return-date"
                  type="date"
                  value={form.returnDate}
                  onChange={(e) => setForm({ ...form, returnDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Total Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                min={0}
                value={form.budget || ''}
                onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <Button onClick={saveSettings} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
