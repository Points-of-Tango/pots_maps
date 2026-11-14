<template>
  <div id="map" :class="{ 'is-mobile': isMobile }">
    <div class="map-frame">
      <GmapMap
        id="mapId"
        ref="mapRef"
        :center="center"
        :zoom="zoomLevel"
        style="width: 100%; height: 100%;"
      >
        <gmap-cluster
          :styles="clusterStyles"
          :zoom-on-click="true"
          :grid-size="60"
          :enable-retina-icons="true"
        >
          <gmap-marker
            v-for="(m, index) in markers"
            :key="m.key"
            ref="marker"
            :position="m"
            :clickable="true"
            :icon="m.icon"
            @click="toggleInfoWindow(m, index)"
          />
        </gmap-cluster>
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
          <div><span class="swatch" style="background:#1B82C5"></span> Events</div>
        </template>
        <template v-else>
          <div><span class="swatch" style="background:#1B82C5"></span> Teachers &amp; clubs</div>
          <div><span class="swatch" style="background:#FBC020"></span> DJs</div>
          <div><span class="swatch" style="background:#234951"></span> Musicians</div>
          <div><span class="swatch" style="background:#4793A3"></span> Orchestras</div>
        </template>
        <div><span class="swatch swatch--cluster"></span> Cluster</div>
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

const PIN_PATH = 'M13 34s10-9.6 10-18C23 8.6 18.6 4 13 4S3 8.6 3 16c0 8.4 10 18 10 18z'

