<template>
  <div id="body">
    <b-overlay
      :show="isLoading"
      no-wrap
    />
    <data-selection
      @getEvents="getEvents"
      @getTeachers="getTeachers"
      @updateRegion="updateRegion"
    />
    <div class="map-toolbar">
      <b-tabs v-model="tabIndex">
        <b-tab title="Map View" lazy>
          <div class="search-row">
            <label for="filter-input">Search</label>
            <input
              id="filter-input"
              v-model="searchKeyword"
              type="search"
              placeholder="Name, club, city or postcode"
            >
            <button
              type="button"
              class="btn-clear"
              :disabled="!searchKeyword"
              @click="searchKeyword = ''"
            >
              Clear
            </button>
          </div>
          <google-map-view :elements="events.length ? filteredEvents : filteredTeachers" />
        </b-tab>
        <b-tab title="List View" lazy>
          <events-list v-if="$route.name === 'Events'"
            :events="events"
            :selected-region="region"/>
          <teachers-list v-else-if="$route.name === 'Teachers' || $route.name === 'Home'"
            :teachers="teachers"
            :selected-region="region"
          />
        </b-tab>
      </b-tabs>
    </div>
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
      region: null,
      searchKeyword: ''
    }
  },
  computed: {
    filteredTeachers () {
      return this.teachers.filter(
        (item) =>
          !this.searchKeyword ||
          this.isTrueThat(item.name).includes(this.searchKeyword) ||
          this.isTrueThat(item.contact?.email).includes(this.searchKeyword) ||
          this.isTrueThat(item.contact?.link).includes(this.searchKeyword) ||
          this.isTrueThat(item.addresses.reduce((acc, curr) => [acc, curr.postCode], []).join(', ')).includes(this.searchKeyword) ||
          this.isTrueThat(item.keywords).includes(this.searchKeyword) ||
          this.isTrueThat(item.addresses.reduce((acc, curr) => [acc, curr.city], []).join(', ')).includes(this.searchKeyword) ||
          this.isTrueThat(item.clubName).includes(this.searchKeyword)
      )
    },
    filteredEvents () {
      return this.events.filter(
        (item) =>
          !this.searchKeyword ||
          this.isTrueThat(item.name).includes(this.searchKeyword) ||
          this.isTrueThat(item.city).includes(this.searchKeyword) ||
          this.isTrueThat(item.address).includes(this.searchKeyword) ||
          this.isTrueThat(item.organizer).includes(this.searchKeyword) ||
          this.isTrueThat(item.postCode).includes(this.searchKeyword) ||
          this.isTrueThat(item.type).includes(this.searchKeyword)
      )
    }
  },
  watch: {
    '$route' () {
      this.teachers.length = []
      this.events.length = []
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
    isOneWord (string) {
      return string.length > 0 && string.split('\\s+').length === 1
    },

    async getTeachers (eventProps) {
      this.isBusy = true
      this.teachers.length = 0

      const params = {
        association: 'true'
      }
      if (eventProps.region !== 'ALL') {
        params.region = eventProps.region
      }
      try {
        const response = await axios.get(`pages/GBR/${eventProps.role}`, { params })
        if (response.data.responseCode === 200) {
          this.teachers.length = 0
          response.data.results?.forEach((item) => {
            this.teachers.push({
              id: item.id,
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
              clubName: item.associationName,
              picture: item.coverUrl,
              logo: item.logoUrl,
              section: 'Teachers',
              addresses: item.addresses,
              type: item.type
            })
          })
        } else {
          throw Error(response.data.message)
        }
      } catch (error) {
        this.teachers.length = 0
        console.error(error)
      }
      this.$root.$emit('bv::refresh::table', 'my-table')
      this.isBusy = false
      this.totalRows = this.teachers.length
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
      this.events.length = 0

      const params = {
        association: 'true'
      }
      if (region !== 'ALL') {
        params.region = region
      }
      await axios.get('events/GBR/1', { params })
        .then((response) => {
          console.log('Events: ', response.data.results.map((item) => item.name))
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
  color: #191919;
  background-color: #F0F7F9 !important;
}

.map-toolbar {
  padding: 16px 40px 24px;
}

.map-toolbar .nav-tabs .nav-link {
  border: 0;
  color: #1B82C5;
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  border-radius: 8px 8px 0 0;
  padding: 8px 18px;
}

.map-toolbar .nav-tabs .nav-link:hover {
  color: #156A9F;
}

.search-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 0 10px;
}

.search-row label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #607980;
}

.search-row input {
  flex: 0 0 420px;
  width: 420px;
  max-width: 100%;
  height: 38px;
  border: 1px solid #E8E6E6;
  border-radius: 8px;
  padding: 0 12px;
  background: #fff;
  color: #191919;
  font-family: 'Open Sans', sans-serif;
  font-size: 13.5px;
}

.search-row input::placeholder {
  color: #607980;
  opacity: 1;
}

.btn-clear {
  height: 38px;
  padding: 0 14px;
  border: 1px solid #E8E6E6;
  border-radius: 8px;
  background: #fff;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  color: #585858;
  cursor: pointer;
}

.btn-clear:disabled {
  opacity: 0.55;
  cursor: default;
}

#events-list a,
#teachers-list a {
  color: #1B82C5;
}

#events-list a:hover,
#teachers-list a:hover {
  color: #156A9F;
}

@media (max-width: 767px) {
  .map-toolbar {
    padding: 12px 0 0;
  }

  .map-toolbar .nav-tabs,
  .search-row {
    margin-left: 14px;
    margin-right: 14px;
  }

  .search-row {
    justify-content: stretch;
  }

  .search-row label {
    display: none;
  }

  .search-row input {
    width: auto;
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
