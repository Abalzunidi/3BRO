import { cn } from '@/lib/utils'
import type { ActivityStatus, TaskStatus } from '@/types'

const activityStyles: Record<ActivityStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
}

const activityLabels: Record<ActivityStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const taskStyles: Record<TaskStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

interface StatusBadgeProps {
  status: ActivityStatus | TaskStatus
  type?: 'activity' | 'task'
  className?: string
}

export function StatusBadge({ status, type = 'activity', className }: StatusBadgeProps) {
  if (type === 'task') {
    const s = status as TaskStatus
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', taskStyles[s], className)}>
        {s === 'completed' ? 'Completed' : 'Pending'}
      </span>
    )
  }
  const s = status as ActivityStatus
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', activityStyles[s], className)}>
      {activityLabels[s]}
    </span>
  )
}
