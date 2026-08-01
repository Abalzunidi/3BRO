import { Images } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { ImageGalleryGrid } from '@/components/shared/ImageGalleryGrid'
import { useTrip } from '@/context/TripContext'
import { useToast } from '@/context/ToastContext'
import { motion } from 'framer-motion'

export function Gallery() {
  const { gallery, addGalleryImages, deleteGalleryImage } = useTrip()
  const { toast } = useToast()

  const handleUpload = (files: FileList) => {
    const readers = Array.from(files).map(
      (file) =>
        new Promise<{ name: string; url: string; createdAt: string }>((resolve) => {
          const reader = new FileReader()
          reader.onload = () =>
            resolve({
              name: file.name,
              url: reader.result as string,
              createdAt: new Date().toISOString(),
            })
          reader.readAsDataURL(file)
        })
    )

    Promise.all(readers).then((images) => {
      addGalleryImages(images)
      toast(`${images.length} image${images.length > 1 ? 's' : ''} uploaded`)
    })
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
