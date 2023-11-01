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
    <b-row v-if="!gridView">
      <b-col>
        <b-table
          id="my-table"
          responsive="md"
          striped
          hover
          show-empty
          :fields="fields"
          :items="teachersList"
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
            {{ data.item.name }}
          </template>
          <template #cell(contact)="data">
            <p><a :href="`${data.item.contact.link}`" target="blank">{{ data.item.contact.link }}</a></p>
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
    <b-row v-if="!gridView">
      <b-col
        sm="12"
        md="4"
        offset-md="4"
        class="my-1"
      >
        <b-pagination
          v-model="currentPage"
          :total-rows="this.teachers.length"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        />
      </b-col>
    </b-row>
    <div class="wrapper-flex" v-if="gridView">
      <SmallProfileCard v-for="(item, index) in teachersList"
        :key="index + item.name"
        :name="item.name"
        :avatar-image-url="item.logo"
        :cover-image-url="item.picture"
        :locations="item.addresses.reduce((acc, curr) => [ ...acc, { city: curr.city, postcode: curr.postCode }], [])"
        :contact="item.contact"
        ></SmallProfileCard>
    </div>
  </b-container>
</template>

<script>

export default {
  props: {
    teachers: {
      required: true,
      type: Array,
      default: () => []
    },
    selectedRegion: {
      type: String,
      default: null
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
          this.isTrueThat(item.postcode).includes(this.searchKeyword) ||
          this.isTrueThat(item.keywords).includes(this.searchKeyword) ||
          this.isTrueThat(item.city).includes(this.searchKeyword)
      )
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
  color: #212529;
  background-color: rgba(0, 0, 0, 0.36) !important;
}

li>a {
  color: #660404;

  &:hover {
    color: #660404;
  }
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
