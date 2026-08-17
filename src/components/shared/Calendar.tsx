import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  markedDates?: Date[]
  className?: string
}

export function Calendar({ selected, onSelect, markedDates = [], className }: CalendarProps) {
  const [current, setCurrent] = useState(selected || new Date())

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const isMarked = (day: Date) => markedDates.some((d) => isSameDay(d, day))

  return (
    <div className={cn('rounded-3xl border border-border bg-card p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrent(subMonths(current, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-display font-semibold">{format(current, 'MMMM yyyy')}</h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrent(addMonths(current, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, current)
          const selectedDay = selected && isSameDay(day, selected)
          const today = isToday(day)
          const marked = isMarked(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelect?.(day)}
              className={cn(
                'relative h-9 w-full rounded-xl text-sm transition-colors cursor-pointer',
                !inMonth && 'text-muted-foreground/40',
                inMonth && 'hover:bg-accent',
                selectedDay && 'bg-primary text-primary-foreground hover:bg-primary',
                today && !selectedDay && 'ring-1 ring-primary text-primary font-semibold',
              )}
            >
              {format(day, 'd')}
              {marked && !selectedDay && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
