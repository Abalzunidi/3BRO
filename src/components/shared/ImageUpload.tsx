import { useRef } from 'react'
import { Upload, ImagePlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (files: FileList) => void
  className?: string
  multiple?: boolean
}

export function ImageUpload({ onUpload, className, multiple = true }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length) {
      onUpload(e.dataTransfer.files)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/50 p-10 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <ImagePlus className="h-7 w-7" />
      </div>
      <div className="text-center">
        <p className="font-medium">Upload Images</p>
        <p className="text-sm text-muted-foreground mt-1">
          Drag & drop or click to browse
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-primary font-medium">
        <Upload className="h-3.5 w-3.5" />
        Choose files
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
    </motion.div>
  )
}
