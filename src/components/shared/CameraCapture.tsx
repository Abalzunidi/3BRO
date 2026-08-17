import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, RefreshCw, X, Zap, ZapOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PHOTO_FILTERS, photoFilterCss, snapshotVideo, type PhotoFilterId } from '@/lib/image'
import { cn } from '@/lib/utils'

interface CameraCaptureProps {
  open: boolean
  onClose: () => void
  onCapture: (file: File, filter: PhotoFilterId) => void
  onFallback: () => void
}

type TrackCaps = MediaTrackCapabilities & { torch?: boolean }

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function applyTorch(stream: MediaStream | null, on: boolean) {
  const track = stream?.getVideoTracks()[0]
  if (!track?.getCapabilities) return false
  const caps = track.getCapabilities() as TrackCaps
  if (!caps.torch) return false
  try {
    await track.applyConstraints({ advanced: [{ torch: on }] as unknown as MediaTrackConstraintSet[] })
    return true
  } catch {
    return false
  }
}

export function CameraCapture({ open, onClose, onCapture, onFallback }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const onCloseRef = useRef(onClose)
  const onFallbackRef = useRef(onFallback)
  onCloseRef.current = onClose
  onFallbackRef.current = onFallback
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  const [filter, setFilter] = useState<PhotoFilterId>('none')
  const [flash, setFlash] = useState(false)
  const [hasTorch, setHasTorch] = useState(false)
  const [screenFlash, setScreenFlash] = useState(false)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    setReady(false)
    setHasTorch(false)

    const start = async () => {
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play()
        const track = stream.getVideoTracks()[0]
        const torch = Boolean((track?.getCapabilities?.() as TrackCaps | undefined)?.torch)
        setHasTorch(torch)
        if (torch && flash) await applyTorch(stream, true)
        setReady(true)
      } catch {
        if (!cancelled) {
          onCloseRef.current()
          onFallbackRef.current()
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      void applyTorch(streamRef.current, false)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoRef.current) videoRef.current.srcObject = null
    }
  }, [open, facing])

  useEffect(() => {
    if (!open || !ready || !hasTorch) return
    void applyTorch(streamRef.current, flash)
  }, [flash, hasTorch, open, ready])

  if (!open) return null

  const snap = async () => {
    const video = videoRef.current
    if (!video || busy) return
    setBusy(true)
    try {
      if (flash) {
        if (hasTorch) {
          await applyTorch(streamRef.current, true)
          await sleep(120)
        } else {
          setScreenFlash(true)
          await sleep(180)
        }
      }
      const file = await snapshotVideo(video)
      setScreenFlash(false)
      void applyTorch(streamRef.current, false)
      streamRef.current?.getTracks().forEach((track) => track.stop())
      onCapture(file, filter)
      onClose()
    } catch {
      setScreenFlash(false)
      onFallback()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col bg-black text-white">
      {screenFlash && (
        <div className="pointer-events-none fixed inset-0 z-[90] bg-white" aria-hidden />
      )}
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <Button
          size="icon"
          variant="secondary"
          className="h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25"
          onClick={onClose}
          aria-label="Close camera"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              'h-11 w-11 rounded-full hover:bg-white/25',
              flash ? 'bg-amber-400 text-black hover:bg-amber-300' : 'bg-white/15 text-white'
            )}
            onClick={() => setFlash((on) => !on)}
            aria-label={flash ? 'Flash on' : 'Flash off'}
          >
            {flash ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-11 w-11 rounded-full bg-white/15 text-white hover:bg-white/25"
            onClick={() => setFacing((side) => (side === 'user' ? 'environment' : 'user'))}
            aria-label="Switch camera"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{
            filter: photoFilterCss(filter),
            transform: 'scaleX(-1)',
          }}
          playsInline
          muted
          autoPlay
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            Opening camera…
          </div>
        )}
      </div>

      <div className="px-3 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PHOTO_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium touch-manipulation',
                filter === item.id ? 'bg-white text-black' : 'bg-white/15 text-white'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => void snap()}
            className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[3px] border-white bg-white/15 touch-manipulation disabled:opacity-40"
            aria-label="Take photo"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
              <Camera className="h-6 w-6" />
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
