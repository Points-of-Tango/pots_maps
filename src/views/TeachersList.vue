<template>
  <b-container v-if="teachers.length > 0"
    id="teachers-list"
    fluid
  >
    <b-row align-h="end">
      <b-col
        lg="12"
        align-self="end"
      >
        <b-form-group
          label="Search"
          label-for="teachers-filter-input"
          class="results-search my-3 text-left"
        >
          <b-input-group>
            <b-form-input
              id="teachers-filter-input"
              v-model="searchKeyword"
              type="search"
              placeholder="Name, club, city or postcode"
            />
            <b-input-group-append>
              <b-button
                :disabled="!searchKeyword"
                @click="searchKeyword = ''"
              >
                Clear
              </b-button>
            </b-input-group-append>
            <b-input-group-append>
              <b-button
                @click="toggleResultsViewMode"
                style="width: 40px;"
              >
              <font-awesome-icon v-if="!gridView" icon="fa-solid fa-grip" title="Switch to grid"/>
              <font-awesome-icon v-else icon="fa-solid fa-table-list" title="Switch to list"/>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col
        sm="12"
        md="4"
        offset-md="4"
        class="my-3"
      >
        <b-pagination
          v-model="currentPage"
          @change="scrollToStart"
          :total-rows="sortedTeachersList.length"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        />
      </b-col>
    </b-row>
    <b-row v-if="!gridView">
      <b-col>
        <b-table
          id="my-table"
          responsive="md"
          striped
          hover
          show-empty
          :fields="fields"
          :items="sortedTeachersList"
          :current-page="currentPage"
          :per-page="perPage"
        >
          <template
            #cell(name)="data"
          >
            <b-img-lazy
              v-if="data.item.logo !== undefined"
              :src="data.item.logo"
              height="80"
              width="80"
              class="rounded-circle mr-3 img-fluid"
              alt="Teacher picture"
            />
            <template v-if="profileLink(data.item)">
              <a :href="profileLink(data.item)" target="_blank" rel="noopener noreferrer">{{ data.item.name }}</a>
              <a
                :href="profileLink(data.item)"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-1"
                :aria-label="`Open ${data.item.name} on Points of Tango`"
                :title="`Open ${data.item.name} on Points of Tango`"
              ><font-awesome-icon icon="fa-solid fa-up-right-from-square" /></a>
            </template>
            <template v-else>{{ data.item.name }}</template>
          </template>
          <template #cell(contact)="data">
            <p><a :href="`${webpagelink(data.item)}`" target="_blank" rel="noopener noreferrer">{{ data.item.contact.link }}</a></p>
            <p><a :href="`mailto:${data.item.contact.email}`">{{ data.item.contact.email }}</a></p>
            <p>{{ data.item.contact.phone }}</p>
            <span v-if="data.item.contact.facebook">
              <a :href="`https://facebook.com/${data.item.contact.facebook}`">
                <img
                  width="24"
                  height="24"
                  src="@/assets/facebook_logo.svg"
                  alt="Facebook logo"
                > Facebook
              </a>
            </span>
            <span v-if="data.item.contact.instagram">
              <a :href="`https://instagram.com/${data.item.contact.instagram}`">
                <img
                  width="24"
                  height="24"
                  src="@/assets/instagram_logo.svg"
                  alt="Instagram logo"
                > Instagram
              </a>
            </span>
          </template>
          <template #cell(city)="data">
            {{ data.item.city }}
          </template>
          <template #cell(postcode)="data">
            {{ data.item.postcode }}
          </template>
          <template #table-busy>
            <div class="text-center text-danger my-2">
              <b-spinner class="align-middle" />
              <strong> Loading...</strong>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>
    <div class="wrapper-flex" v-if="gridView">
      <SmallProfileCard v-for="(item, index) in pagedTeachers"
        :key="item.id || index"
        :id="item.id"
        :slug="item.slug"
        :name="item.name"
        :avatar-image-url="item.logo"
        :cover-image-url="item.picture"
        :locations="(item.addresses || []).reduce((acc, curr) => [ ...acc, { city: curr.city, postcode: curr.postCode }], [])"
        :contact="item.contact"
        :club-name="item.clubName"
        ></SmallProfileCard>
    </div>
  </b-container>
</template>

<script>
import { profileUrl } from '@/utils/profileUrl'

export default {
  props: {
    teachers: {
      required: true,
      type: Array,
      default: () => []
    }
  },
  components: {
    SmallProfileCard: () => import(/* webpackChunkName: "smallProfileCard" */ '@/components/SmallProfileCard.vue')
  },
  data () {
    return {
      tabActive: false,
      currentPage: 1,
      perPage: 25,
      fields: ['name', 'contact', 'city', 'postcode'],
      isBusy: false,
      searchKeyword: '',
      gridView: true
    }
  },
  computed: {
    teachersList () {
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
    sortedTeachersList () {
      const list = this.teachersList.map((item) => ({ ...item }))
      list.sort(function (a, b) {
        if (a.name < b.name) {
          return -1
        }
        if (a.name > b.name) {
          return 1
        }
        return 0
      })
      return list
    },
    pagedTeachers () {
      const start = (this.currentPage - 1) * this.perPage
      return this.sortedTeachersList.slice(start, start + this.perPage)
    },
    profileLink: function () {
      return (item) => profileUrl(item.slug, item.id)
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
  watch: {
    searchKeyword () {
      this.currentPage = 1
    },
    teachers () {
      this.currentPage = 1
    }
  },
  mounted () {
    this.$root.$on('bv::dropdown::show', (bvEvent) => { })
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
    // Only when the user changes the page with the paginator (b-pagination
    // `change`), not when the search/teachers watchers reset currentPage to 1.
    scrollToStart () {
      this.$nextTick(() => {
        const el = this.$el
        if (!el || !el.scrollIntoView) return
        const reduced = typeof window !== 'undefined' && window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      })
    },
    toggleResultsViewMode () {
      this.gridView = !this.gridView
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

.wrapper-flex {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
