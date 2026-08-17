import sharp from 'sharp'
import path from 'path'

const src = process.argv[2]
const pub = path.resolve('public')

const image = sharp(src)
const { width, height } = await image.metadata()
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const w = info.width
const h = info.height

const rowHits = Array.from({ length: h }, (_, y) => {
  let hit = 0
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3
    if (data[i] + data[i + 1] + data[i + 2] > 90) hit++
  }
  return hit
})

const contentRows = rowHits.map((n, y) => (n > w * 0.015 ? y : -1)).filter((y) => y >= 0)
const minY = contentRows[0]
const maxY = contentRows.at(-1)

let gapStart = -1
let gapEnd = -1
for (let y = minY; y <= maxY; y++) {
  if (rowHits[y] < w * 0.008) {
    if (gapStart < 0) gapStart = y
    gapEnd = y
  } else if (gapStart >= 0 && gapEnd - gapStart > 6) {
    break
  } else {
    gapStart = -1
    gapEnd = -1
  }
}

const iconBottom = gapStart > minY ? gapStart : Math.round(minY + (maxY - minY) * 0.62)
let colMin = w
let colMax = 0
for (let y = minY; y < iconBottom; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3
    if (data[i] + data[i + 1] + data[i + 2] > 90) {
      if (x < colMin) colMin = x
      if (x > colMax) colMax = x
    }
  }
}

const side = Math.max(iconBottom - minY, colMax - colMin + 1)
const pad = Math.round(side * 0.1)
const size = Math.min(w, iconBottom - minY + pad)
const left = Math.max(0, Math.min(w - size, Math.round((colMin + colMax) / 2 - size / 2)))
const top = Math.max(0, minY - pad)
const emblem = { left, top, width: size, height: Math.min(size, iconBottom - top) }
emblem.width = emblem.height

console.log({ width, height, minY, maxY, gapStart, gapEnd, emblem })

await sharp(src).png({ compressionLevel: 9 }).toFile(path.join(pub, 'logo.png'))
await sharp(src).extract(emblem).png({ compressionLevel: 9 }).toFile(path.join(pub, 'logo-mark.png'))

async function writeSquare(out, px, crop) {
  await sharp(src)
    .extract(crop)
    .resize(px, px, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(out)
}

await writeSquare(path.join(pub, 'favicon-16x16.png'), 16, emblem)
await writeSquare(path.join(pub, 'favicon-32x32.png'), 32, emblem)
await writeSquare(path.join(pub, 'apple-touch-icon.png'), 180, { left: 0, top: 0, width: w, height: h })
await writeSquare(path.join(pub, 'icons', 'icon-192.png'), 192, { left: 0, top: 0, width: w, height: h })
await writeSquare(path.join(pub, 'icons', 'icon-512.png'), 512, { left: 0, top: 0, width: w, height: h })

console.log('wrote logos')
