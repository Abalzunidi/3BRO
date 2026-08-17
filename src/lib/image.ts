export const PHOTO_FILTERS = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'vivid', label: 'Vivid', css: 'contrast(1.14) saturate(1.38)' },
  { id: 'warm', label: 'Warm', css: 'sepia(0.28) saturate(1.22) hue-rotate(-12deg)' },
  { id: 'cool', label: 'Cool', css: 'saturate(1.12) hue-rotate(14deg) brightness(1.04)' },
  { id: 'mono', label: 'Mono', css: 'grayscale(1) contrast(1.12)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.42) contrast(0.92) brightness(1.05) saturate(0.82)' },
  { id: 'fade', label: 'Fade', css: 'contrast(0.86) brightness(1.1) saturate(0.72)' },
] as const

export type PhotoFilterId = (typeof PHOTO_FILTERS)[number]['id']

export function photoFilterCss(id: PhotoFilterId | string | undefined) {
  return PHOTO_FILTERS.find((f) => f.id === id)?.css || 'none'
}

function wrapCaptionLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''

  const pushLong = (chunk: string) => {
    let rest = chunk
    while (rest && ctx.measureText(rest).width > maxWidth) {
      let cut = rest.length
      while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut -= 1
      lines.push(rest.slice(0, cut))
      rest = rest.slice(cut)
    }
    if (rest) lines.push(rest)
  }

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth) {
      line = next
    } else {
      if (line) lines.push(line)
      line = ''
      if (ctx.measureText(word).width > maxWidth) pushLong(word)
      else line = word
    }
  }
  if (line) lines.push(line)
  return lines.slice(0, 3)
}

function drawCaption(ctx: CanvasRenderingContext2D, text: string, width: number, height: number) {
  const caption = text.trim()
  if (!caption) return

  const pad = Math.max(12, Math.round(Math.min(width, height) * 0.04))
  const fontSize = Math.max(18, Math.round(Math.min(width, height) * 0.055))
  const rtl = /[\u0600-\u06FF]/.test(caption)
  ctx.font = `700 ${fontSize}px "Segoe UI", Tahoma, "Noto Naskh Arabic", system-ui, sans-serif`
  ctx.direction = rtl ? 'rtl' : 'ltr'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  const lines = wrapCaptionLines(ctx, caption, width - pad * 2)
  if (!lines.length) return

  const lineHeight = Math.round(fontSize * 1.28)
  const blockH = lines.length * lineHeight + pad * 1.4
  const top = height - blockH

  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)'
  ctx.fillRect(0, top, width, blockH)

  ctx.lineWidth = Math.max(2, Math.round(fontSize / 10))
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillStyle = '#fff'

  lines.forEach((line, i) => {
    const y = top + pad + (i + 0.8) * lineHeight
    ctx.strokeText(line, width / 2, y)
    ctx.fillText(line, width / 2, y)
  })
}

function fitSize(width: number, height: number, maxEdge: number) {
  const longest = Math.max(width, height, 1)
  if (longest <= maxEdge) return { width, height }
  const ratio = maxEdge / longest
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

function canvasToJpeg(
  img: CanvasImageSource,
  width: number,
  height: number,
  quality: number,
  caption = '',
  filter: PhotoFilterId | string = 'none'
) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('No canvas')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'medium'
  ctx.filter = photoFilterCss(filter)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  ctx.filter = 'none'
  if (caption.trim()) drawCaption(ctx, caption, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

async function sourceFromFile(file: File): Promise<{
  width: number
  height: number
  source: CanvasImageSource
  close?: () => void
}> {
  const oriented: ImageBitmapOptions = { imageOrientation: 'from-image' }
  try {
    const bmp = await createImageBitmap(file, oriented)
    return { width: bmp.width, height: bmp.height, source: bmp, close: () => bmp.close() }
  } catch {
    try {
      const bmp = await createImageBitmap(file)
      return { width: bmp.width, height: bmp.height, source: bmp, close: () => bmp.close() }
    } catch {
      const objectUrl = URL.createObjectURL(file)
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error('Failed to load image'))
        el.src = objectUrl
      })
      URL.revokeObjectURL(objectUrl)
      return {
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
        source: image,
      }
    }
  }
}

async function downscale(source: CanvasImageSource, width: number, height: number, maxEdge: number) {
  const size = fitSize(width, height, maxEdge)
  if (size.width === width && size.height === height) return { source, ...size, close: undefined as (() => void) | undefined }
  try {
    const bmp = await createImageBitmap(source, {
      resizeWidth: size.width,
      resizeHeight: size.height,
      resizeQuality: 'medium',
    })
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() }
  } catch {
    return { source, ...size, close: undefined }
  }
}

function payloadBytes(url: string) {
  return url.length + 16
}

/** JPEG data URL small enough for one MantleDB entry (64 KB limit). Never mirrors the photo. */
export async function fileToCloudDataUrl(
  file: File,
  maxBytes = 58_000,
  caption = '',
  filter: PhotoFilterId | string = 'none'
): Promise<string> {
  const loaded = await sourceFromFile(file)
  let resized: { source: CanvasImageSource; width: number; height: number; close?: () => void } | null = null
  try {
    let maxEdge = Math.min(960, Math.max(loaded.width, loaded.height) || 960)
    let quality = 0.58
    resized = await downscale(loaded.source, loaded.width, loaded.height, maxEdge)

    const encode = () =>
      canvasToJpeg(resized!.source, resized!.width, resized!.height, quality, caption, filter)

    let url = encode()

    while (payloadBytes(url) > maxBytes && (maxEdge > 280 || quality > 0.3)) {
      if (quality > 0.38) {
        quality = Math.max(0.3, quality - 0.1)
      } else {
        maxEdge = Math.max(280, Math.floor(maxEdge * 0.78))
        resized.close?.()
        resized = await downscale(loaded.source, loaded.width, loaded.height, maxEdge)
      }
      url = encode()
    }

    if (payloadBytes(url) > 63_000) {
      quality = 0.28
      resized.close?.()
      resized = await downscale(loaded.source, loaded.width, loaded.height, 240)
      url = encode()
    }

    return url
  } finally {
    resized?.close?.()
    loaded.close?.()
  }
}

/** Grab the live camera frame as-is (no horizontal flip). */
export async function snapshotVideo(video: HTMLVideoElement): Promise<File> {
  const width = video.videoWidth
  const height = video.videoHeight
  if (!width || !height) throw new Error('Camera is not ready')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) throw new Error('No canvas')
  ctx.drawImage(video, 0, 0, width, height)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error('Could not capture'))), 'image/jpeg', 0.92)
  })
  return new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
}
