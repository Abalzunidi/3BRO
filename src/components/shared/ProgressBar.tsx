import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  label?: string
  showPercent?: boolean
  className?: string
}

export function ProgressBar({ value, label, showPercent = true, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-muted-foreground">{label}</span>}
          {showPercent && <span className="font-display font-semibold text-primary">{Math.round(clamped)}%</span>}
        </div>
      )}
      <Progress value={clamped} />
    </div>
  )
}
