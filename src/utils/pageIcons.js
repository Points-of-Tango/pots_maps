// SVG builders for pins and page-cluster markers (data URLs). Pure strings.
//
// Photo inside the page cluster: an SVG used as an <img>/marker icon is
// rendered in "secure static mode", which never fetches external resources, so
// <image href="https://..."> would always come out blank. Therefore the
// icon is built synchronously with an initials fallback, and the photo is only
// embedded when the caller passes `imageDataUrl` (the component downloads the
// logo/picture with fetch+CORS, shrinks it on a canvas and hands over a
// data: URL). If the download fails (no CORS headers, 404...) the initials stay.
import { ringSlices } from './pageClusters.js'
import { CLUSTER_COLOR } from './roles.js'

const PIN_PATH = 'M13 34s10-9.6 10-18C23 8.6 18.6 4 13 4S3 8.6 3 16c0 8.4 10 18 10 18z'

export const CLUSTER_ICON_SIZE = 52

function dataUrl (svg) {
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

function safeColor (color) {
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#191919'
}

function polar (cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
}

// Stroked arcs, one per slice. One color = a full circle.
function ringMarkup (cx, cy, r, width, colors) {
  const safe = colors.map(safeColor)
  if (safe.length <= 1) {
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${safe[0] || '#191919'}" stroke-width="${width}"/>`
  }
  return ringSlices(safe).map((slice) => {
    const [x1, y1] = polar(cx, cy, r, slice.startDeg)
    const [x2, y2] = polar(cx, cy, r, slice.endDeg)
    const large = slice.endDeg - slice.startDeg > 180 ? 1 : 0
    return `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" fill="none" stroke="${slice.color}" stroke-width="${width}"/>`
  }).join('')
}

// Small non-color mark inside the pin head, so roles are told apart without
// relying on hue (deuteranopia). `cx, cy` is the centre, `r` the half size.
export function glyphMarkup (glyph, cx, cy, r, color) {
  const fill = safeColor(color)
  switch (glyph) {
    case 'triangle':
      return `<path d="M${cx} ${cy - r}L${cx + r} ${cy + r * 0.8}H${cx - r}z" fill="${fill}"/>`
    case 'disc':
      return `<circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="${fill}"/>`
    case 'square':
      return `<rect x="${cx - r * 0.85}" y="${cy - r * 0.85}" width="${r * 1.7}" height="${r * 1.7}" fill="${fill}"/>`
    case 'diamond':
      return `<path d="M${cx} ${cy - r * 1.15}L${cx + r * 1.15} ${cy}L${cx} ${cy + r * 1.15}L${cx - r * 1.15} ${cy}z" fill="${fill}"/>`
    case 'dash':
      return `<rect x="${cx - r}" y="${cy - r * 0.3}" width="${r * 2}" height="${r * 0.6}" fill="${fill}"/>`
    default:
      return ''
  }
}

// Single-role pin: white head with the role glyph in the role color.
export function pinIcon (color, glyph) {
  const fill = safeColor(color)
  return dataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 26 36"><path d="${PIN_PATH}" fill="${fill}" stroke="#ffffff" stroke-width="1.6"/><circle cx="13" cy="15" r="${glyph && glyph !== 'none' ? 5.4 : 4.2}" fill="#ffffff"/>${glyphMarkup(glyph, 13, 15, 3.3, fill)}</svg>`)
}

// Single-address page with several roles: same pin, but the white dot becomes
// a ring with one slice per role (same ring language as the page cluster).
// The glyph of the primary role sits in the hole of the ring.
export function multiRolePinIcon (colors, glyph) {
  const fill = safeColor(colors[0])
  return dataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 26 36"><path d="${PIN_PATH}" fill="${fill}" stroke="#ffffff" stroke-width="1.6"/><circle cx="13" cy="15" r="7.2" fill="#ffffff"/>${ringMarkup(13, 15, 5.4, 3, colors)}${glyphMarkup(glyph, 13, 15, 2, '#191919')}</svg>`)
}

export function initialsOf (name) {
  const words = String(name == null ? '' : name).replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  if (!words.length) return '?'
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]
  return letters.toUpperCase()
}

function xmlEscape (value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Page with several addresses: circle with ring (role colors), photo or
// initials inside and a badge with the number of addresses.
export function pageClusterIcon ({ colors, count, name, imageDataUrl }) {
  const size = CLUSTER_ICON_SIZE
  const c = size / 2
  const inner = 17
  let face
  if (imageDataUrl && /^data:image\//.test(imageDataUrl)) {
    face = `<circle cx="${c}" cy="${c}" r="${inner}" fill="#ffffff"/><clipPath id="f"><circle cx="${c}" cy="${c}" r="${inner}"/></clipPath><image href="${xmlEscape(imageDataUrl)}" x="${c - inner}" y="${c - inner}" width="${inner * 2}" height="${inner * 2}" preserveAspectRatio="xMidYMid slice" clip-path="url(#f)"/>`
  } else {
    face = `<circle cx="${c}" cy="${c}" r="${inner}" fill="#F0F7F9"/><text x="${c}" y="${c + 5}" text-anchor="middle" font-family="Open Sans, Arial, sans-serif" font-size="14" font-weight="700" fill="#191919">${xmlEscape(initialsOf(name))}</text>`
  }
  const badge = `<circle cx="42" cy="42" r="9" fill="${CLUSTER_COLOR}" stroke="#ffffff" stroke-width="2"/><text x="42" y="46" text-anchor="middle" font-family="Open Sans, Arial, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${xmlEscape(count)}</text>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${c}" cy="${c}" r="23" fill="#ffffff"/>${ringMarkup(c, c, 20, 5, colors)}${face}${badge}</svg>`
  return dataUrl(svg)
}

export function geoClusterIcon () {
  return dataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="${CLUSTER_COLOR}" stroke="#ffffff" stroke-width="2"/></svg>`)
}
