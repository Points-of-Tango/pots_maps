import test from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeRoles, primaryRole, roleLabel, roleColors, ROLE_COLORS, topBarBackground,
  roleChipsHtml, escapeHtml, toRootRole, roleLabels, roleGlyph, ROLE_LABELS, OTHER_ROLE
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
  assert.deepEqual(normalizeRoles({ type: 'VINYL', types: [], categories: [] }), ['DJ'])
})

test('types empty/missing + categories present: roots derived from categories', () => {
  assert.deepEqual(normalizeRoles({ type: 'PROFESSIONAL', categories: ['TEACHER', 'DJ', 'ORGANISER'] }),
    ['PROFESSIONAL', 'ORGANISER', 'DJ'])
  assert.deepEqual(normalizeRoles({ type: 'DJ', types: [], categories: ['TEACHER', 'VINYL'] }), ['DJ', 'PROFESSIONAL'])
})

test('types wins over categories when it is non-empty', () => {
  assert.deepEqual(normalizeRoles({ type: 'DJ', types: ['DJ'], categories: ['TEACHER'] }), ['DJ'])
})

test('both types and categories missing: single role from type', () => {
  assert.deepEqual(normalizeRoles({ type: 'SINGER' }), ['ORCHESTRA'])
  assert.deepEqual(normalizeRoles({ type: 'organiser', types: null, categories: null }), ['ORGANISER'])
})

test('subtype -> root', () => {
  assert.equal(toRootRole('SINGER'), 'ORCHESTRA')
  assert.equal(toRootRole('vinyl'), 'DJ')
  assert.equal(toRootRole('PHOTOGRAPHER'), 'MEDIA')
  assert.equal(toRootRole('MUSICIAN'), 'ORCHESTRA')
  assert.equal(toRootRole('TEACHER'), 'PROFESSIONAL')
  assert.equal(toRootRole('YOGA'), 'FIT')
  assert.equal(toRootRole('TAXI_DANCER'), 'TAXI_DANCER')
  assert.equal(toRootRole('toString'), null)
  assert.deepEqual(normalizeRoles({ type: 'PHOTOGRAPHER', types: ['VIDEOGRAPHER', 'TEACHER'] }), ['MEDIA', 'PROFESSIONAL'])
  assert.deepEqual(normalizeRoles({ type: 'SINGER', types: ['SINGER'] }), ['ORCHESTRA'])
})

test('unknown roles are "Other", never Teacher', () => {
  assert.equal(toRootRole('WHATEVER'), null)
  assert.equal(primaryRole('WHATEVER'), OTHER_ROLE)
  assert.equal(primaryRole(undefined), OTHER_ROLE)
  assert.deepEqual(normalizeRoles({}), ['OTHER'])
  assert.deepEqual(normalizeRoles(undefined), ['OTHER'])
  assert.deepEqual(normalizeRoles({ type: 'X', types: ['Y', 'dj'] }), ['OTHER', 'DJ'])
  assert.equal(roleLabel('OTHER'), 'Other')
  assert.equal(roleLabel('nope'), 'Other')
  assert.notEqual(ROLE_COLORS.OTHER, ROLE_COLORS.PROFESSIONAL)
  assert.equal(ROLE_COLORS.OTHER, '#585858')
  const html = roleChipsHtml(normalizeRoles({ type: 'X' }))
  assert.match(html, /background:#585858">Other</)
  assert.doesNotMatch(html, /Teacher|#C2410C/)
})

test('known roots have a real label and color', () => {
  assert.equal(ROLE_LABELS.MEDIA, 'Media')
  assert.equal(ROLE_LABELS.TAXI_DANCER, 'Taxi dancer')
  assert.equal(roleLabels(['PROFESSIONAL', 'DJ']), 'Teacher, DJ')
  ;['PROFESSIONAL', 'ORGANISER', 'DJ', 'ORCHESTRA', 'MEDIA', 'FIT', 'PAINTER', 'DRESSMAKER', 'TAXI_DANCER', 'OTHER', 'EVENT'].forEach((role) => {
    assert.match(ROLE_COLORS[role], /^#[0-9A-F]{6}$/)
  })
})

test('glyphs: distinct non-color cue per main role', () => {
  assert.deepEqual(['PROFESSIONAL', 'DJ', 'ORGANISER', 'ORCHESTRA', 'MEDIA'].map(roleGlyph),
    ['triangle', 'disc', 'square', 'diamond', 'dash'])
})

test('type ORCHESTRA with types [MUSICIAN] collapses to Orchestra', () => {
  assert.deepEqual(normalizeRoles({ type: 'ORCHESTRA', types: ['MUSICIAN'] }), ['ORCHESTRA'])
})

test('palette', () => {
  assert.equal(ROLE_COLORS.PROFESSIONAL, '#C2410C')
  assert.equal(ROLE_COLORS.DJ, '#B0125B')
  assert.equal(ROLE_COLORS.ORCHESTRA, '#3B1F7A')
  assert.equal(ROLE_COLORS.EVENT, '#191919')
  assert.notEqual(ROLE_COLORS.EVENT.toLowerCase(), '#1b82c5')
  assert.deepEqual(roleColors(['DJ', 'ORGANISER']), ['#B0125B', '#8900A0'])
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
  assert.match(html, /background:#B0125B">DJ</)
  assert.match(html, /background:#3B1F7A">Orchestra</)
})

test('chips escape every interpolated value', () => {
  const html = roleChipsHtml(['DJ'], () => 'X')
  assert.match(html, /background:X">X</)
  assert.equal(escapeHtml('<a href="x">&\''), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;')
  assert.equal(escapeHtml(null), '')
})
