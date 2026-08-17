import { useState } from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { TaskCard } from '@/components/shared/TaskCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { FloatingActionButton } from '@/components/shared/FloatingActionButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import type { Task, TaskStatus } from '@/types'

export function Tasks() {
  const { tasks, addTask, updateTask, deleteTask } = useTrip()
  const { canEdit } = useAuth()
  const { toast } = useToast()
  const editable = canEdit('tasks')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState({ name: '', dueDate: '', status: 'pending' as TaskStatus })

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', dueDate: '', status: 'pending' })
    setOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setForm({ name: task.name, dueDate: task.dueDate, status: task.status })
    setOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast('Task name is required', 'error')
      return
    }
    if (editing) {
      updateTask(editing.id, form)
      toast('Task updated')
    } else {
      addTask(form)
      toast('Task added')
    }
    setOpen(false)
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Tasks"
        description="Keep track of your to-dos"
        action={
          editable ? (
            <Button onClick={openAdd} className="hidden sm:inline-flex self-start">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          ) : undefined
        }
      />

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={editable ? 'Add your first task' : 'No tasks yet'}
          description={editable ? 'Create tasks to stay organized before and during your trip.' : 'Tasks will show up here when someone adds them.'}
          action={editable ? <Button onClick={openAdd}>+ Add Task</Button> : undefined}
        />
      ) : (
        <div className="space-y-3 max-w-2xl">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                readOnly={!editable}
                onEdit={() => openEdit(task)}
                onDelete={() => {
                  deleteTask(task.id)
                  toast('Task deleted')
                }}
                onToggleComplete={() => {
                  updateTask(task.id, {
                    status: task.status === 'completed' ? 'pending' : 'completed',
                  })
                  toast(task.status === 'completed' ? 'Marked as pending' : 'Task completed')
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {editable && <FloatingActionButton onClick={openAdd} label="Add Task" className="sm:hidden" />}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Task' : 'Add Task'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Update task details' : 'Create a new task'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Book hotel"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as TaskStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Save' : 'Add Task'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
