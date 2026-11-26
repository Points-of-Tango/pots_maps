// Roles of a page (Teacher, Tango club, DJ...), their colors and labels.
// Pure module (no Vue, no google) so it can be tested with node:test.
// This is the single source of truth for the palette: the pins, the legend,
// the popup chips/top bar and the cluster swatch all read from here.

export const ROLE_COLORS = {
  PROFESSIONAL: '#C2410C', // Teacher: terracotta (the old light blue blended with Google Maps water)
  ORGANISER: '#8900A0', // Tango club: violet
  DJ: '#D61F26', // DJ: red
  MUSICIAN: '#234951', // Musician: dark teal
  ORCHESTRA: '#3B1F7A', // Orchestra: indigo
  EVENT: '#191919' // Events: charcoal
}

export const CLUSTER_COLOR = '#191919' // geographic cluster: charcoal circle, white count

export const ROLE_LABELS = {
  PROFESSIONAL: 'Teacher',
  ORGANISER: 'Tango club',
  DJ: 'DJ',
  MUSICIAN: 'Musician',
  ORCHESTRA: 'Orchestra'
}

// Fixed order used for chips, rings and the top bar after the primary role.
export const ROLE_ORDER = ['PROFESSIONAL', 'ORGANISER', 'DJ', 'MUSICIAN', 'ORCHESTRA']

export const DEFAULT_ROLE = 'PROFESSIONAL'

function cleanRole (value) {
  const role = String(value == null ? '' : value).trim().toUpperCase()
  return ROLE_ORDER.indexOf(role) >= 0 ? role : null
}

// Role that drives the pin color. Unknown/missing type behaves as Teacher,
// as the map always did.
export function primaryRole (type) {
  return cleanRole(type) || DEFAULT_ROLE
}

export function roleLabel (type) {
  return ROLE_LABELS[primaryRole(type)]
}

// All roles of a page: `types` when present, else [type]. Unknown entries are
// dropped, duplicates removed. The primary role (`type`) always belongs to the
// list (the API sometimes sends type ORCHESTRA with types [MUSICIAN]) and goes
// first; the rest follows ROLE_ORDER so the result is stable.
export function normalizeRoles (item) {
  const source = item || {}
  const primary = primaryRole(source.type)
  const found = {}
  found[primary] = true
  if (Array.isArray(source.types)) {
    source.types.forEach((value) => {
      const role = cleanRole(value)
      if (role) found[role] = true
    })
  }
  return [primary].concat(ROLE_ORDER.filter((role) => found[role] && role !== primary))
}

export function roleColors (roles) {
  return roles.map((role) => ROLE_COLORS[role] || ROLE_COLORS[DEFAULT_ROLE])
}

// CSS background for the popup top bar: one color, or equal segments.
export function topBarBackground (colors) {
  if (!colors.length) return ROLE_COLORS[DEFAULT_ROLE]
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
    const color = ROLE_COLORS[role] || ROLE_COLORS[DEFAULT_ROLE]
    const label = ROLE_LABELS[role] || ROLE_LABELS[DEFAULT_ROLE]
    return `<span class="ukata-chip" style="background:${esc(color)}">${esc(label)}</span>`
  })
  return `<p class="ukata-chips">${chips.join('')}</p>`
}
