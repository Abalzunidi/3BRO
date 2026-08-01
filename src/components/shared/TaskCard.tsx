import { Calendar, Check, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '@/lib/utils'
import type { Task } from '@/types'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onToggleComplete: () => void
  index?: number
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete, index = 0 }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      layout
    >
      <Card className={cn(task.status === 'completed' && 'opacity-70')}>
        <CardContent className="p-4 flex items-center gap-4">
          <button
            onClick={onToggleComplete}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 transition-all cursor-pointer',
              task.status === 'completed'
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border hover:border-primary hover:bg-accent'
            )}
            aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as complete'}
          >
            {task.status === 'completed' && <Check className="h-4 w-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-medium truncate',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}>
              {task.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              {task.dueDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
              <StatusBadge status={task.status} type="task" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Edit task">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Delete task">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
