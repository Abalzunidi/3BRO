import { Images } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { ImageGalleryGrid } from '@/components/shared/ImageGalleryGrid'
import { useTrip } from '@/context/TripContext'
import { useToast } from '@/context/ToastContext'
import { fileToCompressedDataUrl } from '@/lib/image'
import { motion } from 'framer-motion'

export function Gallery() {
  const { gallery, addGalleryImages, deleteGalleryImage } = useTrip()
  const { toast } = useToast()

  const handleUpload = (files: FileList) => {
    const jobs = Array.from(files)
      .filter((file) => !file.type || file.type.startsWith('image/'))
      .map(async (file) => ({
        name: file.name,
        url: await fileToCompressedDataUrl(file),
        createdAt: new Date().toISOString(),
      }))

    Promise.all(jobs)
      .then((images) => {
        if (!images.length) {
          toast('Choose an image file', 'error')
          return
        }
        addGalleryImages(images)
        toast(`${images.length} image${images.length > 1 ? 's' : ''} uploaded`)
      })
      .catch(() => toast('Could not upload image', 'error'))
  }

  const handleDownload = (image: { name: string; url: string }) => {
    const a = document.createElement('a')
    a.href = image.url
    a.download = image.name
    a.click()
    toast('Download started')
  }

  const handleDelete = (id: string) => {
    deleteGalleryImage(id)
    toast('Image deleted')
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Gallery</h1>
        <p className="text-muted-foreground mt-1">Your trip memories</p>
      </motion.div>

      <ImageUpload onUpload={handleUpload} />

      {gallery.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Upload your travel photos"
          description="Capture and keep your trip memories in one place."
        />
      ) : (
        <ImageGalleryGrid
          images={gallery}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}
    </div>
  )
}
