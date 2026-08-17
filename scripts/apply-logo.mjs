import sharp from 'sharp'
import path from 'path'

const src = process.argv[2] || path.resolve('public/logo.png')
const pub = path.resolve('public')

async function toTransparentPng(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.from(data)
  for (let i = 0; i < out.length; i += 4) {
    const lum = out[i] + out[i + 1] + out[i + 2]
    if (lum < 36) out[i + 3] = 0
    else if (lum < 110) out[i + 3] = Math.round(out[i + 3] * ((lum - 36) / 74))
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

const rgb = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { data, info } = rgb
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

const logoClear = await toTransparentPng(src)
await sharp(logoClear).toFile(path.join(pub, 'logo.png'))

const emblemBuf = await toTransparentPng(await sharp(src).extract(extract).png().toBuffer())
const mark = await sharp({
  create: {
    width: outSize,
    height: outSize,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
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

async function writeTransparent(out, px, fromFull) {
  await sharp(fromFull ? logoClear : mark)
    .resize(px, px, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(out)
}

async function writeOpaqueIcon(out, px, fromFull) {
  await sharp(fromFull ? logoClear : mark)
    .resize(px, px, { fit: 'contain', background: { r: 12, g: 11, b: 10, alpha: 1 } })
    .flatten({ background: '#0c0b0a' })
    .png({ compressionLevel: 9 })
    .toFile(out)
}

await writeTransparent(path.join(pub, 'favicon-16x16.png'), 16, false)
await writeTransparent(path.join(pub, 'favicon-32x32.png'), 32, false)
await writeOpaqueIcon(path.join(pub, 'apple-touch-icon.png'), 180, true)
await writeOpaqueIcon(path.join(pub, 'icons', 'icon-192.png'), 192, true)
await writeOpaqueIcon(path.join(pub, 'icons', 'icon-512.png'), 512, true)

console.log('wrote logos')
