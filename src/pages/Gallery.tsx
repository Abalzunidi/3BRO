import { useMemo, useState } from 'react'
import { Images } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { ImageUpload } from '@/components/shared/ImageUpload'
import { ImageGalleryGrid } from '@/components/shared/ImageGalleryGrid'
import { ImageAnnotateDialog } from '@/components/shared/ImageAnnotateDialog'
import { SearchInput } from '@/components/shared/SearchInput'
import { Button } from '@/components/ui/button'
import { useTrip } from '@/context/TripContext'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { fileToCloudDataUrl } from '@/lib/image'
import { motion } from 'framer-motion'

type Filter = 'all' | 'captioned'

export function Gallery() {
  const { gallery, addGalleryImages, deleteGalleryImage, toggleGalleryLike } = useTrip()
  const { member } = useAuth()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  const pending = pendingFiles[0] || null

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return gallery.filter((img) => {
      if (filter === 'captioned' && !img.caption) return false
      if (!q) return true
      return (img.caption || '').toLowerCase().includes(q)
    })
  }, [gallery, query, filter])

  const uploadFiles = async (files: File[], caption = '') => {
    setSaving(true)
    try {
      const images = await Promise.all(
        files.map(async (file, i) => ({
          name: file.name || `photo-${Date.now()}-${i}.jpg`,
          url: await fileToCloudDataUrl(file, 58_000, caption),
          createdAt: new Date().toISOString(),
          ...(caption ? { caption } : {}),
        }))
      )
      addGalleryImages(images)
      toast(`${images.length} image${images.length > 1 ? 's' : ''} uploaded`)
      setPendingFiles([])
    } catch {
      toast('Could not upload image', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = (files: FileList) => {
    const images = Array.from(files).filter((file) => !file.type || file.type.startsWith('image/'))
    if (!images.length) {
      toast('Choose an image file', 'error')
      return
    }
    if (images.length === 1) {
      setPendingFiles(images)
      return
    }
    void uploadFiles(images)
  }

  const savePending = (caption: string) => {
    if (!pendingFiles.length) return
    void uploadFiles(pendingFiles, caption)
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

      {gallery.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Filter photos…"
            className="flex-1"
          />
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'captioned' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('captioned')}
            >
              With text
            </Button>
          </div>
        </div>
      )}

      {gallery.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Upload your travel photos"
          description="Take a photo, write on it, then swipe through the gallery."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No matching photos"
          description="Try another search or show all photos."
        />
      ) : (
        <ImageGalleryGrid
          images={visible}
          memberId={member?.id || ''}
          onLike={(id) => { if (member) toggleGalleryLike(id, member.id) }}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
      )}

      <ImageAnnotateDialog
        file={pending}
        open={Boolean(pending)}
        saving={saving}
        onClose={() => { if (!saving) setPendingFiles([]) }}
        onSave={savePending}
      />
    </div>
  )
}
