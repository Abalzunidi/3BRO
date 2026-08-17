import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3', className)}
    >
      <div className="min-w-0">
        <h1 className="font-display text-[1.65rem] sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-1 text-[15px] leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action}
    </motion.div>
  )
}
