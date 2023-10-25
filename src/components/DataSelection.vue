<template>
  <div id="selection">
    <div id="selction-content">
        <div class="selction-content-text">
            <h1
              class="display-3 text-center text-white border-light border-3"
            >
              UK Tango Map
            </h1>
        </div>
        <div class="selction-content-select">
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
              class="mx-2 countryClass"
              style="width: 275px !important;"
            >
              <template #first>
                <b-form-select-option
                  value=""
                  disabled
                >
                  Please select a region
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
      </b-container>
    </div>
    </div>
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
    return {
      isMobile: false,
      isTablet: false,
      regionIsSelected: false,
      selectedRegion: '',
      isBusy: false,
      typeSelectedFilter: null,
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
        { key: 'ALL', text: 'All' }
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
      if (this.$route.name === 'Events' || this.$route.name === 'Home') {
        this.$emit('getEvents', this.selectedRegion)
      } else {
        this.$emit('getTeachers', this.selectedRegion)
      }
    }
  },
  methods: {
    capitalizeWord (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    clearFilter () {
      this.$emit('getEvents')
      this.$emit('removeFilterState', false)
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
