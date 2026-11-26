import { SITE } from '../config/site.js'

// Public profile of a page on Points of Tango. The API only returns `slug`
// once pots_api `feat/pages-slug` is deployed; until then the id is used.
// Returns '' when there is neither slug nor id, so callers can skip the link.
export function profileUrl (slugOrItem, id) {
  let slug = slugOrItem
  let pageId = id
  if (slugOrItem && typeof slugOrItem === 'object') {
    slug = slugOrItem.slug
    pageId = slugOrItem.id !== undefined ? slugOrItem.id : slugOrItem.pageId
  }
  const key = [slug, pageId]
    .map((value) => String(value == null ? '' : value).trim())
    .find((value) => value !== '')
  if (!key) return ''
  return `${SITE.pointsOfTango}/profile/${encodeURIComponent(key)}`
}
