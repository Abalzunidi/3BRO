import sharp from 'sharp'
import path from 'path'

const src = process.argv[2] || path.resolve('public/logo.png')
const pub = path.resolve('public')

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

const emblemW = colMax - colMin + 1
const emblemH = iconBottom - minY
const side = Math.max(emblemW, emblemH)
const pad = Math.round(side * 0.22)
const outSize = side + pad * 2
const extract = {
  left: colMin,
  top: minY,
  width: emblemW,
  height: emblemH,
}

console.log({ w, h, minY, maxY, gapStart, gapEnd, extract, outSize, pad })

const logoOut = path.join(pub, 'logo.png')
if (path.resolve(src) !== path.resolve(logoOut)) {
  await sharp(src).png({ compressionLevel: 9 }).toFile(logoOut)
}

const emblemBuf = await sharp(src).extract(extract).png().toBuffer()
const mark = await sharp({
  create: { width: outSize, height: outSize, channels: 3, background: '#000000' },
})
  .composite([
    {
      input: emblemBuf,
      left: Math.round((outSize - emblemW) / 2),
      top: Math.round((outSize - emblemH) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer()

await sharp(mark).toFile(path.join(pub, 'logo-mark.png'))

async function writeSquare(out, px, fromFull) {
  const input = fromFull ? src : mark
  await sharp(input)
    .resize(px, px, { fit: 'contain', background: '#000000' })
    .png({ compressionLevel: 9 })
    .toFile(out)
}

await writeSquare(path.join(pub, 'favicon-16x16.png'), 16, false)
await writeSquare(path.join(pub, 'favicon-32x32.png'), 32, false)
await writeSquare(path.join(pub, 'apple-touch-icon.png'), 180, true)
await writeSquare(path.join(pub, 'icons', 'icon-192.png'), 192, true)
await writeSquare(path.join(pub, 'icons', 'icon-512.png'), 512, true)

console.log('wrote logos')
