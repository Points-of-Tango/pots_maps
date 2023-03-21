<template>
  <b-container
    id="events-list"
    fluid
  >
    <b-row
      v-if="events.length > 0"
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
              placeholder="Type to search name, organizer, city, keywords, or address"
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
          :items="eventList"
          :current-page="currentPage"
          :per-page="perPage"
          @row-clicked="viewEvents"
        >
          <template #cell(date)="data">
            {{ data.item.from }} <br>
            <span class="date"> To </span> <br>
            {{ data.item.to }}
          </template>
          <template #cell(name)="data">
            <h6
              v-if="data.item.cancelled"
              class="text-left cancelled text-muted"
            >
              <b-img-lazy
                v-if="data.item.logo !== undefined"
                :src="data.item.logo"
                height="80"
                width="80"
                class="rounded-circle mr-3 img-fluid"
                alt="Event logo"
              >
                {{ data.item.name }}
                <span
                  v-if="data.item.cancelled"
                  class="cancelled text-muted"
                >
                  - CANCELLED
                </span>
              </b-img-lazy>
            </h6>
            <h6
              v-if="!data.item.cancelled"
              class="text-left"
            >
              <img
                v-if="data.item.logo !== undefined"
                :src="data.item.logo"
                height="80"
                width="80"
                class="rounded-circle mr-3 img-fluid"
                alt="Event logo"
              >
              {{ data.item.name }}
            </h6>
          </template>
          <template #cell(organizer)="data">
            <p>{{ data.value }}</p>
          </template>
          <template #cell(address)="data">
            <p>
              <span>
                {{ data.item.address }}
              </span>
              <br>
              <span>
                {{ data.item.postCode }}
              </span>
              <br>
              <span>
                <p>{{ data.item.city }}</p>
              </span>
            </p>
          </template>
          <template #cell(type)="data">
            {{ data.item.type }}
          </template>
          <template #table-busy>
            <div class="text-center text-danger my-2">
              <b-spinner class="align-middle" />
              <p><strong> Loading...</strong></p>
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
    events: {
      type: Array,
      required: true,
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
      fields: ['date', 'name', 'organizer', 'address', 'type'],
      isBusy: false,
      searchKeyword: ''
    }
  },
  computed: {
    eventList () {
      return this.events.filter(
        (item) =>
          !this.searchKeyword ||
          item.name
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.city
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase()) ||
          item.address
            .toLowerCase()
            .includes(this.searchKeyword.toLowerCase())
      )
    }
  },
  watch: {
    events: function (newVal, oldVal) {
      this.totalRows = this.events.length
    }
  },
  mounted () {
    this.$root.$on('bv::dropdown::show', (bvEvent) => { })
  },
  methods: {
    viewEvents (args) {
      window.open(
        `https://points-of-tango.web.app/events/view?country=${args.country}&region=${this.selectedRegion}&eventId=${args.id}`,
        '_blank'
      )
    }
  }
}
</script>
