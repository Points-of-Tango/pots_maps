<template>
  <div id="selection">
    <a class="back" :href="site.home">← Back to UKATA</a>
    <div class="hero-inner">
      <h1>UK Tango Map</h1>
      <div class="rule"></div>
      <div class="filters">
        <b-form-select
          v-model="selectedRegion"
          class="hero-select"
          aria-label="Region"
          @change="handleSelectedRegion"
        >
          <template #first>
            <b-form-select-option value="" disabled>
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
        <b-form-select
          v-model="selectedRole"
          class="hero-select"
          aria-label="Role"
          @change="handleSelectedRole"
        >
          <template #first>
            <b-form-select-option value="" disabled>
              Please select a role
            </b-form-select-option>
          </template>
          <b-form-select-option
            v-for="(value, index) in roles"
            :key="index"
            :value="value.key"
          >
            {{ value.text }}
          </b-form-select-option>
        </b-form-select>
      </div>
    </div>
  </div>
</template>

<script>
import { SITE } from '@/config/site'

export default {
  data () {
    return {
      site: SITE,
      isMobile: false,
      selectedRegion: '',
      selectedRole: '',
      roles: [
        { key: 'PROFESSIONAL', text: 'Teachers & Clubs' },
        { key: 'DJ', text: 'DJ' },
        // {key: TAXI_DANCER, text: 'Taxi Dancer'},
        { key: 'MUSICIAN', text: 'Musician' },
        { key: 'ALL', text: 'All Roles' }
      ],
      sortedRegion: [
        { key: 'ENG_E', text: 'England — East' },
        { key: 'ENG_EML', text: 'England — East Midlands' },
        { key: 'ENG_GLN', text: 'England — Greater London' },
        { key: 'ENG_NE', text: 'England — North East' },
        { key: 'ENG_NW', text: 'England — North West' },
        { key: 'ENG_SE', text: 'England — South East' },
        { key: 'ENG_SW', text: 'England — South West' },
        { key: 'ENG_WML', text: 'England — West Midlands' },
        { key: 'ENG_YH', text: 'England — Yorkshire and the Humber' },
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
    },
    handleSelectedRegion (region) {
      console.log('Region Selected: ', region)
      this.$emit('updateRegion', region)
      this.emitUpdate()
    },
    handleSelectedRole (role) {
      console.log('Role Selected: ', role)
      this.$emit('updateRole', role)
      this.emitUpdate()
    },
    emitUpdate () {
      if (this.isEventPage) {
        this.$emit('getEvents', this.selectedRegion)
      } else {
        this.$emit('getTeachers', { region: this.selectedRegion, role: this.selectedRole })
      }
      this.$router.push(`${this.$route.path}?region=${this.selectedRegion.toLowerCase()}&role=${this.selectedRole.toLowerCase()}`)
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeWindow)
  },
  mounted () {
    this.resizeWindow()
    window.addEventListener('resize', this.resizeWindow)
    console.log('route: ', this.$route.query)
    const query = this.$route.query
    const availableRegionsCodes = this.sortedRegion.reduce((acc, curr) => ([...acc, curr.key.toLowerCase()]), [])
    let defaultSelectedRegion = 'ALL'
    if (availableRegionsCodes.includes(query.region?.toLowerCase())) {
      defaultSelectedRegion = query.region.toUpperCase()
    }
    const availableRolesCodes = this.roles.reduce((acc, curr) => ([...acc, curr.key.toLowerCase()]), [])
    let defaultSelectedRole = 'ALL'
    if (availableRolesCodes.includes(query.role?.toLowerCase())) {
      defaultSelectedRole = query.role.toUpperCase()
    }
    this.selectedRegion = defaultSelectedRegion
    this.selectedRole = defaultSelectedRole
    this.emitUpdate()
  }
}
</script>

<style lang="scss" scoped>
#selection {
  position: relative;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111 url('~@/assets/background-img.jpg') center / cover no-repeat;
  padding: 64px 16px 36px;
  color: #fff;
  text-align: center;
}

#selection::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.45) 100%);
  pointer-events: none;
}

.back {
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 2;
  color: #fff;
  text-decoration: none;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.5);
  padding: 6px 12px;
  border-radius: 999px;
}

.back:hover {
  background: #1B82C5;
  color: #fff;
  text-decoration: none;
}

.hero-inner {
  position: relative;
  z-index: 1;
  width: min(720px, 100%);
}

h1 {
  margin: 0;
  font-family: 'Lato', sans-serif;
  font-weight: 300;
  font-size: 44px;
  letter-spacing: 0.01em;
  color: #fff;
  border: 0;
  width: auto;
  height: auto;
}

.rule {
  width: 280px;
  height: 2px;
  background: #fff;
  margin: 12px auto 18px;
}

.filters {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-select {
  appearance: none;
  -webkit-appearance: none;
  height: 42px !important;
  width: 260px;
  min-width: 220px;
  padding: 0 36px 0 16px !important;
  border: 0 !important;
  border-radius: 8px !important;
  background-color: #fff !important;
  color: #191919 !important;
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8'><path d='M1 1l5 5 5-5' fill='none' stroke='%231B82C5' stroke-width='1.6'/></svg>") !important;
  background-repeat: no-repeat !important;
  background-position: right 14px center !important;
  background-size: 12px 8px !important;
}

@media (max-width: 767px) {
  #selection {
    min-height: 280px;
    padding: 56px 14px 24px;
  }

  .back {
    left: 10px;
    top: 10px;
    font-size: 12px;
    padding: 5px 10px;
  }

  h1 {
    font-size: 30px;
  }

  .rule {
    width: 180px;
  }

  .filters {
    flex-direction: column;
    align-items: center;
  }

  .hero-select {
    width: 100%;
    max-width: 280px;
    min-width: 0;
  }
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
