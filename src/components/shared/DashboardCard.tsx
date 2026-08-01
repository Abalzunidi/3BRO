import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  value: string
  icon: LucideIcon
  placeholder?: boolean
  className?: string
  delay?: number
}

export function DashboardCard({ title, value, icon: Icon, placeholder, className, delay = 0 }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 min-w-0 flex-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className={cn(
                'font-display text-xl font-semibold truncate',
                placeholder && 'text-muted-foreground/50'
              )}>
                {value}
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
