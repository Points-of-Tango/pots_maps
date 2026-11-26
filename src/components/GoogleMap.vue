<template>
  <div id="map" :class="{ 'is-mobile': isMobile }">
    <div class="map-frame">
      <GmapMap
        id="mapId"
        ref="mapRef"
        :center="center"
        :zoom="zoomLevel"
        :options="mapOptions"
        style="width: 100%; height: 100%;"
        @click="closePopup"
      >
        <gmap-cluster
          :styles="clusterStyles"
          :zoom-on-click="true"
          :max-zoom="12"
          :grid-size="60"
          :enable-retina-icons="true"
        >
          <gmap-marker
            v-for="m in clusterMarkers"
            :key="m.key"
            :position="m"
            :clickable="true"
            :icon="m.icon"
            :title="m.title"
            @click="onMarkerClick(m)"
          />
        </gmap-cluster>
        <!-- Real pins of expanded / auto-separated pages live outside the geographic clusterer -->
        <gmap-marker
          v-for="m in freeMarkers"
          :key="m.key"
          :position="m"
          :clickable="true"
          :icon="m.icon"
          :title="m.title"
          @click="onMarkerClick(m)"
        />
        <gmap-info-window
          v-if="!isMobile"
          ref="infoWindow"
          :options="infoOptions"
          :position="infoWindowPos"
          :opened="infoWindowOpen"
          @closeclick="closePopup"
        />
      </GmapMap>
      <div class="map-legend" aria-hidden="true">
        <template v-if="legendMode === 'events'">
          <div><span class="swatch" :style="{ background: roleColors.EVENT }"></span> Events</div>
        </template>
        <template v-else>
          <div><span class="swatch" :style="{ background: roleColors.PROFESSIONAL }"></span> Teachers</div>
          <div><span class="swatch" :style="{ background: roleColors.ORGANISER }"></span> Tango club</div>
          <div><span class="swatch" :style="{ background: roleColors.DJ }"></span> DJs</div>
          <div><span class="swatch" :style="{ background: roleColors.MUSICIAN }"></span> Musicians</div>
          <div><span class="swatch" :style="{ background: roleColors.ORCHESTRA }"></span> Orchestras</div>
        </template>
        <div v-if="legendMode !== 'events'"><span class="swatch swatch--page"></span> Page, several addresses</div>
        <div><span class="swatch swatch--cluster"></span> Nearby places</div>
      </div>
      <div
        v-if="isMobile && sheetOpen && activeItem"
        class="map-sheet"
        role="dialog"
        aria-label="Place details"
      >
        <button type="button" class="ukata-popup-close" aria-label="Close" @click="closePopup">×</button>
        <div v-html="popupMarkup(activeItem)"></div>
      </div>
    </div>
  </div>
</template>

<script>
import GmapCluster from 'vue2-google-maps/dist/components/cluster'
import {
  ROLE_COLORS, ROLE_LABELS, normalizeRoles, primaryRole, roleColors,
  roleChipsHtml, topBarBackground, escapeHtml
} from '@/utils/roles'
import { pagePoints, centroid, isSeparated } from '@/utils/pageClusters'
import { pinIcon, multiRolePinIcon, pageClusterIcon, geoClusterIcon, CLUSTER_ICON_SIZE } from '@/utils/pageIcons'
import { profileUrl } from '@/utils/profileUrl'
import { loadImageDataUrl } from '@/utils/imageDataUrl'

const ICONS = {
  PROFESSIONAL: pinIcon(ROLE_COLORS.PROFESSIONAL),
  ORGANISER: pinIcon(ROLE_COLORS.ORGANISER),
  DJ: pinIcon(ROLE_COLORS.DJ),
  MUSICIAN: pinIcon(ROLE_COLORS.MUSICIAN),
  ORCHESTRA: pinIcon(ROLE_COLORS.ORCHESTRA),
  EVENT: pinIcon(ROLE_COLORS.EVENT)
}

// "open outside" icon (FontAwesome 6 up-right-from-square) for the popup HTML string
const OPEN_ICON_SVG = '<svg class="ukata-open-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="12" height="12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V32c0-17.7-14.3-32-32-32H352zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/></svg>'

const MAP_OPTIONS = {
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false
}

// Production 0.0.5 box (commit "Fix center map to england"). Named GBR there.
const GBR_BOUNDS = {
  sw: { lat: 50.060847, lng: -5.667927 },
  ne: { lat: 56.493084, lng: 1.1675047 }
}

