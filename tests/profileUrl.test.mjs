import test from 'node:test'
import assert from 'node:assert/strict'
import { profileUrl } from '../src/utils/profileUrl.js'

const BASE = 'https://www.pointsoftango.com/profile/'

test('slug wins over id', () => {
  assert.equal(profileUrl('daniel.genie', 'abc'), BASE + 'daniel.genie')
  assert.equal(profileUrl({ slug: 'daniel-genie', id: 'abc' }), BASE + 'daniel-genie')
})

test('falls back to the id when there is no slug', () => {
  assert.equal(profileUrl(undefined, 'abc-123'), BASE + 'abc-123')
  assert.equal(profileUrl('', 'abc-123'), BASE + 'abc-123')
  assert.equal(profileUrl({ id: 'abc-123' }), BASE + 'abc-123')
  assert.equal(profileUrl({ pageId: 'p1', slug: null }), BASE + 'p1')
})

test('encodes the segment', () => {
  assert.equal(profileUrl('a b/c?d#e'), BASE + 'a%20b%2Fc%3Fd%23e')
})

test('no slug and no id gives an empty string', () => {
  assert.equal(profileUrl(), '')
  assert.equal(profileUrl(null, null), '')
  assert.equal(profileUrl({}), '')
  assert.equal(profileUrl('  ', ' '), '')
})
