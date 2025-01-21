<template>
  <div id="map" class="map-container">
    <GmapMap
      id="mapId"
      ref="mapRef"
      :center="center"
      :zoom="zoomLevel"
      :options="{
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
      }"
      style="height: 700px;"
    >
      <gmap-marker
        v-for="(m, index) in markers"
        :key="index"
        ref="marker"
        :position="m"
        :clickable="true"
        :icon="m.icon || require('@/assets/marker-red.png')"
        @click="toggleInfoWindow(m, index)"
      />
      <gmap-info-window
        ref="infoWindow"
        :options="infoOptions"
        :position="infoWindowPos"
        :opened="infoWindowOpen"
        @closeclick="infoWindowOpen = false"
      />
    </GmapMap>
    <div class="map-icons-index">
      <!--<div>ORCHESTRA:
        <img class="map-icon-image" :src="require('@/assets/marker-yellow.png')"/>
      </div>-->
      <div>DJ:
        <img class="map-icon-image" :src="require('@/assets/marker-blue.png')" />
      </div>
      <div>Musician:
        <img class="map-icon-image" :src="require('@/assets/marker-green.png')" />
      </div>
      <div>Teachers:
        <img class="map-icon-image" :src="require('@/assets/marker-red.png')" />
      </div>
      <div>Tango club:
        <img class="map-icon-image" :src="require('@/assets/marker-purple.png')" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'GoogleMap',
  props: {
    elements: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      organizer: '',
      infoOptions: {
        content: '',
        pixelOffset: {
          width: 0,
          height: 0
        }
      },
      currentMidx: null,
      infoWindowPos: null,
      infoWindowOpen: false,
      center: { lat: 51.5060031, lng: -50.1003099 },
      address: [],
      currentPlace: null,
      zoomLevel: 7
    }
  },
  computed: {
    markers: function () {
      const markers = []
      this.elements.forEach((element) => {
        if (element.section === 'Events' && element.location) {
          markers.push({
            lat: element.location.latitude,
            lng: element.location.longitude,
            name: element.name,
            cancelled: element.cancelled,
            type: element.type,
            logo: element.logo,
            organizer: element.organizer,
            from: element.from,
            to: element.to,
            address: element.address,
            city: element.city,
            section: element.section
          })
        } else if (element.section === 'Teachers') {
          const iconsMap = {
            ORCHESTRA: require('@/assets/marker-yellow.png'),
            DJ: require('@/assets/marker-blue.png'),
            MUSICIAN: require('@/assets/marker-green.png'),
            PROFESSIONAL: require('@/assets/marker-red.png'),
            ORGANISER: require('@/assets/marker-purple.png')
          }
          element.addresses.forEach((address) => {
            const marker = {
              name: element.name,
              picture: element.picture,
              section: element.section,
              contact: element.contact,
              clubName: element.clubName,
              lat: address.location.latitude,
              lng: address.location.longitude,
              city: address.city,
              postcode: address.postCode,
              icon: iconsMap[element.type]
            }
            markers.push(marker)
          })
        }
      })
      return markers
    },
    bounds: function () {
      let maxLat = -90
      let minLat = 90
      let maxLng = -180
      let minLng = 180
      this.markers.forEach((m) => {
        if (m.lat > maxLat) {
          maxLat = m.lat
        }
        if (m.lat < minLat) {
          minLat = m.lat
        }
        if (m.lng > maxLng) {
          maxLng = m.lng
        }
        if (m.lng < minLng) {
          minLng = m.lng
        }
      })
      return {
        sw: {
          lat: minLat,
          lng: minLng
        },
        ne: {
          lat: maxLat,
          lng: maxLng
        }
      }
    },
    webpagelink: function () {
      return (item) => {
        if (item.contact && item.contact.link) {
          if (item.contact.link.startsWith('http://') || item.contact.link.startsWith('https://')) {
            return item.contact.link
          } else {
            return 'https://' + item.contact.link
          }
        } else {
          return ''
        }
      }
    }
  },
  mounted () {
    this.panToBounds()
  },
  methods: {
    /**
     * Is using bounds baased on the markers.
     * To set the bounds to GBR
     *   sw: lat: 50.060847, lng: -5.667927
     *   ne: lat: 56.493084, lng: 1.1675047
     */
    panToBounds () {
      this.$refs.mapRef.$mapPromise.then((map) => {
        // eslint-disable-next-line
        const swPoint = new google.maps.LatLng(this.bounds.sw.lat, this.bounds.sw.lng)
        // eslint-disable-next-line
        const nePoint = new google.maps.LatLng(this.bounds.ne.lat, this.bounds.ne.lng)
        // eslint-disable-next-line
        const bounds = new google.maps.LatLngBounds(swPoint, nePoint)
        map.fitBounds(bounds)
      })
    },
    toggleInfoWindow (item, index) {
      if (item.section === 'Events') {
        this.infoOptions.content = `
        <div class="card border-0 pr-4">
          <div class="card-body">
            <div style="float: left;" class="mr-3">
              ${item.logo === undefined ? '<div style="width: 80px; height: 80px; background-color: grey;" class="rounded-circle"></div>' : `<img src=${item.logo} width="80" height="80" class="rounded-circle">`}
            </div>
            <div style="float: left;">
                <h4 ${item.cancelled === false ? '' : 'class="cancelled text-muted"'}>${item.name}${item.cancelled === false ? '' : ' - CANCELLED'}</h4>
                <p class="font-weight-bold"> ${item.type}</p>
                <p class="font-weight-bold">${item.from} - ${item.to}</p>
                <h6>${item.organizer}</h6>
                <h6>${item.address} - ${item.city}</h6>
            </div>
          </div>
        </div>
      `
      } else {
        this.infoOptions.content = `
        <div class="card border-0 pr-4">
          <div class="card-body">
            <div style="float: left;" class="mr-3">
              ${item.picture === undefined ? '<div style="width: 80px; height: 80px; background-color: grey;" class="rounded-circle"></div>' : `<img src=${item.picture} width="80" height="80" class="rounded-circle">`}
            </div>
            <div style="float: left;">
                <h6 class="font-weight-bold"> ${item.name}</h6>
                <p class="font-weight-bold"> <a target="_blank" style="color: white; text-decoration:underline" href="mailto:${item.contact.email}">${item.contact.email}</a></p>
                <p class="font-weight-bold"> <a target="_blank" style="color: white; text-decoration:underline" href="${this.webpagelink(item)}">${item.contact.link}</a></p>
                <p> 📱 ${!item.contact.phone ? '----------' : item.contact.phone}</p>
                <p> 📪 ${item.postcode} </p>
                ${item.clubName ? `<p>${item.clubName} </p>` : ''}
            </div>
          </div>
        </div>
      `
      }

      this.infoWindowPos = item
      this.infoWindowOpen = true

      // check if it's the same marker that was selected if yes toggle
      if (this.currentMidx === index) {
        this.infoWindowOpen = !this.infoWindowOpen
        // eslint-disable-next-line brace-style
      }

      // if different marker set infowindow to open and reset current marker index
      else {
        this.infoWindowOpen = true
        this.currentMidx = index
      }
    },
    setPlace (place) {
      this.currentPlace = place
    },
    geolocate: function () {
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      })
    }
  }
}
</script>

<style>
.card,
.gm-style .gm-style-iw-c,
.gm-style-iw-t::after {
  background-color: #660404 !important;
  color: white;
}

.card {
  border: none !important;
}

.gm-style-iw-t {
  right: 0px;
  bottom: 55px !important;
}

.map-container {
  width: 100%;
  margin: auto;
}

.map-icons-index {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
  padding: 1rem 0;
  flex-wrap: wrap;
}

.map-icon-image {
  height: 25px;
  object-fit: cover;
}

@media only screen and (min-width: 768px) {
  .map-container {
    width: 80%;
    margin: 0 auto;
  }
}
</style>