const UK_CENTER = { lat: 54.5, lng: -3.5 }

// Clustering ends at zoom 12, so from 13 every pin is drawn. Pins that share
// a coordinate would still sit on one pixel; spread those onto a ring whose
// radius stays a constant number of pixels as the zoom changes.
const SPIDER_FROM_ZOOM = 13
const SPIDER_GAP_PX = 48
const SPIDER_OVERLAP_PX = 34
// Zoom cap when a page cluster is expanded onto (almost) one spot
const MAX_EXPAND_ZOOM = 16

function metersBetween (a, b) {
  const lat1 = a.sourceLat * Math.PI / 180
  const lat2 = b.sourceLat * Math.PI / 180
  const north = (b.sourceLat - a.sourceLat) * 111320
  const east = (b.sourceLng - a.sourceLng) * 111320 * Math.cos((lat1 + lat2) / 2)
  return Math.hypot(north, east)
}

function spiderLatLng (lat, lng, index, count, zoom) {
  if (count < 2 || zoom < SPIDER_FROM_ZOOM) {
    return { lat, lng }
  }
  const radiusPx = SPIDER_GAP_PX / (2 * Math.sin(Math.PI / count))
  const angle = (2 * Math.PI * index) / count - Math.PI / 2
  const latRad = lat * Math.PI / 180
  const metersPerPx = 156543.03392 * Math.cos(latRad) / Math.pow(2, zoom)
  const east = Math.cos(angle) * radiusPx * metersPerPx
  const north = Math.sin(angle) * radiusPx * metersPerPx
  return {
    lat: lat + north / 111320,
    lng: lng + east / (111320 * Math.cos(latRad))
  }
}

function overlapMeters (lat, zoom) {
  const metersPerPx = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom)
  return SPIDER_OVERLAP_PX * metersPerPx
}

function spreadSharedPins (markers, zoom) {
  markers.forEach((marker) => {
    marker.lat = marker.sourceLat
    marker.lng = marker.sourceLng
  })
  if (zoom < SPIDER_FROM_ZOOM) return markers
  const pending = markers.slice()
  while (pending.length) {
    const seed = pending.shift()
    const group = [seed]
    const limit = overlapMeters(seed.sourceLat, zoom)
    for (let i = 0; i < pending.length;) {
      if (metersBetween(seed, pending[i]) <= limit) {
        group.push(pending.splice(i, 1)[0])
      } else {
        i += 1
      }
    }
    group.sort((a, b) => {
      return String(a.name).localeCompare(String(b.name)) || String(a.key).localeCompare(String(b.key))
    })
    const centerLat = group.reduce((sum, marker) => sum + marker.sourceLat, 0) / group.length
    const centerLng = group.reduce((sum, marker) => sum + marker.sourceLng, 0) / group.length
    group.forEach((marker, slot) => {
      const pos = spiderLatLng(centerLat, centerLng, slot, group.length, zoom)
      marker.lat = pos.lat
      marker.lng = pos.lng
    })
  }
  return markers
}

// Memoised so a zoom tick does not rebuild identical data URLs.
const iconCache = new Map()
function cached (key, build) {
  if (!iconCache.has(key)) iconCache.set(key, build())
  return iconCache.get(key)
}

function placeText (point) {
  return [point.city, point.postcode].filter(Boolean).join(' · ')
}

