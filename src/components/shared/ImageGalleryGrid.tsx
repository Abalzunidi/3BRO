import { ChevronLeft, ChevronRight, Download, Heart, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GalleryImage } from '@/types'

interface ImageGalleryGridProps {
  images: GalleryImage[]
  memberId: string
  onLike: (id: string) => void
  onDelete?: (id: string) => void
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
        'inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1.5 text-white text-sm touch-manipulation backdrop-blur-sm',
        className
      )}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart className={cn('h-4 w-4', liked ? 'fill-red-500 text-red-500' : '')} />
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </button>
  )
}

const slide = {
  enter: (dir: number) => ({
    x: dir === 0 ? 0 : `${dir * 72}%`,
    opacity: dir === 0 ? 0 : 0.35,
    scale: dir === 0 ? 0.94 : 1,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    x: dir === 0 ? 0 : `${dir * -72}%`,
    opacity: 0,
    scale: 0.98,
  }),
}

export function ImageGalleryGrid({ images, memberId, onLike, onDelete, onDownload }: ImageGalleryGridProps) {
  const [[previewIndex, direction], setPage] = useState<[number | null, number]>([null, 0])
  const [burst, setBurst] = useState(false)
  const lastTap = useRef(0)
  const dragging = useRef(false)
  const preview = previewIndex != null ? images[previewIndex] : null

  const paginate = (dir: -1 | 1) => {
    setPage(([i]) => {
      if (i == null) return [i, dir]
      const next = i + dir
      if (next < 0 || next >= images.length) return [i, 0]
      return [next, dir]
    })
  }

  const jump = (i: number) => {
    setPage(([cur]) => {
      if (cur == null || cur === i) return [i, 0]
      return [i, i > cur ? 1 : -1]
    })
  }

  const likePreview = () => {
    if (!preview) return
    if (!likedByMe(preview, memberId)) setBurst(true)
    onLike(preview.id)
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const goNext = info.offset.x < -72 || info.velocity.x < -650
    const goPrev = info.offset.x > 72 || info.velocity.x > 650
    if (goNext) paginate(1)
    else if (goPrev) paginate(-1)
    window.setTimeout(() => {
      dragging.current = false
    }, 40)
  }

  useEffect(() => {
    if (previewIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPage([null, 0])
      if (e.key === 'ArrowLeft') paginate(-1)
      if (e.key === 'ArrowRight') paginate(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewIndex, images.length])

  useEffect(() => {
    if (previewIndex != null && previewIndex >= images.length) {
      setPage([images.length ? images.length - 1 : null, 0])
    }
  }, [images.length, previewIndex])

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {images.map((image, i) => {
          const liked = likedByMe(image, memberId)
          const count = image.likedBy?.length || 0
          return (
            <motion.button
              type="button"
              key={image.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03 }}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer text-left shadow-sm ring-1 ring-black/5"
              onClick={() => setPage([i, 0])}
            >
              <img src={image.url} alt={image.caption || 'Photo'} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
              <div className="absolute top-2 left-2">
                <LikeButton liked={liked} count={count} onClick={() => onLike(image.id)} />
              </div>
              {image.caption && (
                <span className="absolute inset-x-0 bottom-0 px-2.5 pb-2 text-white text-[11px] font-medium truncate">
                  {image.caption}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {preview && previewIndex != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/88 backdrop-blur-md flex flex-col"
            onClick={() => setPage([null, 0])}
          >
            <div
              className="relative flex min-h-0 flex-1 flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <LikeButton
                  liked={likedByMe(preview, memberId)}
                  count={preview.likedBy?.length || 0}
                  onClick={likePreview}
                  className="bg-white/15"
                />
                <div className="flex gap-1.5">
                  <Button size="icon" variant="secondary" onClick={() => onDownload(preview)} className="h-11 w-11 bg-white/90 hover:bg-white">
                    <Download className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => onDelete(preview.id)}
                      className="h-11 w-11 bg-white/90 hover:bg-white text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="secondary" onClick={() => setPage([null, 0])} className="h-11 w-11 bg-white/90 hover:bg-white">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={preview.id}
                    custom={direction}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.7 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.18}
                    onDragStart={() => {
                      dragging.current = true
                    }}
                    onDragEnd={onDragEnd}
                    onClick={() => {
                      if (dragging.current) return
                      const now = Date.now()
                      if (now - lastTap.current < 280 && !likedByMe(preview, memberId)) {
                        setBurst(true)
                        onLike(preview.id)
                      }
                      lastTap.current = now
                    }}
                    className="absolute inset-0 flex items-center justify-center px-2 cursor-grab active:cursor-grabbing"
                  >
                    <img
                      src={preview.url}
                      alt={preview.caption || 'Photo'}
                      className="max-h-full max-w-full object-contain rounded-2xl select-none shadow-2xl"
                      draggable={false}
                    />
                    <AnimatePresence>
                      {burst && (
                        <motion.div
                          initial={{ scale: 0.35, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ opacity: 0, scale: 1.35 }}
                          onAnimationComplete={() => setBurst(false)}
                          className="pointer-events-none absolute inset-0 flex items-center justify-center"
                        >
                          <Heart className="h-24 w-24 fill-red-500 text-red-500 drop-shadow-lg" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute left-2 top-1/2 z-10 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white disabled:opacity-25"
                      onClick={() => paginate(-1)}
                      disabled={previewIndex <= 0}
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 h-12 w-12 rounded-full bg-white/90 hover:bg-white disabled:opacity-25"
                      onClick={() => paginate(1)}
                      disabled={previewIndex >= images.length - 1}
                      aria-label="Next photo"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>

              <div className="px-4 pt-3 pb-2 text-center">
                {preview.caption && <p className="text-white text-sm font-medium">{preview.caption}</p>}
                {images.length > 1 && (
                  <p className="text-white/60 text-xs mt-1 tabular-nums">{previewIndex + 1} / {images.length}</p>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 justify-start sm:justify-center scrollbar-none">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => jump(i)}
                      className={cn(
                        'h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-2 transition-all touch-manipulation',
                        i === previewIndex ? 'ring-white scale-105' : 'ring-transparent opacity-55'
                      )}
                      aria-label={`Photo ${i + 1}`}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
