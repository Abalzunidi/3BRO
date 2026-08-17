import { useRef } from 'react'
import { Camera, Images } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (files: FileList) => void
  className?: string
  multiple?: boolean
}

export function ImageUpload({ onUpload, className, multiple = true }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const pick = (list: FileList | null) => {
    if (list?.length) onUpload(list)
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors touch-manipulation"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
          <Camera className="h-7 w-7" />
        </div>
        <p className="font-medium">Take photo</p>
        <p className="text-sm text-muted-foreground text-center">Write on it after you shoot</p>
      </button>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files)
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors touch-manipulation"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
          <Images className="h-7 w-7" />
        </div>
        <p className="font-medium">Choose photos</p>
        <p className="text-sm text-muted-foreground text-center">Gallery or drag & drop</p>
      </button>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          pick(e.target.files)
          e.target.value = ''
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          pick(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