export default {
  name: 'GoogleMap',
  components: { GmapCluster },
  props: {
    elements: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      infoOptions: {
        content: '',
        maxWidth: 360,
        pixelOffset: {
          width: 0,
          height: 0
        }
      },
      clusterStyles: [{
        url: geoClusterIcon(),
        width: 40,
        height: 40,
        textColor: '#ffffff',
        textSize: 13,
        fontWeight: '700',
        fontFamily: 'Open Sans, sans-serif'
      }],
      currentKey: null,
      infoWindowPos: null,
      infoWindowOpen: false,
      sheetOpen: false,
      activeItem: null,
      isMobile: false,
      center: { ...UK_CENTER },
      zoomLevel: 6,
      spiderZoom: 6,
      mapZoom: 6,
      // pageId -> true for multi-address pages whose addresses no longer overlap
      separated: {},
      // page opened by clicking its page cluster (only one at a time)
      expandedPageId: null,
      // logo/picture url -> small data: URL, filled asynchronously
      pageImages: {},
      mapOptions: MAP_OPTIONS,
      roleColors: ROLE_COLORS
    }
  },
  watch: {
    elements: function () {
      this.closePopup()
      this.recomputeSeparation(this.mapZoom)
      this.loadPageImages()
    },
    spiderZoom: function () {
      this.syncOpenCardPosition()
    }
  },
  computed: {
    // One model per page, independent from the zoom.
    pageModels: function () {
      const models = []
      this.elements.forEach((element) => {
        if (element.section !== 'Teachers') return
        const points = pagePoints(element.addresses)
        if (!points.length) return
        const roles = normalizeRoles(element)
        models.push({ element, points, roles, colors: roleColors(roles) })
      })
      return models
    },
    layout: function () {
      const clustered = []
      const free = []
      this.elements.forEach((element) => {
        if (element.section !== 'Events' || !element.location) return
        const lat = Number(element.location.latitude)
        const lng = Number(element.location.longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
        clustered.push({
          key: `event-${element.id}-${lat}-${lng}`,
          sourceLat: lat,
          sourceLng: lng,
          lat,
          lng,
          name: element.name,
          title: element.name,
          cancelled: element.cancelled,
          type: element.type,
          logo: element.logo,
          organizer: element.organizer,
          from: element.from,
          to: element.to,
          address: element.address,
          city: element.city,
          section: element.section,
          icon: ICONS.EVENT
        })
      })
      this.pageModels.forEach((model) => {
        const { element, points, roles, colors } = model
        const common = {
          pageId: element.id,
          slug: element.slug,
          name: element.name,
          title: element.name,
          picture: element.picture,
          logo: element.logo,
          section: element.section,
          contact: element.contact,
          clubName: element.clubName,
          type: element.type,
          types: element.types,
          categories: element.categories,
          roles,
          addressCount: points.length
        }
        const pinIconUrl = roles.length > 1
          ? cached('multi:' + colors.join(','), () => multiRolePinIcon(colors))
          : ICONS[primaryRole(element.type)]
        const expanded = points.length > 1 && (this.expandedPageId === element.id || this.separated[element.id])
        if (points.length === 1 || expanded) {
          points.forEach((point) => {
            const marker = {
              ...common,
              key: `page-${element.id}-pin-${point.addressIndex}`,
              sourceLat: point.lat,
              sourceLng: point.lng,
              lat: point.lat,
              lng: point.lng,
              city: point.city,
              postcode: point.postcode,
              icon: pinIconUrl
            }
            // a single-address page is a normal pin (clustered by proximity);
            // the pins of an expanded / separated page are always drawn
            ;(points.length === 1 ? clustered : free).push(marker)
          })
          return
        }
        const center = centroid(points)
        const imageUrl = element.logo || element.picture
        const imageDataUrl = imageUrl ? this.pageImages[imageUrl] : ''
        const url = cached(`page:${colors.join(',')}:${points.length}:${element.name}:${imageDataUrl ? imageUrl : ''}`,
          () => pageClusterIcon({ colors, count: points.length, name: element.name, imageDataUrl }))
        clustered.push({
          ...common,
          key: `page-${element.id}`,
          isPageCluster: true,
          points,
          places: points.map(placeText).filter(Boolean),
          title: `${element.name} · ${points.length} addresses`,
          sourceLat: center.lat,
          sourceLng: center.lng,
          lat: center.lat,
          lng: center.lng,
          icon: {
            url,
            scaledSize: { width: CLUSTER_ICON_SIZE, height: CLUSTER_ICON_SIZE },
            anchor: { x: CLUSTER_ICON_SIZE / 2, y: CLUSTER_ICON_SIZE / 2 }
          }
        })
      })
      // coincident markers (any kind) are spread on a ring from zoom 13
      spreadSharedPins(clustered.concat(free), this.spiderZoom)
      return { clustered, free }
    },
    clusterMarkers: function () {
      return this.layout.clustered
    },
    freeMarkers: function () {
      return this.layout.free
    },
    legendMode: function () {
      if (this.$route && this.$route.name === 'Events') return 'events'
      return 'teachers'
    },
    webpagelink: function () {
      return (item) => {
        if (item.contact && item.contact.link) {
          const link = String(item.contact.link).trim()
          if (/^javascript:/i.test(link)) return ''
          if (link.startsWith('http://') || link.startsWith('https://')) {
            return link
          }
          return 'https://' + link
        }
        return ''
      }
    }
  },
  mounted () {
    this.updateViewport()
    window.addEventListener('resize', this.updateViewport)
    this.panToBounds()
    this.watchMapZoom()
    this.loadPageImages()
  },
  destroyed () {
    window.removeEventListener('resize', this.updateViewport)
    this.clearZoomListener()
  },
  methods: {
    updateViewport () {
      const mobile = window.innerWidth < 768
      if (mobile !== this.isMobile) {
        this.closePopup()
      }
      this.isMobile = mobile
    },
    escapeHtml,
    roleLabel (type) {
      return ROLE_LABELS[primaryRole(type)]
    },
    profileLink (item) {
      if (item.section === 'Events') return ''
      return profileUrl(item.slug, item.pageId)
    },
    popupMarkup (item) {
      const esc = this.escapeHtml
      const name = esc(item.name || '')
      const isEvent = item.section === 'Events'
      const cancelled = isEvent && item.cancelled
      let role
      let barColors
      if (isEvent) {
        role = `<p class="ukata-role">${esc(item.type || 'Event')}</p>`
        barColors = [ROLE_COLORS.EVENT]
      } else {
        const roles = item.roles && item.roles.length ? item.roles : normalizeRoles(item)
        role = roleChipsHtml(roles, esc)
        barColors = roleColors(roles)
      }
      const ownPlace = isEvent
        ? [item.address, item.city].filter(Boolean).join(' · ')
        : [item.city, item.postcode].filter(Boolean).join(' · ')
      const places = item.places && item.places.length ? item.places : [ownPlace]
      const lines = places.filter(Boolean).map(esc)
      if (isEvent) {
        if (item.from) lines.push(`${esc(item.from)} – ${esc(item.to || '')}`)
        if (item.organizer) lines.push(esc(item.organizer))
      } else if (item.clubName && item.clubName.trim().toLowerCase() !== String(item.name || '').trim().toLowerCase()) {
        lines.push(esc(item.clubName))
      }
      if (!isEvent && item.contact && item.contact.phone) {
        lines.push(esc(item.contact.phone))
      }
      const links = []
      if (!isEvent && item.contact) {
        if (item.contact.email) {
          links.push(`<a href="mailto:${esc(item.contact.email)}">Email</a>`)
        }
        const web = this.webpagelink(item)
        if (web) {
          links.push(`<a href="${esc(web)}" target="_blank" rel="noopener noreferrer">Website</a>`)
        }
      }
      const img = item.logo || item.picture
      const avatar = img
        ? `<img class="ukata-avatar" src="${esc(img)}" alt="">`
        : '<div class="ukata-avatar ukata-avatar--empty" aria-hidden="true"></div>'
      const meta = lines.map((line) => `<p class="ukata-meta">${line}</p>`).join('')
      const linkRow = links.length ? `<p class="ukata-links">${links.join(' · ')}</p>` : ''
      let title = cancelled ? `${name} <span class="ukata-cancelled">Cancelled</span>` : name
      const profile = this.profileLink(item)
      if (profile) {
        const href = esc(profile)
        const label = esc(`Open ${item.name || 'profile'} on Points of Tango`)
        title = `<a class="ukata-name" href="${href}" target="_blank" rel="noopener noreferrer">${name}</a> <a class="ukata-open" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">${OPEN_ICON_SVG}</a>`
      }
      const bar = `<div class="ukata-popup-bar" style="background:${esc(topBarBackground(barColors))}"></div>`
      return `<div class="ukata-popup">${bar}<div class="ukata-popup-body">${avatar}<div class="ukata-popup-copy"><h3>${title}</h3>${role}${meta}${linkRow}</div></div></div>`
    },
    closePopup () {
      this.infoWindowOpen = false
      this.sheetOpen = false
      this.activeItem = null
      this.currentKey = null
      this.expandedPageId = null
    },
    /**
     * Always frame the same Great Britain box. Marker bounds used to
     * zoom the map onto whatever the current filter returned.
     */
    panToBounds () {
      if (!this.$refs.mapRef) return
      this.$refs.mapRef.$mapPromise.then((map) => {
        // eslint-disable-next-line
        const swPoint = new google.maps.LatLng(GBR_BOUNDS.sw.lat, GBR_BOUNDS.sw.lng)
        // eslint-disable-next-line
        const nePoint = new google.maps.LatLng(GBR_BOUNDS.ne.lat, GBR_BOUNDS.ne.lng)
        // eslint-disable-next-line
        map.fitBounds(new google.maps.LatLngBounds(swPoint, nePoint))
      })
    },
    watchMapZoom () {
      if (!this.$refs.mapRef) return
      this.$refs.mapRef.$mapPromise.then((map) => {
        this.spiderZoom = map.getZoom()
        this.mapZoom = map.getZoom()
        this.recomputeSeparation(this.mapZoom)
        this.clearZoomListener()
        // eslint-disable-next-line
        this._zoomListener = google.maps.event.addListener(map, 'zoom_changed', () => {
          const zoom = map.getZoom()
          clearTimeout(this._spiderTimer)
          this._spiderTimer = setTimeout(() => {
            this.mapZoom = zoom
            this.recomputeSeparation(zoom)
            const wasSpread = this.spiderZoom >= SPIDER_FROM_ZOOM
            const spreadNow = zoom >= SPIDER_FROM_ZOOM
            if (!wasSpread && !spreadNow) return
            if (zoom !== this.spiderZoom) this.spiderZoom = zoom
          }, 80)
        })
      })
    },
    clearZoomListener () {
      clearTimeout(this._spiderTimer)
      if (!this._zoomListener) return
      // eslint-disable-next-line
      google.maps.event.removeListener(this._zoomListener)
      this._zoomListener = null
    },
    // Pages whose addresses no longer overlap on screen show their real pins.
    // Only replaces `separated` when the set changes, so most zoom ticks do not
    // touch the markers.
    recomputeSeparation (zoom) {
      const next = {}
      this.pageModels.forEach((model) => {
        if (model.points.length > 1 && isSeparated(model.points, zoom)) next[model.element.id] = true
      })
      const sig = (obj) => Object.keys(obj).sort().join('|')
      if (sig(next) !== sig(this.separated)) this.separated = next
    },
    // Logos/pictures of multi-address pages for the page-cluster icon.
    loadPageImages () {
      if (!this._imagesAsked) this._imagesAsked = {}
      this.pageModels.forEach((model) => {
        const url = model.element.logo || model.element.picture
        if (model.points.length < 2 || !url || this._imagesAsked[url]) return
        this._imagesAsked[url] = true
        loadImageDataUrl(url).then((dataUrl) => {
          if (dataUrl && !this._isDestroyed) this.$set(this.pageImages, url, dataUrl)
        })
      })
    },
    syncOpenCardPosition () {
      if (!this.activeItem) return
      const marker = this.layout.clustered.concat(this.layout.free).find((item) => item.key === this.activeItem.key)
      if (!marker) return
      this.activeItem = marker
      this.infoWindowPos = { lat: marker.lat, lng: marker.lng }
      if (!this.isMobile && this.infoWindowOpen) {
        this.infoOptions = {
          ...this.infoOptions,
          content: this.popupMarkup(marker)
        }
      }
    },
    onMarkerClick (item) {
      if (item.isPageCluster) {
        this.expandPage(item)
        return
      }
      // clicking anything outside the expanded page collapses it
      if (this.expandedPageId != null && item.pageId !== this.expandedPageId) {
        this.expandedPageId = null
      }
      this.toggleInfoWindow(item)
    },
    // A page cluster does not zoom like the geographic one: it shows the real
    // pins of that page and opens its card. Close/coincident addresses end up
    // above zoom 13, where the spider ring separates them.
    expandPage (item) {
      this.expandedPageId = item.pageId
      this.openCard(item)
      if (!this.$refs.mapRef) return
      this.$refs.mapRef.$mapPromise.then((map) => {
        // eslint-disable-next-line
        const bounds = new google.maps.LatLngBounds()
        // eslint-disable-next-line
        item.points.forEach((point) => bounds.extend(new google.maps.LatLng(point.lat, point.lng)))
        // eslint-disable-next-line
        google.maps.event.addListenerOnce(map, 'idle', () => {
          if (map.getZoom() > MAX_EXPAND_ZOOM) map.setZoom(MAX_EXPAND_ZOOM)
        })
        map.fitBounds(bounds, { top: 70, right: 60, left: 60, bottom: this.isMobile ? 260 : 60 })
      })
    },
    openCard (item) {
      this.activeItem = item
      this.currentKey = item.key
      this.infoWindowPos = { lat: item.lat, lng: item.lng }
      if (this.isMobile) {
        this.infoWindowOpen = false
        this.sheetOpen = true
        return
      }
      this.sheetOpen = false
      this.infoOptions = {
        ...this.infoOptions,
        content: this.popupMarkup(item)
      }
      this.infoWindowOpen = true
    },
    toggleInfoWindow (item) {
      if (this.currentKey === item.key && (this.infoWindowOpen || this.sheetOpen)) {
        this.closePopup()
        return
      }
      this.openCard(item)
    }
  }
}
</script>

