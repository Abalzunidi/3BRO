function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

/** Shrink photos so they fit localStorage / remote JSON instead of getting dropped. */
export async function fileToCompressedDataUrl(file: File, maxSize = 1280, quality = 0.72): Promise<string> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Failed to load image'))
      image.src = objectUrl
    })
    const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return readAsDataUrl(file)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } catch {
    return readAsDataUrl(file)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
