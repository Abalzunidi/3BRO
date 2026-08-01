import { GripVertical, MapPin, Clock, DollarSign, Timer } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { formatCurrency } from '@/lib/utils'
import type { ScheduleActivity } from '@/types'
import { cn } from '@/lib/utils'

interface TimelineItemProps {
  activity: ScheduleActivity
  onClick?: () => void
}

export function TimelineItem({ activity, onClick }: TimelineItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && 'z-50 opacity-90')}>
      <Card
        className={cn(
          'cursor-pointer hover:border-primary/40',
          isDragging && 'shadow-xl ring-2 ring-primary/30'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 flex gap-3">
          <button
            className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 mt-1"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-semibold truncate">{activity.name}</h3>
              <StatusBadge status={activity.status} />
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {activity.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {activity.time}
                </span>
              )}
              {activity.duration && (
                <span className="flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {activity.duration}
                </span>
              )}
              {activity.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {activity.location}
                </span>
              )}
              {activity.cost > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  {formatCurrency(activity.cost)}
                </span>
              )}
            </div>
            {activity.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">{activity.notes}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