<style>
#map {
  padding: 0 0 8px;
}

.map-frame {
  position: relative;
  height: 560px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #E8E6E6;
  background: #E1EFF2;
}

#map .vue-map-container {
  width: 100%;
  height: 100%;
}

.map-legend {
  position: absolute;
  left: 16px;
  bottom: 16px;
  z-index: 4;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #191919;
  text-align: left;
}

.map-legend div {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

.swatch {
  width: 12px;
  height: 16px;
  border-radius: 8px 8px 8px 2px;
  display: inline-block;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

.swatch--cluster {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #191919;
  border: 2px solid #fff;
}

.swatch--page {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: conic-gradient(#C2410C 0 33.3%, #8900A0 0 66.6%, #D61F26 0);
  -webkit-mask: radial-gradient(circle, transparent 4px, #000 4.5px);
  mask: radial-gradient(circle, transparent 4px, #000 4.5px);
}

.map-sheet {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  z-index: 6;
  text-align: left;
}

.map-sheet .ukata-popup {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
}

.ukata-popup {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  text-align: left;
  font-family: 'Open Sans', sans-serif;
  color: #191919;
  max-width: 340px;
}

.ukata-popup-bar {
  height: 6px;
  background: #191919; /* overridden inline with the role color(s) of the page */
}

.ukata-popup-body {
  display: flex;
  gap: 12px;
  padding: 14px 36px 16px 16px;
}

.ukata-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex: none;
  border: 2px solid #FBC020;
  background: #ddd;
}

.ukata-avatar--empty {
  background: #1B82C5;
}

.ukata-popup-copy h3 {
  margin: 0 0 2px;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #191919;
  line-height: 1.3;
}

.ukata-role {
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  color: #1B82C5;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ukata-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 2px 0 6px;
}

.ukata-chip {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 999px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.ukata-popup-copy h3 a {
  color: inherit;
  text-decoration: none;
}

.ukata-popup-copy h3 a.ukata-name:hover {
  text-decoration: underline;
}

.ukata-popup-copy h3 a.ukata-open {
  display: inline-block;
  margin-left: 2px;
  color: #585858;
  vertical-align: baseline;
}

.ukata-popup-copy h3 a.ukata-open:hover,
.ukata-popup-copy h3 a.ukata-open:focus {
  color: #191919;
}

.ukata-meta {
  margin: 0 0 3px;
  font-size: 13px;
  color: #585858;
}

.ukata-links {
  margin: 4px 0 0;
  font-size: 13px;
}

.ukata-links a {
  color: #1B82C5;
  font-weight: 600;
  text-decoration: none;
}

.ukata-links a:hover {
  color: #156A9F;
  text-decoration: underline;
}

.ukata-cancelled {
  color: #607980;
  font-weight: 600;
  font-size: 13px;
}

.ukata-popup-close {
  position: absolute;
  top: 14px;
  right: 10px;
  z-index: 2;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  background: #F0F7F9;
  color: #191919;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.gm-style .gm-style-iw-c {
  padding: 0 !important;
  border-radius: 14px !important;
  background: #fff !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22) !important;
}

.gm-style .gm-style-iw-d {
  overflow: auto !important;
  padding: 0 !important;
  max-height: 320px !important;
}

.gm-style .gm-style-iw-chr {
  position: absolute;
  top: 8px;
  right: 6px;
  z-index: 2;
  height: auto;
}

.gm-style .gm-style-iw-tc::after,
.gm-style-iw-t::after {
  background: #fff !important;
}

.gm-style button.gm-ui-hover-effect {
  width: 28px !important;
  height: 28px !important;
  border-radius: 50% !important;
  background-color: #F0F7F9 !important;
  opacity: 1 !important;
}

.gm-style-iw-t {
  right: 0;
  bottom: 40px !important;
}

#map.is-mobile .map-frame {
  height: 70vh;
  min-height: 420px;
  border-radius: 0;
  border-left: 0;
  border-right: 0;
}

#map.is-mobile .map-legend {
  left: 8px;
  bottom: 8px;
  font-size: 11px;
  padding: 8px;
}

#map.is-mobile .ukata-popup {
  max-width: none;
}
</style>
