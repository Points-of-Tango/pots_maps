import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeRoles, primaryRole, roleLabel, roleColors, ROLE_COLORS, topBarBackground,
  roleChipsHtml, escapeHtml
} from '../src/utils/roles.js'

test('uses types, primary role first, rest in fixed order, deduped', () => {
  assert.deepEqual(normalizeRoles({ type: 'PROFESSIONAL', types: ['DJ', 'PROFESSIONAL', 'ORGANISER', 'DJ'] }),
    ['PROFESSIONAL', 'ORGANISER', 'DJ'])
  assert.deepEqual(normalizeRoles({ type: 'DJ', types: ['ORGANISER', 'PROFESSIONAL'] }),
    ['DJ', 'PROFESSIONAL', 'ORGANISER'])
})

test('falls back to [type] when types is missing, empty or not a list', () => {
  assert.deepEqual(normalizeRoles({ type: 'DJ' }), ['DJ'])
  assert.deepEqual(normalizeRoles({ type: 'DJ', types: [] }), ['DJ'])
  assert.deepEqual(normalizeRoles({ type: 'DJ', types: 'DJ' }), ['DJ'])
})

test('unknown or missing type behaves as Teacher', () => {
  assert.equal(primaryRole('WHATEVER'), 'PROFESSIONAL')
  assert.equal(primaryRole(undefined), 'PROFESSIONAL')
  assert.deepEqual(normalizeRoles({}), ['PROFESSIONAL'])
  assert.deepEqual(normalizeRoles(undefined), ['PROFESSIONAL'])
  assert.deepEqual(normalizeRoles({ type: 'X', types: ['Y', 'dj'] }), ['PROFESSIONAL', 'DJ'])
  assert.equal(roleLabel('nope'), 'Teacher')
})

test('type ORCHESTRA with types [MUSICIAN] keeps both', () => {
  assert.deepEqual(normalizeRoles({ type: 'ORCHESTRA', types: ['MUSICIAN'] }), ['ORCHESTRA', 'MUSICIAN'])
})

test('palette', () => {
  assert.equal(ROLE_COLORS.PROFESSIONAL, '#C2410C')
  assert.equal(ROLE_COLORS.ORCHESTRA, '#3B1F7A')
  assert.equal(ROLE_COLORS.EVENT, '#191919')
  assert.notEqual(ROLE_COLORS.EVENT.toLowerCase(), '#1b82c5')
  assert.deepEqual(roleColors(['DJ', 'ORGANISER']), ['#D61F26', '#8900A0'])
})

test('top bar: one color or equal segments', () => {
  assert.equal(topBarBackground(['#111111']), '#111111')
  assert.equal(topBarBackground(['#111111', '#222222']),
    'linear-gradient(90deg, #111111 0% 50%, #222222 50% 100%)')
})

test('chips: one per role, labelled and coloured', () => {
  const html = roleChipsHtml(['PROFESSIONAL', 'DJ', 'ORCHESTRA'])
  assert.equal((html.match(/ukata-chip"/g) || []).length, 3)
  assert.match(html, /background:#C2410C">Teacher</)
  assert.match(html, /background:#D61F26">DJ</)
  assert.match(html, /background:#3B1F7A">Orchestra</)
})

test('chips escape every interpolated value', () => {
  const html = roleChipsHtml(['DJ'], () => 'X')
  assert.match(html, /background:X">X</)
  assert.equal(escapeHtml('<a href="x">&\''), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
  assert.equal(escapeHtml(null), '')
})
