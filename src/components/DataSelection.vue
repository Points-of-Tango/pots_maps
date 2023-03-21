<template>
  <div id="selection">
    <h1
      class="display-3 text-center"
      style="color: rgba(102, 4, 4, 0.9) !important"
    >
      UK Tango Map
    </h1>
    <div
      v-if="$isMobile"
      class="is-mobile"
    >
      <b-container>
        <b-row class="my-2">
          <b-col class="d-flex justify-content-center">
            <b-form-select v-model="selectedRegion" class="w-100">
              <template #first>
                <b-form-select-option
                  disabled
                >
                  Select region
                </b-form-select-option>
              </template>
              <b-form-select-option
                v-for="(value, index) in sortedRegion"
                :key="index"
                :value="value.key"
              >
                {{ value.text }}
              </b-form-select-option>
            </b-form-select>
          </b-col>
        </b-row>
        <!-- <hr class="separator">
        <b-row class="my-2">
          <b-col
            col
            class="d-flex justify-content-center"
          >
            <multiselect
              v-model="typeSelectedFilter"
              :multiple="true"
              placeholder="Select Type"
              :options="options"
              :disabled="!selectedRegion"
            />
          </b-col>
        </b-row>
        <b-row class="my-2">
          <b-col
            sm="12"
            md="6"
            class="d-flex justify-content-center my-2"
          >
            <b-form-datepicker
              id="example-datepicker"
              v-model="dateFromFilter"
              reset-button
              :min="min"
              placeholder="Select Date"
            />
          </b-col>
          <b-col
            sm="12"
            md="6"
            class="d-flex justify-content-center my-2"
          >
            <b-input-group>
              <b-form-input
                v-model="cityFilter"
                placeholder="Enter city"
              />
              <b-input-group-append
                style="cursor: pointer"
                @click="clearCityFilter"
              >
                <b-input-group-text>
                  <b-icon-x />
                </b-input-group-text>
              </b-input-group-append>
            </b-input-group>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col
            lg="6"
            sm="6"
            md="6"
            xl="auto"
            class="d-flex justify-content-center my-2"
          >
            <b-button
              style="width: 100%"
              :disabled="!regionIsSelected"
              variant="light"
              @click="applyFilter()"
            >
              <b-icon-filter />Filter
            </b-button>
          </b-col>
          <b-col
            lg="6"
            sm="6"
            md="6"
            xl="auto"
            class="d-flex justify-content-center my-2"
          >
            <b-button
              style="width: 100%"
              variant="light"
              @click="clearFilter()"
            >
              Clear Filter
            </b-button>
          </b-col>
        </b-row> -->
        <hr class="separator">
      </b-container>
    </div>
    <div
      v-else
      class="is-tablet"
    >
      <b-container
        fluid="xl"
        class="my-5"
      >
        <b-row class="my-3">
          <b-col class="d-flex justify-content-center">
            <b-form-select
              v-model="selectedRegion"
              :class="isMobile ? 'w-100': 'w-25'"
              class="mx-2"
            >
              <template #first>
                <b-form-select-option
                  value=""
                  disabled
                >
                  Select region
                </b-form-select-option>
              </template>
              <b-form-select-option
                v-for="(value, index) in sortedRegion"
                :key="index"
                :value="value.key"
              >
                {{ value.text }}
              </b-form-select-option>
            </b-form-select>
          </b-col>
        </b-row>
        <!-- <b-row class="my-3">
          <b-col class="d-flex justify-content-center">
            <multiselect
              v-model="typeSelectedFilter"
              class="w-25 mx-2"
              :multiple="true"
              placeholder="Select Type"
              :options="options"
            />
            <b-form-datepicker
              id="example-datepicker"
              v-model="dateFromFilter"
              class="w-25 px-2"
              reset-button
              :min="min"
              placeholder="Select Date"
            />
            <b-input-group class="w-25 px-2">
              <b-form-input
                v-model="cityFilter"
                placeholder="Enter city"
              />
              <b-input-group-append
                style="cursor: pointer"
                @click="clearCityFilter"
              >
                <b-input-group-text>
                  <b-icon-x />
                </b-input-group-text>
              </b-input-group-append>
            </b-input-group>
            <b-button
              :disabled="!regionIsSelected"
              variant="light"
              class="mx-2"
              @click="applyFilter()"
            >
              <b-icon-filter />Filter
            </b-button>
            <b-button
              :disabled="!regionIsSelected"
              variant="light"
              class="mx-2"
              @click="clearFilter()"
            >
              Clear Filter
            </b-button>
          </b-col>
        </b-row> -->
      </b-container>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    filtered: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const now = new Date()
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )
    return {
      min: today,
      isMobile: false,
      isTablet: false,
      regionIsSelected: false,
      selectedRegion: '',
      isBusy: false,
      typeSelectedFilter: null,
      dateFromFilter: null,
      cityFilter: null,
      options: [
        'MILONGA',
        'PRACTICA',
        'CLASS',
        'WORKSHOP',
        'PRIVATE',
        'FESTIVAL',
        'RETREAT',
        'VACATION',
        'MARATHON'
      ],
      sortedRegion: [
        { key: 'ENG_E', text: 'England - East' },
        { key: 'ENG_EML', text: 'England - East Midlands' },
        { key: 'ENG_GLN', text: 'England - Greater London' },
        { key: 'ENG_NE', text: 'England - North East' },
        { key: 'ENG_NW', text: 'England - North West' },
        { key: 'ENG_SE', text: 'England - South East' },
        { key: 'ENG_SW', text: 'England - South West' },
        { key: 'ENG_WML', text: 'England - West Midlands' },
        { key: 'ENG_H', text: 'England - Yorkshire and the Humber' },
        { key: 'N_IRE', text: 'Northern Ireland' },
        { key: 'SCO', text: 'Scotland' },
        { key: 'WALES', text: 'Wales' },
        { key: 'ONLINE', text: 'UK - Online' }
      ]
    }
  },
  watch: {
    '$route' (to, from) {
      this.selectedRegion = ''
    },
    selectedRegion: function (newValue, oldValue) {
      this.$emit('updateRegion', newValue)
      this.regionIsSelected = true
      this.selectedRegion = newValue
      this.cityFilter = null
      this.dateFromFilter = null
      this.typeSelectedFilter = null
      if (
        this.cityFilter === null ||
        this.dateFromFilter === undefined ||
        this.typeSelectedFilter === null
      ) {
        if (this.$route.name === 'Events' || this.$route.name === 'Home') {
          this.$emit('getEvents', this.selectedRegion)
        } else {
          this.$emit('getTeachers', this.selectedRegion)
        }
      } else {
        this.$emit('getEventsFilter')
      }
    }
  },
  methods: {
    applyFilter () {
      const type = this.typeSelectedFilter
      const daterange = this.dateFromFilter
      const city = this.cityFilter

      const obj = {
        cityFilter: city,
        dateFromFilter: daterange,
        typeSelectedFilter: type,
        selectedRegion: this.selectedRegion
      }

      this.$emit('getEventsFilter', obj)
    },
    capitalizeWord (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    clearFilter () {
      this.cityFilter = null
      this.dateFromFilter = null
      this.typeSelectedFilter = null
      this.$emit('getEvents')
      this.$emit('removeFilterState', false)
    },
    clearCityFilter () {
      this.cityFilter = null
    },
    resizeWindow () {
      if (window.innerWidth < 1024) {
        this.isMobile = true
        this.isTablet = false
      } else if (window.innerWidth > 1023 && window.innerWidth < 1201) {
        this.isTablet = true
        this.isMobile = false
      } else {
        this.isTablet = true
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeWindow)
  },
  mounted () {
    window.addEventListener('resize', this.resizeWindow)
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
