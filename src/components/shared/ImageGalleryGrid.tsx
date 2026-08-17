import { ChevronLeft, ChevronRight, Download, Heart, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GalleryImage } from '@/types'

interface ImageGalleryGridProps {
  images: GalleryImage[]
  memberId: string
  onLike: (id: string) => void
  onDelete: (id: string) => void
  onDownload: (image: GalleryImage) => void
}

function likedByMe(image: GalleryImage, memberId: string) {
  return Boolean(memberId && image.likedBy?.includes(memberId))
}

function LikeButton({
  liked,
  count,
  onClick,
  className,
}: {
  liked: boolean
  count: number
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 text-white text-sm touch-manipulation',
        className
      )}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart className={cn('h-4 w-4', liked ? 'fill-red-500 text-red-500' : '')} />
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  )
}

export function ImageGalleryGrid({ images, memberId, onLike, onDelete, onDownload }: ImageGalleryGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [burst, setBurst] = useState(false)
  const lastTap = useRef(0)
  const preview = previewIndex != null ? images[previewIndex] : null

  const go = (dir: -1 | 1) => {
    setPreviewIndex((i) => {
      if (i == null) return i
      const next = i + dir
      if (next < 0 || next >= images.length) return i
      return next
    })
  }

  const likePreview = () => {
    if (!preview) return
    if (!likedByMe(preview, memberId)) setBurst(true)
    onLike(preview.id)
  }

  useEffect(() => {
    if (previewIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewIndex, images.length])

  useEffect(() => {
    if (previewIndex != null && previewIndex >= images.length) {
      setPreviewIndex(images.length ? images.length - 1 : null)
    }
  }, [images.length, previewIndex])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, i) => {
          const liked = likedByMe(image, memberId)
          const count = image.likedBy?.length || 0
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer"
              onClick={() => setPreviewIndex(i)}
            >
              <img src={image.url} alt={image.caption || 'Photo'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute top-2 left-2">
                <LikeButton liked={liked} count={count} onClick={() => onLike(image.id)} />
              </div>
              {image.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[11px] px-2 py-1.5 truncate">
                  {image.caption}
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-end p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                <div className="flex gap-1 pointer-events-auto">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDownload(image) }}
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                    aria-label="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(image.id) }}
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-500 cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {preview && previewIndex != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewIndex(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                const x = e.touches[0].clientX
                ;(e.currentTarget as HTMLElement).dataset.sx = String(x)
              }}
              onTouchEnd={(e) => {
                const start = Number((e.currentTarget as HTMLElement).dataset.sx || 0)
                const dx = e.changedTouches[0].clientX - start
                if (dx > 50) go(-1)
                if (dx < -50) go(1)
              }}
            >
              <div
                className="relative"
                onClick={() => {
                  const now = Date.now()
                  if (now - lastTap.current < 300) {
                    if (!likedByMe(preview, memberId)) {
                      setBurst(true)
                      onLike(preview.id)
                    }
                  }
                  lastTap.current = now
                }}
              >
                <img
                  src={preview.url}
                  alt={preview.caption || 'Photo'}
                  className="w-full h-auto max-h-[85vh] object-contain rounded-2xl select-none"
                  draggable={false}
                />
                <AnimatePresence>
                  {burst && (
                    <motion.div
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ opacity: 0, scale: 1.3 }}
                      onAnimationComplete={() => setBurst(false)}
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                      <Heart className="h-24 w-24 fill-red-500 text-red-500 drop-shadow-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {images.length > 1 && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white disabled:opacity-30"
                    onClick={() => go(-1)}
                    disabled={previewIndex <= 0}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white disabled:opacity-30"
                    onClick={() => go(1)}
                    disabled={previewIndex >= images.length - 1}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onDownload(preview)}
                  className="bg-white/90 hover:bg-white"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setPreviewIndex(null)}
                  className="bg-white/90 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-3">
                <LikeButton
                  liked={likedByMe(preview, memberId)}
                  count={preview.likedBy?.length || 0}
                  onClick={likePreview}
                  className="bg-white/15"
                />
                {(preview.caption || images.length > 1) && (
                  <p className="text-white text-sm">
                    {preview.caption}
                    {images.length > 1 && (
                      <span className="text-white/70">{preview.caption ? ' · ' : ''}{previewIndex + 1} / {images.length}</span>
                    )}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
