import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PHOTO_FILTERS, photoFilterCss, type PhotoFilterId } from '@/lib/image'
import { cn } from '@/lib/utils'

interface ImageAnnotateDialogProps {
  file: File | null
  open: boolean
  saving?: boolean
  initialFilter?: PhotoFilterId
  onClose: () => void
  onSave: (caption: string, filter: PhotoFilterId) => void
}

export function ImageAnnotateDialog({
  file,
  open,
  saving,
  initialFilter = 'none',
  onClose,
  onSave,
}: ImageAnnotateDialogProps) {
  const [caption, setCaption] = useState('')
  const [filter, setFilter] = useState<PhotoFilterId>(initialFilter)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    setCaption('')
    setFilter(initialFilter)
  }, [file, initialFilter])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const rtl = /[\u0600-\u06FF]/.test(caption)

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !saving) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit photo</DialogTitle>
          <DialogDescription>Pick a filter, then save. Same as the camera — like a mirror.</DialogDescription>
        </DialogHeader>

        {previewUrl && (
          <div className="relative overflow-hidden rounded-2xl bg-muted">
            <img
              src={previewUrl}
              alt=""
              className="w-full max-h-[42vh] object-contain"
              style={{ filter: photoFilterCss(filter), transform: 'none' }}
            />
            {caption.trim() && (
              <div
                className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-2.5 text-center text-white text-sm font-semibold leading-snug"
                dir={rtl ? 'rtl' : 'ltr'}
              >
                {caption.trim()}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PHOTO_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'shrink-0 overflow-hidden rounded-2xl ring-2 transition-all touch-manipulation',
                filter === item.id ? 'ring-primary' : 'ring-transparent opacity-80'
              )}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt=""
                  className="h-14 w-14 object-cover"
                  style={{ filter: photoFilterCss(item.id), transform: 'none' }}
                />
              ) : (
                <span className="block h-14 w-14 bg-muted" />
              )}
              <span className="block bg-background/90 py-0.5 text-center text-[10px] font-medium">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo-caption">Text on photo</Label>
          <Input
            id="photo-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Who? Where?"
            dir="auto"
            maxLength={80}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onSave('', filter)} disabled={saving}>
            Skip text
          </Button>
          <Button onClick={() => onSave(caption.trim(), filter)} disabled={saving}>
            {saving ? 'Saving…' : 'Save photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
