<template>
  <div id="body">
    <b-overlay
      :show="isLoading"
      no-wrap
    />
    <data-selection
      :filtered="filtered"
      :is-region-selected="selectedRegion.length > 0 ? true : false"
      @getEvents="getEvents"
      @getTeachers="getTeachers"
      @getEventsFilter="getEventsFilter"
      @updateRegion="updateRegion"
      @removeFilterState="removeFilterState"
    />
    <b-container fluid>
      <h2
        v-if="disableView && !filtered"
        style="color: #660404; font-style: italic"
        class="text-center"
      >
        Please select your region.
      </h2>
      <b-tabs v-model="tabIndex">
        <b-tab
          title="List View"
          :active="tabActive"
          lazy
        >
          <events-list
            v-if="$route.name === 'Events' || $route.name === 'Home'"
            :events="events"
            :selected-region="region"
          />
          <teachers-list
            v-else-if="$route.name === 'Teachers'"
            :teachers="teachers"
            :selected-region="region"
          />
        </b-tab>
        <b-tab
          title="Map View"
          :disabled="disableView"
          lazy
        >
          <google-map-view :location="events.length > 0 ? events : teachers" />
        </b-tab>
      </b-tabs>
    </b-container>
  </div>
</template>

<script>
import EventsList from '@/views/EventsList.vue'
import axios from '@/axios'
import DataSelection from '@/components/DataSelection.vue'

