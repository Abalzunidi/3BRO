import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface BudgetCardProps {
  title: string
  amount: string
  icon: LucideIcon
  variant?: 'default' | 'spent' | 'remaining'
  className?: string
  delay?: number
}

export function BudgetCard({ title, amount, icon: Icon, variant = 'default', className, delay = 0 }: BudgetCardProps) {
  const iconStyles = {
    default: 'bg-accent text-primary',
    spent: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    remaining: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn(className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="font-display text-2xl font-bold">{amount}</p>
            </div>
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconStyles[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
