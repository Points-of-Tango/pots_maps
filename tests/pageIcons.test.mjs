import test from 'node:test'
import assert from 'node:assert/strict'
import { pinIcon, multiRolePinIcon, glyphMarkup } from '../src/utils/pageIcons.js'

const svgOf = (url) => decodeURIComponent(url.replace(/^data:image\/svg\+xml;charset=UTF-8,/, ''))

test('pin glyphs differ per shape and event pin stays plain', () => {
  const shapes = ['triangle', 'disc', 'square', 'diamond', 'dash'].map((g) => svgOf(pinIcon('#C2410C', g)))
  assert.equal(new Set(shapes).size, 5)
  assert.match(svgOf(pinIcon('#C2410C', 'triangle')), /<path d="M13 11.7L/)
  assert.equal(glyphMarkup('none', 13, 15, 3, '#000000'), '')
  assert.doesNotMatch(svgOf(pinIcon('#191919', 'none')), /<rect|<circle cx="13" cy="15" r="3/)
})

test('multi-role pin keeps the ring and adds the primary glyph', () => {
  const svg = svgOf(multiRolePinIcon(['#C2410C', '#B0125B'], 'triangle'))
  assert.equal((svg.match(/<path d="M[\d.]+ [\d.]+A/g) || []).length, 2)
  assert.match(svg, /fill="#191919"/)
})
