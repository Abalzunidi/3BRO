import { Download, Trash2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { GalleryImage } from '@/types'

interface ImageGalleryGridProps {
  images: GalleryImage[]
  onDelete: (id: string) => void
  onDownload: (image: GalleryImage) => void
}

export function ImageGalleryGrid({ images, onDelete, onDownload }: ImageGalleryGridProps) {
  const [preview, setPreview] = useState<GalleryImage | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, i) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-muted cursor-pointer"
            onClick={() => setPreview(image)}
          >
            <img src={image.url} alt={image.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-between p-3 opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs truncate flex-1 mr-2">{image.name}</span>
              <div className="flex gap-1">
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
        ))}
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
              />
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
                  onClick={() => setPreview(null)}
                  className="bg-white/90 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-white text-center mt-3 text-sm">{preview.name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
