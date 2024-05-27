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
      @updateRegion="updateRegion"
      @removeFilterState="removeFilterState"
    />
    <b-container fluid>
      <b-tabs v-model="tabIndex">
        <b-tab
          title="List View"
          :active="tabActive"
          lazy
        >
          <events-list
            v-if="$route.name === 'Events'"
            :events="events"
            :selected-region="region"
          />
          <teachers-list
            v-else-if="$route.name === 'Teachers' || $route.name === 'Home'"
            :teachers="teachers"
            :selected-region="region"
          />
        </b-tab>
        <b-tab
          title="Map View"
          :disabled="disableView"
          lazy
        >
        <b-row v-if="!events.length" align-h="end">
          <b-col
            lg="12"
            align-self="end"
          >
            <b-form-group
              label="Search"
              label-for="filter-input"
              label-cols-sm="3"
              label-align-sm="right"
              class="my-3"
            >
              <b-input-group>
                <b-form-input
                  id="filter-input"
                  v-model="searchKeyword"
                  type="search"
                  placeholder="Type to search by name, contact, city, or postcode"
                />
                <b-input-group-append>
                  <b-button
                    :disabled="!searchKeyword"
                    @click="searchKeyword = ''"
                  >
                    Clear
                  </b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
          </b-col>
        </b-row>
          <google-map-view :elements="events.length ? events : filteredTeachers" />
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
    return {
      tabIndex: 0,
      isLoading: false,
      events: [],
      teachers: [],
      tabActive: false,
      filtered: false,
      selectedRegion: '',
      region: null,
      searchKeyword: ''
    }
  },
  computed: {
    disableView () {
      if (this.events.length > 0) {
        return false
      }
      return this.teachers.length <= 0
    },
    filteredTeachers () {
      return this.teachers.filter(
        (item) =>
          !this.searchKeyword ||
          this.isTrueThat(item.name).includes(this.searchKeyword) ||
          this.isTrueThat(item.contact?.email).includes(this.searchKeyword) ||
          this.isTrueThat(item.contact?.link).includes(this.searchKeyword) ||
          this.isTrueThat(item.addresses.reduce((acc, curr) => [acc, curr.postCode], []).join(', ')).includes(this.searchKeyword) ||
          this.isTrueThat(item.keywords).includes(this.searchKeyword) ||
          this.isTrueThat(item.addresses.reduce((acc, curr) => [acc, curr.city], []).join(', ')).includes(this.searchKeyword)
      )
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
    isTrueThat (value) {
      value = (value || '').toLowerCase()
      return {
        includes: (key) => {
          key = (key || '').toLowerCase()
          return key && value.includes(key)
        }
      }
    },
    updateRegion (region) {
      this.region = region
    },
    removeFilterState (bool) {
      this.filtered = bool
    },
    isOneWord (string) {
      return string.length > 0 && string.split('\\s+').length === 1
    },

    async getTeachers (region) {
      this.isBusy = true
      this.teachers = []

      const params = {
        association: 'true'
      }
      if (region !== 'ALL') {
        params.region = region
      }
      await axios.get('pages/GBR/PROFESSIONAL', { params })
        .then((response) => {
          response.data.results.forEach((item) => {
            this.teachers.push({
              name: item.name,
              contact: {
                email: item.email,
                facebook: item.facebook,
                instagram: item.instagram,
                link: item.link,
                phone: item.phone
              },
              keywords: item.keywords,
              city: item.city,
              postcode: item.postCode,
              location: item.location,
              picture: item.coverUrl,
              logo: item.logoUrl,
              section: 'Teachers',
              addresses: item.addresses
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

      const params = {
        association: 'true'
      }
      if (region !== 'ALL') {
        params.region = region
      }
      await axios.get('events/GBR/1', { params })
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
