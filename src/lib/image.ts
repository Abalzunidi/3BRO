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

function canvasToJpeg(
  img: CanvasImageSource,
  width: number,
  height: number,
  quality: number,
  caption = ''
) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No canvas')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  if (caption.trim()) drawCaption(ctx, caption, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

async function sourceFromFile(file: File): Promise<{ width: number; height: number; source: CanvasImageSource; close?: () => void }> {
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
    return { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height, source: image }
  }
}

/** JPEG data URL small enough for one MantleDB entry (64 KB limit). */
export async function fileToCloudDataUrl(file: File, maxBytes = 58_000, caption = ''): Promise<string> {
  const loaded = await sourceFromFile(file)
  try {
    let size = Math.min(1280, Math.max(loaded.width, loaded.height) || 1280)
    let quality = 0.72
    const scale = () => {
      const ratio = size / Math.max(loaded.width, loaded.height, 1)
      return canvasToJpeg(
        loaded.source,
        Math.max(1, Math.round(loaded.width * ratio)),
        Math.max(1, Math.round(loaded.height * ratio)),
        quality,
        caption
      )
    }

    let url = scale()

    while (new Blob([url]).size > maxBytes && (size > 280 || quality > 0.32)) {
      if (quality > 0.4) quality = Math.max(0.32, quality - 0.12)
      else size = Math.max(280, Math.floor(size * 0.75))
      url = scale()
    }

    if (new Blob([JSON.stringify({ url })]).size > 64_000) {
      quality = 0.28
      size = 240
      url = scale()
    }

    return url
  } finally {
    loaded.close?.()
  }
}