export default {
  components: {
    EventsList,
    DataSelection,
    GoogleMapView: () => import(/* webpackChunkName: "google-map" */'@/components/GoogleMap.vue'),
    TeachersList: () => import(/* webpackChunkName: "teachers-list" */'@/views/TeachersList.vue')
  },
  data () {
    const now = new Date()
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    return {
      tabIndex: 0,
      min: today,
      isLoading: false,
      events: [],
      teachers: [],
      tabActive: false,
      filtered: false,
      cityFilter: null,
      typeSelectedFilter: null,
      dateFromFilter: null,
      selectedRegion: '',
      region: null,
      sortedRegion: [
        { key: 'ENG_E', text: 'England - East' },
        { key: 'ENG_EML', text: 'England - East Midlands' },
        { key: 'ENG_GLN', text: 'England - Greater London' },
        { key: 'ENG_NE', text: 'England - North East' },
        { key: 'ENG_NW', text: 'England - North West' },
        { key: 'ENG_SE', text: 'England - South East' },
        { key: 'ENG_SW', text: 'England - South West' },
        { key: 'ENG_WML', text: 'England - West Midlands' },
        { key: 'ENG_YH', text: 'England - Yorkshire and the Humber' },
        { key: 'N_IRE', text: 'Northern Ireland' },
        { key: 'SCO', text: 'Scotland' },
        { key: 'WALES', text: 'Wales' },
        { key: 'ONLINE', text: 'UK - Online' }
      ]
    }
  },
  computed: {
    disableView () {
      if (this.events.length > 0) {
        return false
      }
      return this.teachers.length <= 0
    }
  },
  watch: {
    selectedRegion: function (newValue, oldValue) {
      this.getEvents(newValue)
    },
    '$route' () {
      this.teachers = []
      this.events = []
      this.tabIndex = 0
    }
  },
  created () {
    axios.interceptors.request.use(
      (successfulReq) => {
        this.isLoading = true
        return successfulReq
      },
      (error) => {
        this.isLoading = true
        return Promise.reject(error)
      }
    )

    axios.interceptors.response.use(
      (successRes) => {
        this.isLoading = false
        return successRes
      },
      (error) => {
        this.isLoading = false
        Promise.reject(error)
      }
    )
  },
  methods: {
    updateRegion (region) {
      this.region = region
    },
    removeFilterState (bool) {
      this.filtered = bool
    },
    isOneWord (string) {
      return string.length > 0 && string.split('\\s+').length === 1
    },
    getEventsFilter (evt) {
      this.isBusy = true
      this.events = []

      const body = {
        city: evt.cityFilter,
        from: new Date(evt.dateFromFilter).getTime() / 1000,
        types: evt.typeSelectedFilter
      }

      axios
        .post(`events/filter/ukata/GBR/${this.selectedRegion}`, body)
        .then((response) => {
          const dateFormatOptions = {
            month: '2-digit',
            day: '2-digit'
          }
          response.data.results.forEach((element) => {
            const timestampStarted =
              (element.from.seconds + element.from.nanos) * 1000
            const timestampEnded =
              (element.to.seconds + element.to.nanos) * 1000

            if (element.type === 'MILONGA_CLASS') {
              element.type = 'Milonga & Class/Workshop'
            }
            if (element.type === 'PRACTICA_CLASS') {
              element.type = 'Practica & Class/Workshop'
            }
            if (element.type === 'FESTIVAL_MARATHON') {
              element.type = 'Festival / Marathon'
            }
            if (element.type === 'FESTIVAL_CHAMPIONSHIP') {
              element.type = 'Festival / Championship'
            }

            if (this.isOneWord(element.type)) {
              element.type =
                element.type.charAt(0).toUpperCase() +
                element.type.slice(1).toLowerCase()
            }

            // logoUrl, name, from - to, city, address & postCode, type, associationName
            this.events.push({
              id: element.id,
              country: element.country,
              cancelled: element.cancelled,
              logo: element.logoUrl,
              name: element.name,
              organizer: element.associationName,
              from: `${new Date(timestampStarted).toLocaleString(
                'en-GB',
                dateFormatOptions
              )} at ${new Date(timestampStarted).toLocaleString(
                'en-GB',
                {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false
                }
              )}`,
              to: `${new Date(timestampEnded).toLocaleString(
                'en-GB',
                dateFormatOptions
              )} at ${new Date(timestampEnded).toLocaleString(
                'en-GB',
                {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: false
                }
              )}`,
              date: `From: ${new Date(
                timestampStarted
              ).toLocaleString(
                'en-GB',
                dateFormatOptions
              )} at ${new Date(timestampStarted).toLocaleString(
                'en-GB',
                {
                  hour: 'numeric',
                  minute: 'numeric'
                }
              )} - To: ${new Date(timestampEnded).toLocaleString(
                'en-GB',
                dateFormatOptions
              )} at ${new Date(timestampEnded).toLocaleString(
                'en-GB',
                {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true
                }
              )}`,
              address: `${element.address}`,
              type: element.type,
              city: element.city,
              postCode: element.postCode,
              location: element.location,
              keywords: element.keywords,
              section: 'Events'
            })
          })
        })
        .catch((error) => {
          this.events = []
          console.error(error)
        })
        .finally(() => {
          this.$root.$emit('bv::refresh::table', 'my-table')
          this.isBusy = false
          this.totalRows = this.events.length
          this.filtered = true
        })
    },
    async getTeachers (region) {
      this.isBusy = true
      this.teachers = []

      await axios
        .get(
          `pages/GBR/PROFESSIONAL?association=true&region=${region}`
        )
        .then((response) => {
          response.data.results.forEach((item) => {
            this.teachers.push({
              name: item.name,
              contact: {
                email: item.email,
                facebook: item.facebook,
                instagram: item.instagram,
                phone: item.phone
              },
              city: item.city,
              postcode: item.postCode,
              location: item.location,
              picture: item.coverUrl,
              section: 'Teachers'
            })
          })
        })
        .catch((error) => {
          this.teachers = []
          console.error(error)
        })
        .finally(() => {
          this.$root.$emit('bv::refresh::table', 'my-table')
          this.isBusy = false
          this.totalRows = this.teachers.length
        })
    },
    formatTimestampDate (timestamp) {
      const dateFormatOptions = {
        month: '2-digit',
        day: '2-digit'
      }
      return new Date(timestamp).toLocaleString(
        'en-GB',
        dateFormatOptions
      )
    },
    formatTimestampTime (timestamp) {
      const timeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }
      return new Date(timestamp).toLocaleString(
        'en-GB',
        timeFormatOptions
      )
    },
    async getEvents (region) {
      this.isBusy = true
      this.events = []

      await axios
        .get(`events/GBR/1?association=true&region=${region}`)
        .then((response) => {
          response.data.results.forEach((element) => {
            const timestampStarted =
              (element.from.seconds + element.from.nanos) * 1000
            const timestampEnded =
              (element.to.seconds + element.to.nanos) * 1000

            switch (element.type) {
              case 'MILONGA_CLASS':
                element.type = 'Milonga & Class/Workshop'
                break
              case 'PRACTICA_CLASS':
                element.type = 'Practica & Class/Workshop'
                break
              case 'FESTIVAL_MARATHON':
                element.type = 'Festival / Marathon'
                break
              case 'FESTIVAL_CHAMPIONSHIP':
                element.type = 'Festival / Championship'
                break
              default:
                break
            }

            if (this.isOneWord(element.type)) {
              element.type =
                element.type.charAt(0).toUpperCase() +
                element.type.slice(1).toLowerCase()
            }

            // logoUrl, name, from - to, city, address & postCode, type, associationName
            this.events.push({
              id: element.id,
              cancelled: element.cancelled,
              country: element.country,
              logo: element.logoUrl,
              name: element.name,
              organizer: element.associationName,
              from: `${this.formatTimestampDate(
                timestampStarted
              )} at ${this.formatTimestampTime(
                timestampStarted
              )}`,
              to: `${this.formatTimestampDate(
                timestampEnded
              )} at ${this.formatTimestampTime(timestampEnded)}`,
              date: `From: ${this.formatTimestampDate(
                timestampStarted
              )} at ${this.formatTimestampTime(
                timestampStarted
              )} - To: ${this.formatTimestampDate(
                timestampEnded
              )} at ${this.formatTimestampTime(timestampEnded)}`,
              address: `${element.address}`,
              type: element.type,
              city: element.city,
              postCode: element.postCode,
              location: element.location,
              section: 'Events'
            })
          })
        })
        .catch((error) => {
          this.events = []
          console.error(error)
        })
        .finally(() => {
          this.$root.$emit('bv::refresh::table', 'my-table')
          this.isBusy = false
          this.totalRows = this.events.length
        })
      this.isLoading = false
    }
  }
}
</script>

<style lang="scss">
td>h6 {
  font-weight: 700;
  font-size: 1.3em;
}

.table-hover tbody tr:hover {
  color: #212529;
  background-color: rgba(0, 0, 0, 0.36) !important;
}

li>a {
  color: #660404;

  &:hover {
    color: #660404;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
