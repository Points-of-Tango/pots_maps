// Downloads an image with CORS and returns a small data: URL (or '' on any
// failure) so it can be embedded in an SVG marker icon. See pageIcons.js.
const cache = new Map()

export function loadImageDataUrl (url, size = 80) {
  if (!url || typeof fetch !== 'function') return Promise.resolve('')
  if (!cache.has(url)) {
    cache.set(url, fetch(url, { mode: 'cors' })
      .then((response) => (response.ok ? response.blob() : Promise.reject(new Error('http'))))
      .then((blob) => createImageBitmap(blob))
      .then((bitmap) => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const side = Math.min(bitmap.width, bitmap.height)
        canvas.getContext('2d').drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
        return canvas.toDataURL('image/jpeg', 0.8)
      })
      .catch(() => ''))
  }
  return cache.get(url)
}
