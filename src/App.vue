<template>
  <div id="app">
    <navbar-header />
    <main class="app-main">
      <router-view />
    </main>
    <site-footer />
  </div>
</template>

<script>
export default {
  components: {
    NavbarHeader: () => import(/* webpackChunkName: "navbar" */ '@/components/NavbarHeader.vue'),
    SiteFooter: () => import(/* webpackChunkName: "footer" */ '@/components/SiteFooter.vue')
  },
  destroyed () {
    window.removeEventListener('resize', this.resizeWindow)
  },
  mounted () {
    window.addEventListener('resize', this.resizeWindow)
  },
  methods: {
    resizeWindow () {
      if (window.innerWidth < 1024) {
        this.$isMobile = true
        this.$isTablet = false
      } else if (window.innerWidth > 1023 && window.innerWidth < 1201) {
        this.$isTablet = true
        this.$isMobile = false
      } else {
        this.$isTablet = true
      }
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Open+Sans:wght@400;600;700&display=swap');
@import "assets/custom.scss";

#app {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #191919;
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Lato', sans-serif;
}

.multiselect__option.multiselect__option--highlight,
.multiselect__option--highlight::after,
.multiselect__tag,
.multiselect__tag-icon:after,
.multiselect__tag-icon:focus,
.multiselect__tag-icon:hover {
  background: #1B82C5 !important;
  color: white !important;
}

.page-item.active .page-link {
  background: #1B82C5;
  border-color: #1B82C5;
}

.page-link {
  color: #1B82C5;
}

.page-link:hover {
  color: #156A9F;
}

.gm-style-iw-d {
  overflow: auto !important;
}
</style>
