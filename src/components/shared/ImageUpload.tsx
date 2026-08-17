import { useRef } from 'react'
import { Camera, Images } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (files: FileList) => void
  className?: string
  multiple?: boolean
  compact?: boolean
}

export function ImageUpload({ onUpload, className, multiple = true, compact = false }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const pick = (list: FileList | null) => {
    if (list?.length) onUpload(list)
  }

  const card = compact
    ? 'flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors touch-manipulation text-left'
    : 'flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card/50 p-8 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors touch-manipulation'

  const iconBox = compact
    ? 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary'
    : 'flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary'

  return (
    <div className={cn(compact ? 'grid gap-2 sm:grid-cols-2' : 'grid gap-3 sm:grid-cols-2', className)}>
      <button type="button" onClick={() => cameraRef.current?.click()} className={card}>
        <div className={iconBox}>
          <Camera className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
        </div>
        <div>
          <p className="font-medium">Take photo</p>
          {!compact && <p className="text-sm text-muted-foreground text-center mt-1">Write on it after you shoot</p>}
          {compact && <p className="text-xs text-muted-foreground">Write on it after you shoot</p>}
        </div>
      </button>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault()
          pick(e.dataTransfer.files)
        }}
        onDragOver={(e) => e.preventDefault()}
        className={card}
      >
        <div className={iconBox}>
          <Images className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
        </div>
        <div>
          <p className="font-medium">Choose photos</p>
          {!compact && <p className="text-sm text-muted-foreground text-center mt-1">Gallery or drag & drop</p>}
          {compact && <p className="text-xs text-muted-foreground">From your library</p>}
        </div>
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
