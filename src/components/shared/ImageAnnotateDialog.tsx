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

interface ImageAnnotateDialogProps {
  file: File | null
  open: boolean
  saving?: boolean
  onClose: () => void
  onSave: (caption: string) => void
}

export function ImageAnnotateDialog({
  file,
  open,
  saving,
  onClose,
  onSave,
}: ImageAnnotateDialogProps) {
  const [caption, setCaption] = useState('')
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    setCaption('')
  }, [file])

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
          <DialogTitle>Write on photo</DialogTitle>
          <DialogDescription>The text is saved on the picture itself.</DialogDescription>
        </DialogHeader>

        {previewUrl && (
          <div className="relative overflow-hidden rounded-2xl bg-muted">
            <img src={previewUrl} alt="" className="w-full max-h-[50vh] object-contain" />
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
          <Button variant="outline" onClick={() => onSave('')} disabled={saving}>
            Skip
          </Button>
          <Button onClick={() => onSave(caption.trim())} disabled={saving}>
            {saving ? 'Saving…' : 'Save photo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
