import test from 'node:test'
import assert from 'node:assert/strict'
import {
  projectToPixels, pixelDistance, pagePoints, groupByPage, centroid, isSeparated, pageKind,
  ringSlices, SEPARATE_PX
} from '../src/utils/pageClusters.js'
import { pageClusterIcon, multiRolePinIcon, initialsOf, pinIcon } from '../src/utils/pageIcons.js'

const addr = (lat, lng, city) => ({ city, postCode: 'X1', location: { latitude: lat, longitude: lng } })

test('pagePoints skips addresses without valid coordinates, keeps index', () => {
  const pts = pagePoints([addr(51.5, -0.1, 'London'), null, { city: 'x' }, addr('a', 1), addr('53.4', '-2.2', 'Manchester')])
  assert.deepEqual(pts.map((p) => p.addressIndex), [0, 4])
  assert.equal(pts[1].lat, 53.4)
  assert.deepEqual(pagePoints(undefined), [])
})

test('groupByPage groups by pageId and ignores items without it', () => {
  const g = groupByPage([{ pageId: 'a', n: 1 }, { pageId: 'b', n: 2 }, { pageId: 'a', n: 3 }, { n: 4 }])
  assert.deepEqual([...g.keys()], ['a', 'b'])
  assert.equal(g.get('a').length, 2)
})

test('centroid', () => {
  assert.equal(centroid([]), null)
  assert.deepEqual(centroid([{ lat: 50, lng: -2 }]), { lat: 50, lng: -2 })
  assert.deepEqual(centroid([{ lat: 50, lng: -2 }, { lat: 52, lng: 0 }]), { lat: 51, lng: -1 })
})

test('single vs multi address', () => {
  assert.equal(pageKind([{}]), 'single')
  assert.equal(pageKind([{}, {}]), 'cluster')
  assert.equal(isSeparated([{ lat: 1, lng: 1 }], 3), true)
})

test('projection is 256*2^zoom wide and doubles per zoom', () => {
  const a = projectToPixels(0, 0, 0)
  assert.ok(Math.abs(a.x - 128) < 1e-9 && Math.abs(a.y - 128) < 1e-9)
  const d6 = pixelDistance({ lat: 51, lng: 0 }, { lat: 51, lng: 1 }, 6)
  const d7 = pixelDistance({ lat: 51, lng: 0 }, { lat: 51, lng: 1 }, 7)
  assert.ok(Math.abs(d7 / d6 - 2) < 1e-9)
})

test('custom projection helper is used', () => {
  const flat = (lat, lng, zoom) => ({ x: lng * zoom, y: lat * zoom })
  assert.equal(pixelDistance({ lat: 0, lng: 0 }, { lat: 3, lng: 4 }, 10, flat), 50)
  assert.equal(isSeparated([{ lat: 0, lng: 0 }, { lat: 0, lng: 5 }], 10, 48, flat), true)
  assert.equal(isSeparated([{ lat: 0, lng: 0 }, { lat: 0, lng: 4 }], 10, 48, flat), false)
})

test('auto-separation by pixel distance at several zooms (Manchester / Leeds, ~58 km)', () => {
  const pts = [{ lat: 53.4808, lng: -2.2426 }, { lat: 53.8008, lng: -1.5491 }]
  const px = (z) => pixelDistance(pts[0], pts[1], z)
  assert.ok(px(6) < SEPARATE_PX)
  assert.equal(isSeparated(pts, 6), false)
  assert.equal(isSeparated(pts, 7), px(7) >= SEPARATE_PX)
  assert.equal(isSeparated(pts, 9), true)
  assert.equal(isSeparated(pts, 13), true)
  // monotonic: once separated, stays separated when zooming in
  let seen = false
  for (let z = 3; z <= 18; z += 1) {
    const s = isSeparated(pts, z)
    if (seen) assert.equal(s, true)
    seen = seen || s
  }
})

test('coincident addresses never separate; every pair must be apart', () => {
  const same = [{ lat: 51.5, lng: -0.1 }, { lat: 51.5, lng: -0.1 }]
  for (let z = 3; z <= 20; z += 1) assert.equal(isSeparated(same, z), false)
  const three = [{ lat: 51.5, lng: -0.1 }, { lat: 51.5001, lng: -0.1 }, { lat: 55, lng: -3 }]
  assert.equal(isSeparated(three, 8), false)
  assert.equal(isSeparated(three, 20), true)
})

test('ringSlices: equal slices clockwise from the top', () => {
  assert.deepEqual(ringSlices([]), [])
  assert.deepEqual(ringSlices(['#a']), [{ color: '#a', startDeg: 0, endDeg: 360 }])
  const s = ringSlices(['#a', '#b', '#c'])
  assert.equal(s.length, 3)
  assert.deepEqual(s.map((x) => x.endDeg - x.startDeg), [120, 120, 120])
  assert.equal(s[2].endDeg, 360)
})

const decode = (url) => decodeURIComponent(url.split(',').slice(1).join(','))

test('page cluster icon: ring colours, badge count, initials fallback', () => {
  const svg = decode(pageClusterIcon({ colors: ['#C2410C', '#D61F26'], count: 3, name: 'Ana López' }))
  assert.match(svg, /#C2410C/)
  assert.match(svg, /#D61F26/)
  assert.match(svg, />3</)
  assert.match(svg, />AL</)
  assert.doesNotMatch(svg, /<image/)
})

test('page cluster icon embeds only data: images, never remote urls', () => {
  const ok = decode(pageClusterIcon({ colors: ['#8900A0'], count: 2, name: 'X', imageDataUrl: 'data:image/jpeg;base64,AAAA' }))
  assert.match(ok, /<image href="data:image\/jpeg;base64,AAAA"/)
  const remote = decode(pageClusterIcon({ colors: ['#8900A0'], count: 2, name: 'X', imageDataUrl: 'https://evil/x.png' }))
  assert.doesNotMatch(remote, /<image/)
})

test('icons escape names and reject non-hex colours', () => {
  const svg = decode(pageClusterIcon({ colors: ['red" onload="x'], count: 2, name: '<script>' }))
  assert.doesNotMatch(svg, /<script>/)
  assert.doesNotMatch(svg, /onload/)
  assert.doesNotMatch(decode(pinIcon('"><x')), /<x/)
})

test('multi-role pin has one ring slice per role; one colour is a plain circle', () => {
  const three = decode(multiRolePinIcon(['#C2410C', '#8900A0', '#D61F26']))
  assert.equal((three.match(/<path d="M[\d.]+ [\d.]+A/g) || []).length, 3)
  const initials = initialsOf('  ')
  assert.equal(initials, '?')
  assert.equal(initialsOf('Tango Club Leeds'), 'TL')
  assert.equal(initialsOf('dj'), 'DJ')
})
