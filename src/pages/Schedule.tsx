import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CalendarDays } from 'lucide-react'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { TimelineItem } from '@/components/shared/Timeline'
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
import type { ActivityStatus, ScheduleActivity } from '@/types'
import { motion } from 'framer-motion'

const emptyForm = {
  name: '',
  time: '',
  location: '',
  duration: '',
  cost: 0,
  notes: '',
  status: 'pending' as ActivityStatus,
}

export function Schedule() {
  const { schedule, addScheduleActivity, updateScheduleActivity, deleteScheduleActivity, reorderSchedule } = useTrip()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ScheduleActivity | null>(null)
  const [form, setForm] = useState(emptyForm)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const sorted = [...schedule].sort((a, b) => a.order - b.order)

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (activity: ScheduleActivity) => {
    setEditing(activity)
    setForm({
      name: activity.name,
      time: activity.time,
      location: activity.location,
      duration: activity.duration,
      cost: activity.cost,
      notes: activity.notes,
      status: activity.status,
    })
    setOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast('Activity name is required', 'error')
      return
    }
    if (editing) {
      updateScheduleActivity(editing.id, form)
      toast('Activity updated')
    } else {
      addScheduleActivity(form)
      toast('Activity added')
    }
    setOpen(false)
  }

  const handleDelete = () => {
    if (editing) {
      deleteScheduleActivity(editing.id)
      toast('Activity deleted')
      setOpen(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = sorted.map((a) => a.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const next = [...ids]
    next.splice(oldIndex, 1)
    next.splice(newIndex, 0, active.id as string)
    reorderSchedule(next)
  }

  return (
    <div className="space-y-6 pb-20">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">Plan your day-by-day itinerary</p>
      </motion.div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No activities yet"
          description="Add your first schedule activity and drag to reorder."
          action={
            <Button onClick={openAdd}>+ Add Activity</Button>
          }
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((a) => a.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sorted.map((activity) => (
                <TimelineItem
                  key={activity.id}
                  activity={activity}
                  onClick={() => openEdit(activity)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <FloatingActionButton onClick={openAdd} label="Add Activity" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update schedule details' : 'Add a new item to your schedule'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Activity Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Visit Blue Mosque"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 2 hours"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Sultanahmet"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cost ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.cost || ''}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as ActivityStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            {editing && (
              <Button variant="destructive" onClick={handleDelete} className="sm:mr-auto">
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
