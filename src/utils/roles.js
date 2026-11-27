// Roles of a page (Teacher, Tango club, DJ...), their colors and labels.
// Pure module (no Vue, no google) so it can be tested with node:test.
// This is the single source of truth for the palette: the pins, the legend,
// the popup chips/top bar and the cluster swatch all read from here.

export const ROLE_COLORS = {
  PROFESSIONAL: '#C2410C', // Teacher: terracotta (the old light blue blended with Google Maps water)
  ORGANISER: '#8900A0', // Tango club: violet
  // DJ: deep raspberry. The old red (#D61F26) collapsed into terracotta under
  // deuteranopia; this one keeps a blue component, so it reads as a cool
  // pinkish-grey there while terracotta stays a warm brown. 6.8:1 on white.
  // The pin glyph (see ROLE_GLYPHS) is the non-color cue.
  DJ: '#B0125B',
  ORCHESTRA: '#3B1F7A', // Orchestra: indigo
  MEDIA: '#1D4ED8', // royal blue (dark, not the light blue of the map water)
  FIT: '#0F766E', // dark teal
  PAINTER: '#6B4423', // brown
  DRESSMAKER: '#0369A1', // dark steel blue
  TAXI_DANCER: '#9F1239', // rose
  OTHER: '#585858', // unknown role: neutral grey
  EVENT: '#191919' // Events: charcoal
}

export const CLUSTER_COLOR = '#191919' // geographic cluster: charcoal circle, white count

export const ROLE_LABELS = {
  PROFESSIONAL: 'Teacher',
  ORGANISER: 'Tango club',
  DJ: 'DJ',
  ORCHESTRA: 'Orchestra',
  MEDIA: 'Media',
  FIT: 'Fit',
  PAINTER: 'Painter',
  DRESSMAKER: 'Dressmaker',
  TAXI_DANCER: 'Taxi dancer',
  OTHER: 'Other',
  EVENT: 'Event'
}

// Non-color cue drawn inside the white pin head (see pageIcons.js).
export const ROLE_GLYPHS = {
  PROFESSIONAL: 'triangle',
  DJ: 'disc',
  ORGANISER: 'square',
  ORCHESTRA: 'diamond',
  EVENT: 'none'
}

export function roleGlyph (role) {
  return ROLE_GLYPHS[role] || 'dash'
}

// Fixed order used for chips, rings and the top bar after the primary role.
export const ROLE_ORDER = [
  'PROFESSIONAL', 'ORGANISER', 'DJ', 'ORCHESTRA',
  'MEDIA', 'FIT', 'PAINTER', 'DRESSMAKER', 'TAXI_DANCER', 'OTHER'
]

export const OTHER_ROLE = 'OTHER'

// Sub-type -> root role. Same rule as PageType.typesFromCategories in pots_api.
const ROOT_BY_TYPE = {
  ORCHESTRA: 'ORCHESTRA',
  DUO: 'ORCHESTRA',
  TRIO: 'ORCHESTRA',
  QUARTET: 'ORCHESTRA',
  SOLTIST: 'ORCHESTRA',
  SINGER: 'ORCHESTRA',
  MUSICIAN: 'ORCHESTRA',
  PROFESSIONAL: 'PROFESSIONAL',
  TEACHER: 'PROFESSIONAL',
  PERFORMER: 'PROFESSIONAL',
  CHOREOGRAPHER: 'PROFESSIONAL',
  MAESTRO: 'PROFESSIONAL',
  DJ: 'DJ',
  VINYL: 'DJ',
  PHOTOGRAPHER: 'MEDIA',
  VIDEOGRAPHER: 'MEDIA',
  MEDIA: 'MEDIA',
  YOGA: 'FIT',
  MASSAGE: 'FIT',
  FIT: 'FIT',
  ORGANISER: 'ORGANISER',
  PAINTER: 'PAINTER',
  DRESSMAKER: 'DRESSMAKER',
  TAXI_DANCER: 'TAXI_DANCER'
}

function clean (value) {
  return String(value == null ? '' : value).trim().toUpperCase()
}

// Root role of a (sub)type, or null when it is empty or unknown.
export function toRootRole (value) {
  const key = clean(value)
  return Object.prototype.hasOwnProperty.call(ROOT_BY_TYPE, key) ? ROOT_BY_TYPE[key] : null
}

// Like toRootRole, but unknown values become OTHER (never Teacher).
function rootOrOther (value) {
  return toRootRole(value) || OTHER_ROLE
}

// Role that drives the pin color. Unknown or missing type is "Other".
export function primaryRole (type) {
  return rootOrOther(type)
}

export function roleLabel (role) {
  return ROLE_LABELS[role] || ROLE_LABELS[OTHER_ROLE]
}

export function roleLabels (roles) {
  return roles.map(roleLabel).join(', ')
}

function nonEmptyList (value) {
  return Array.isArray(value) && value.length > 0 ? value : null
}

// All roles of a page, as root roles. Source: `types` if it is a non-empty
// list, else `categories` if it is a non-empty list, else [type]. Subtypes are
// mapped to their root, unknown strings become OTHER (so the page is never
// relabelled silently), duplicates removed. The primary role (`type`) always
// belongs to the list and goes first; the rest follows ROLE_ORDER.
export function normalizeRoles (item) {
  const source = item || {}
  const list = nonEmptyList(source.types) || nonEmptyList(source.categories) || [source.type]
  const found = {}
  list.forEach((value) => { found[rootOrOther(value)] = true })
  const primary = clean(source.type) ? primaryRole(source.type) : ROLE_ORDER.filter((role) => found[role])[0] || OTHER_ROLE
  found[primary] = true
  return [primary].concat(ROLE_ORDER.filter((role) => found[role] && role !== primary))
}

export function roleColors (roles) {
  return roles.map((role) => ROLE_COLORS[role] || ROLE_COLORS[OTHER_ROLE])
}

// CSS background for the popup top bar: one color, or equal segments.
export function topBarBackground (colors) {
  if (!colors.length) return ROLE_COLORS[OTHER_ROLE]
  if (colors.length === 1) return colors[0]
  const step = 100 / colors.length
  const stops = colors.map((color, i) => `${color} ${+(step * i).toFixed(2)}% ${+(step * (i + 1)).toFixed(2)}%`)
  return `linear-gradient(90deg, ${stops.join(', ')})`
}

export function escapeHtml (value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Chips with every role of the page. They wrap, so the card grows with them.
export function roleChipsHtml (roles, esc = escapeHtml) {
  const chips = roles.map((role) => {
    const color = ROLE_COLORS[role] || ROLE_COLORS[OTHER_ROLE]
    const label = roleLabel(role)
    return `<span class="ukata-chip" style="background:${esc(color)}">${esc(label)}</span>`
  })
  return `<p class="ukata-chips">${chips.join('')}</p>`
}
