<template>
  <b-container
    id="teachers-list"
    fluid
  >
    <b-row
      v-if="teachers.length > 0"
      align-h="end"
    >
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
              placeholder="Type to search name, contact, city, or postcode"
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
    <b-row>
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
            <p><a :href="`${data.item.contact.link}`" :target="_blank">{{ data.item.contact.link }}</a></p>
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
    <b-row>
      <b-col
        sm="12"
        md="4"
        offset-md="4"
        class="my-1"
      >
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        />
      </b-col>
    </b-row>
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
  data () {
    return {
      tabActive: false,
      totalRows: 1,
      currentPage: 1,
      perPage: 25,
      fields: ['name', 'contact', 'city', 'postcode'],
      isBusy: false,
      searchKeyword: ''
    }
  },
  computed: {
    teachersList () {
      return this.teachers.filter(
        (item) =>
          !this.searchKeyword ||
          item.name
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.contact.email
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.contact.link
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.postcode
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.keywords
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.city
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  watch: {
    teachers: function (newVal, oldVal) {
      this.totalRows = this.teachers.length
    }
  },
  mounted () {
    this.$root.$on('bv::dropdown::show', (bvEvent) => { })
  },
  methods: {
    viewEvents (args) {
      window.open(`https://points-of-tango.web.app/events/view?country=${args.country}&region=${this.selectedRegion}&eventId=${args.id}`, '_blank')
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
