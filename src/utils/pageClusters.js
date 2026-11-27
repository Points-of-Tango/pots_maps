// Page clusters: all the points of one page (several addresses) are drawn as
// ONE marker. Pure module (no Vue, no google) so it can run under node:test.

export const SEPARATE_PX = 48 // addresses closer than this on screen still overlap

// Web Mercator, in screen pixels at `zoom` (256px tiles). Same maths as Google Maps.
export function projectToPixels (lat, lng, zoom) {
  const scale = 256 * Math.pow(2, zoom)
  const sin = Math.min(Math.max(Math.sin(lat * Math.PI / 180), -0.9999), 0.9999)
  return {
    x: (lng + 180) / 360 * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale
  }
}

export function pixelDistance (a, b, zoom, project = projectToPixels) {
  const pa = project(a.lat, a.lng, zoom)
  const pb = project(b.lat, b.lng, zoom)
  return Math.hypot(pa.x - pb.x, pa.y - pb.y)
}

// Valid {lat,lng} points of a page, one per address, keeping the address index.
export function pagePoints (addresses) {
  const points = []
  ;(addresses || []).forEach((address, addressIndex) => {
    if (!address || !address.location) return
    const lat = Number(address.location.latitude)
    const lng = Number(address.location.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    points.push({ addressIndex, lat, lng, city: address.city, postcode: address.postCode })
  })
  return points
}

// Groups flat items ({ pageId, ... }) by pageId, keeping first-seen order.
export function groupByPage (items) {
  const groups = new Map()
  items.forEach((item) => {
    if (item.pageId == null) return
    if (!groups.has(item.pageId)) groups.set(item.pageId, [])
    groups.get(item.pageId).push(item)
  })
  return groups
}

// Representative point of a page: mean of its addresses (fine at UK scale).
export function centroid (points) {
  if (!points.length) return null
  return {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length
  }
}

// A page cluster separates by itself when no two of its addresses overlap on
// screen at this zoom. Single-address pages are never clusters.
export function isSeparated (points, zoom, minPx = SEPARATE_PX, project = projectToPixels) {
  if (points.length < 2) return true
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      if (pixelDistance(points[i], points[j], zoom, project) < minPx) return false
    }
  }
  return true
}

// 'single' = one pin; 'cluster' = one marker standing for several addresses.
export function pageKind (points) {
  return points.length > 1 ? 'cluster' : 'single'
}

// Equal slices of a ring, clockwise from 12 o'clock.
export function ringSlices (colors) {
  const count = colors.length
  if (!count) return []
  return colors.map((color, i) => ({
    color,
    startDeg: 360 / count * i,
    endDeg: 360 / count * (i + 1)
  }))
}
