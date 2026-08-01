import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function FloatingActionButton({ onClick, label = 'Add', className }: FloatingActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-secondary transition-colors cursor-pointer font-medium',
        className
      )}
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  )
}
