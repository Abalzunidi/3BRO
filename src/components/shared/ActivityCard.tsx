import { MapPin, Clock, DollarSign, ExternalLink, ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { formatCurrency } from '@/lib/utils'
import type { Activity } from '@/types'

interface ActivityCardProps {
  activity: Activity
  onClick?: () => void
  index?: number
}

export function ActivityCard({ activity, onClick, index = 0 }: ActivityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      layout
    >
      <Card
        className="overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <div className="aspect-[16/10] bg-muted relative overflow-hidden">
          {activity.image ? (
            <img
              src={activity.image}
              alt={activity.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-40" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <StatusBadge status={activity.status} />
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-base truncate">{activity.name}</h3>
            {activity.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{activity.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {activity.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {activity.time}
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
            {activity.mapsLink && (
              <span className="flex items-center gap-1 text-primary">
                <ExternalLink className="h-3.5 w-3.5" />
                Maps
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
