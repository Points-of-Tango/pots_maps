<template>
  <div id="map">
    <GmapMap
      id="mapId"
      ref="mapRef"
      :center="center"
      :zoom="zoomLevel"
      style="width: 80%; height: 700px; margin: auto;"
    >
      <gmap-marker
        v-for="(m, index) in markers"
        :key="index"
        ref="marker"
        :position="m"
        :clickable="true"
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
      center: { lat: 51.5060031, lng: -0.1003099 },
      address: [],
      currentPlace: null,
      zoomLevel: 7
    }
  },
  watch: {
    elements: function (newVal, oldVal) {
      this.panToFirstMarker()
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
          element.addresses.forEach((address) => {
            const marker = {
              name: element.name,
              picture: element.picture,
              section: element.section,
              contact: element.contact,
              lat: address.location.latitude,
              lng: address.location.longitude,
              city: address.city,
              postcode: address.postCode
            }
            markers.push(marker)
          })
        }
      })
      return markers
    }
  },
  mounted () {
    this.panToFirstMarker()
  },
  methods: {
    panToFirstMarker () {
      this.$refs.mapRef.$mapPromise.then((map) => {
        map.panTo({
          lat: this.markers[0].lat,
          lng: this.markers[0].lng
        })
        this.center = {
          lat: this.markers[0].lat,
          lng: this.markers[0].lng
        }
      })
    },
    toggleInfoWindow (item, index) {
      this.zoomLevel = 13
      this.center = {
        lat: item.lat,
        lng: item.lng
      }

      if (item.section === 'Events') {
        this.infoOptions.content = `
        <div class="card border-0 pr-4">
          <div class="card-body">
            <div style="float: left;" class="mr-3">
              ${item.logo === undefined ? '<div/>' : `<img src=${item.logo} width="80" height="80" class="rounded-circle">`}
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
              ${item.picture === undefined ? '<div/>' : `<img src=${item.picture} width="80" height="80" class="rounded-circle">`}
            </div>
            <div style="float: left;">
                <h6 class="font-weight-bold"> ${item.name}</h6>
                <p class="font-weight-bold"> <a target="_blank" style="color: white; text-decoration:underline" href="mailto:${item.contact.email}">${item.contact.email}</a></p>
                <p class="font-weight-bold"> <a target="_blank" style="color: white; text-decoration:underline" href="${item.contact.link}">${item.contact.link}</a></p>
                <p> ${item.contact.phone === undefined ? '' : item.contact.phone}</p>
                <p> ${item.postcode} </p>
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
</style>
