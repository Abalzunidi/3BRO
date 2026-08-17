function canvasToJpeg(img: CanvasImageSource, width: number, height: number, quality: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No canvas')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
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
export async function fileToCloudDataUrl(file: File, maxBytes = 58_000): Promise<string> {
  const loaded = await sourceFromFile(file)
  try {
    let size = Math.min(1280, Math.max(loaded.width, loaded.height) || 1280)
    let quality = 0.72
    let url = canvasToJpeg(
      loaded.source,
      Math.max(1, Math.round(loaded.width * (size / Math.max(loaded.width, loaded.height, 1)))),
      Math.max(1, Math.round(loaded.height * (size / Math.max(loaded.width, loaded.height, 1)))),
      quality
    )

    const scale = () => {
      const ratio = size / Math.max(loaded.width, loaded.height, 1)
      return canvasToJpeg(
        loaded.source,
        Math.max(1, Math.round(loaded.width * ratio)),
        Math.max(1, Math.round(loaded.height * ratio)),
        quality
      )
    }

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
