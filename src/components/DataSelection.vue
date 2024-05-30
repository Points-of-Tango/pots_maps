<template>
  <div id="selection">
    <div id="selction-content">
        <div class="selction-content-text">
            <h1 class="display-3 text-center text-white border-light border-3">
              UK Tango Map
            </h1>
        </div>
        <div class="selction-content-select">
          <b-container fluid="xl" class="my-5">
            <b-row class="my-3">
              <b-col class="d-flex justify-content-center">
                <b-form-select v-model="selectedRegion"
                  :class="isMobile ? 'w-100': 'w-25'"
                  class="mx-2 countryClass"
                  style="width: 275px !important;"
                >
                  <template #first>
                    <b-form-select-option value="" disabled>
                      Please select a region
                    </b-form-select-option>
                  </template>
                  <b-form-select-option v-for="(value, index) in sortedRegion"
                    :key="index" :value="value.key">
                    {{ value.text }}
                  </b-form-select-option>
                </b-form-select>
              </b-col>
            </b-row>
          </b-container>
          <b-container fluid="xl" class="my-5">
            <b-row class="my-3">
              <b-col class="d-flex justify-content-center">
                <b-form-select v-model="selectedRole"
                  :class="isMobile ? 'w-100': 'w-25'"
                  class="mx-2 countryClass"
                  style="width: 275px !important;"
                >
                  <template #first>
                    <b-form-select-option value="" disabled>
                      Please select a role
                    </b-form-select-option>
                  </template>
                  <b-form-select-option v-for="(value, index) in roles"
                    :key="index" :value="value.key">
                    {{ value.text }}
                  </b-form-select-option>
                </b-form-select>
              </b-col>
            </b-row>
          </b-container>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      isMobile: false,
      selectedRegion: '',
      selectedRole: '',
      roles: [
        { key: 'ORCHESTRA', text: 'Orchestra' },
        { key: 'PROFESSIONAL', text: 'Prefessional' },
        { key: 'DJ', text: 'DJ' },
        // {key: TAXI_DANCER, text: 'Taxi Dancer'},
        { key: 'MUSICIAN', text: 'Musician' },
        { key: 'ALL', text: 'All Roles' }
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
        { key: 'ENG_YH', text: 'England - Yorkshire and the Humber' },
        { key: 'N_IRE', text: 'Northern Ireland' },
        { key: 'SCO', text: 'Scotland' },
        { key: 'WALES', text: 'Wales' },
        { key: 'ALL', text: 'All Regions' }
      ]
    }
  },
  computed: {
    isEventPage () {
      return this.$route.name === 'Events'
    }
  },
  watch: {
    '$route' (to, from) {
      this.selectedRegion = ''
    },
    selectedRegion: function (newValue, oldValue) {
      this.$emit('updateRegion', newValue)
      this.selectedRegion = newValue
      if (this.isEventPage) {
        this.$emit('getEvents', this.selectedRegion)
      } else {
        this.$emit('getTeachers', { region: this.selectedRegion, role: this.selectedRole })
      }
    },
    selectedRole: function (newValue, oldValue) {
      this.$emit('updateRole', newValue)
      this.selectedRole = newValue
      this.$emit('getTeachers', { region: this.selectedRegion, role: this.selectedRole })
    }
  },
  methods: {
    capitalizeWord (string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    resizeWindow () {
      if (window.innerWidth < 767) {
        this.isMobile = true
      } else {
        this.isMobile = false
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeWindow)
  },
  mounted () {
    window.addEventListener('resize', this.resizeWindow)
    this.selectedRegion = 'ALL'
    this.selectedRole = 'ALL'
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