function pinIcon (color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 26 36"><path d="${PIN_PATH}" fill="${color}" stroke="#ffffff" stroke-width="1.6"/><circle cx="13" cy="15" r="4.2" fill="#ffffff"/></svg>`
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

const ICONS = {
  PROFESSIONAL: pinIcon('#1B82C5'),
  DJ: pinIcon('#FBC020'),
  MUSICIAN: pinIcon('#234951'),
  ORCHESTRA: pinIcon('#4793A3'),
  EVENT: pinIcon('#1B82C5')
}

const ROLE_LABELS = {
  PROFESSIONAL: 'Teacher',
  DJ: 'DJ',
  MUSICIAN: 'Musician',
  ORCHESTRA: 'Orchestra'
}

function clusterIconUrl () {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#1B82C5" stroke="#ffffff" stroke-width="2"/></svg>'
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

const UK_CENTER = { lat: 54.5, lng: -3.5 }

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
        url: clusterIconUrl(),
        width: 40,
        height: 40,
        textColor: '#ffffff',
        textSize: 13,
        fontWeight: '700',
        fontFamily: 'Open Sans, sans-serif'
      }],
      currentMidx: null,
      infoWindowPos: null,
      infoWindowOpen: false,
      sheetOpen: false,
      activeItem: null,
      isMobile: false,
      center: { ...UK_CENTER },
      zoomLevel: 6
    }
  },
  watch: {
    elements: function () {
      this.closePopup()
      this.panToBounds()
    }
  },
  computed: {
    markers: function () {
      const markers = []
      this.elements.forEach((element) => {
        if (element.section === 'Events' && element.location) {
          const lat = Number(element.location.latitude)
          const lng = Number(element.location.longitude)
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
          markers.push({
            key: `event-${element.id}-${lat}-${lng}`,
            lat,
            lng,
            name: element.name,
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
        } else if (element.section === 'Teachers') {
          (element.addresses || []).forEach((address, addressIndex) => {
            if (!address || !address.location) return
            const lat = Number(address.location.latitude)
            const lng = Number(address.location.longitude)
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
            markers.push({
              key: `teacher-${element.id}-${addressIndex}-${lat}-${lng}`,
              name: element.name,
              picture: element.picture,
              logo: element.logo,
              section: element.section,
              contact: element.contact,
              clubName: element.clubName,
              type: element.type,
              lat,
              lng,
              city: address.city,
              postcode: address.postCode,
              icon: ICONS[element.type] || ICONS.PROFESSIONAL
            })
          })
        }
      })
      return markers
    },
    legendMode: function () {
      if (this.$route && this.$route.name === 'Events') return 'events'
      return 'teachers'
    },
    bounds: function () {
      let maxLat = -90
      let minLat = 90
      let maxLng = -180
      let minLng = 180
      this.markers.forEach((m) => {
        if (m.lat > maxLat) maxLat = m.lat
        if (m.lat < minLat) minLat = m.lat
        if (m.lng > maxLng) maxLng = m.lng
        if (m.lng < minLng) minLng = m.lng
      })
      return {
        sw: { lat: minLat, lng: minLng },
        ne: { lat: maxLat, lng: maxLng }
      }
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
  },
  destroyed () {
    window.removeEventListener('resize', this.updateViewport)
  },
  methods: {
    updateViewport () {
      const mobile = window.innerWidth < 768
      if (mobile !== this.isMobile) {
        this.closePopup()
      }
      this.isMobile = mobile
    },
    escapeHtml (value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
    },
    roleLabel (type) {
      return ROLE_LABELS[type] || 'Teacher'
    },
    popupMarkup (item) {
      const esc = this.escapeHtml
      const name = esc(item.name || '')
      const cancelled = item.section === 'Events' && item.cancelled
      const role = item.section === 'Events'
        ? esc(item.type || 'Event')
        : esc(this.roleLabel(item.type))
      const place = item.section === 'Events'
        ? [item.address, item.city].filter(Boolean).join(' · ')
        : [item.city, item.postcode].filter(Boolean).join(' · ')
      const lines = []
      if (place) lines.push(esc(place))
      if (item.section === 'Events') {
        if (item.from) lines.push(`${esc(item.from)} – ${esc(item.to || '')}`)
        if (item.organizer) lines.push(esc(item.organizer))
      } else if (item.clubName && item.clubName.trim().toLowerCase() !== String(item.name || '').trim().toLowerCase()) {
        lines.push(esc(item.clubName))
      }
      if (item.section !== 'Events' && item.contact && item.contact.phone) {
        lines.push(esc(item.contact.phone))
      }
      const links = []
      if (item.section !== 'Events' && item.contact) {
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
      const title = cancelled ? `${name} <span class="ukata-cancelled">Cancelled</span>` : name
      return `<div class="ukata-popup"><div class="ukata-popup-bar"></div><div class="ukata-popup-body">${avatar}<div class="ukata-popup-copy"><h3>${title}</h3><p class="ukata-role">${role}</p>${meta}${linkRow}</div></div></div>`
    },
    closePopup () {
      this.infoWindowOpen = false
      this.sheetOpen = false
      this.activeItem = null
      this.currentMidx = null
    },
    /**
     * Fits the map to the markers. Default view is the UK;
     * the previous centre sat in the Atlantic (lng -50) until fitBounds ran.
     */
    panToBounds () {
      if (!this.$refs.mapRef) return
      this.$refs.mapRef.$mapPromise.then((map) => {
        if (!this.markers.length) {
          this.center = { ...UK_CENTER }
          this.zoomLevel = 6
          map.setCenter(this.center)
          map.setZoom(6)
          return
        }
        // eslint-disable-next-line
        const swPoint = new google.maps.LatLng(this.bounds.sw.lat, this.bounds.sw.lng)
        // eslint-disable-next-line
        const nePoint = new google.maps.LatLng(this.bounds.ne.lat, this.bounds.ne.lng)
        // eslint-disable-next-line
        const bounds = new google.maps.LatLngBounds(swPoint, nePoint)
        map.fitBounds(bounds, { top: 48, right: 48, bottom: 56, left: 48 })
        // eslint-disable-next-line
        google.maps.event.addListenerOnce(map, 'idle', () => {
          if (map.getZoom() > 13) map.setZoom(13)
        })
      })
    },
    toggleInfoWindow (item, index) {
      this.zoomLevel = 13
      this.center = {
        lat: item.lat,
        lng: item.lng
      }
      const sameMarker = this.currentMidx === index
      if (sameMarker && (this.infoWindowOpen || this.sheetOpen)) {
        this.closePopup()
        return
      }
      this.activeItem = item
      this.currentMidx = index
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
  background: #1B82C5;
  border: 2px solid #fff;
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
  background: #1B82C5;
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
