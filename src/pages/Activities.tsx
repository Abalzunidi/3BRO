import { useRef, useState } from 'react'
import { MapPinned, ExternalLink, Trash2, ImageIcon } from 'lucide-react'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ActivityCard } from '@/components/shared/ActivityCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTrip } from '@/context/TripContext'
import { useToast } from '@/context/ToastContext'
import { fileToCloudDataUrl } from '@/lib/image'
import { formatCurrency } from '@/lib/utils'
import type { Activity, ActivityStatus } from '@/types'
import { motion } from 'framer-motion'

const emptyForm = {
  name: '',
  description: '',
  time: '',
  cost: 0,
  location: '',
  mapsLink: '',
  image: '',
  status: 'pending' as ActivityStatus,
}

export function Activities() {
  const { activities, addActivity, updateActivity, deleteActivity } = useTrip()
  const { toast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editing, setEditing] = useState<Activity | null>(null)
  const [selected, setSelected] = useState<Activity | null>(null)
  const [form, setForm] = useState(emptyForm)
  const fileRef = useRef<HTMLInputElement>(null)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (activity: Activity) => {
    setEditing(activity)
    setForm({
      name: activity.name,
      description: activity.description,
      time: activity.time,
      cost: activity.cost,
      location: activity.location,
      mapsLink: activity.mapsLink,
      image: activity.image,
      status: activity.status,
    })
    setDetailOpen(false)
    setFormOpen(true)
  }

  const openDetail = (activity: Activity) => {
    setSelected(activity)
    setDetailOpen(true)
  }

  const handleImage = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    fileToCloudDataUrl(file)
      .then((url) => setForm((f) => ({ ...f, image: url })))
      .catch(() => toast('Could not upload image', 'error'))
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast('Activity name is required', 'error')
      return
    }
    if (editing) {
      updateActivity(editing.id, form)
      toast('Activity updated')
    } else {
      addActivity(form)
      toast('Activity added')
    }
    setFormOpen(false)
  }

  const handleDelete = (id: string) => {
    deleteActivity(id)
    setDetailOpen(false)
    setFormOpen(false)
    toast('Activity deleted')
  }

  return (
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Activities</h1>
        <p className="text-muted-foreground mt-1">Explore and manage your trip activities</p>
      </motion.div>

      {activities.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title="No activities yet"
          description="Add activities with photos, locations, and maps links."
          action={<Button onClick={openAdd}>+ Add Activity</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {activities.map((activity, i) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              index={i}
              onClick={() => openDetail(activity)}
            />
          ))}
        </div>
      )}

      <FloatingActionButton onClick={openAdd} label="Add Activity" />

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{selected.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 pt-1">
                  <StatusBadge status={selected.status} />
                </DialogDescription>
              </DialogHeader>
              {selected.image ? (
                <img src={selected.image} alt={selected.name} className="w-full h-48 object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-32 rounded-2xl bg-muted flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground opacity-40" />
                </div>
              )}
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selected.time && (
                  <div>
                    <p className="text-muted-foreground text-xs">Time</p>
                    <p className="font-medium">{selected.time}</p>
                  </div>
                )}
                {selected.cost > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs">Cost</p>
                    <p className="font-medium">{formatCurrency(selected.cost)}</p>
                  </div>
                )}
                {selected.location && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Location</p>
                    <p className="font-medium">{selected.location}</p>
                  </div>
                )}
              </div>
              {selected.mapsLink && (
                <a
                  href={selected.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </a>
              )}
              <DialogFooter>
                <Button variant="destructive" onClick={() => handleDelete(selected.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={() => openEdit(selected)}>Edit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="max-w-md"
          onFocusOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            const target = e.target as HTMLElement | null
            if (target?.closest?.('input[type="file"]')) e.preventDefault()
          }}
        >
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update activity details' : 'Create a new activity card'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Activity Image</Label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative h-28 rounded-2xl border border-dashed border-border bg-muted/50 flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden"
              >
                {form.image ? (
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm text-muted-foreground">Click to upload image</span>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleImage(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Activity Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Activity name" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the activity..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cost ($)</Label>
                <Input type="number" min={0} value={form.cost || ''} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" />
            </div>
            <div className="space-y-2">
              <Label>Google Maps Link</Label>
              <Input value={form.mapsLink} onChange={(e) => setForm({ ...form, mapsLink: e.target.value })} placeholder="https://maps.google.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ActivityStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
