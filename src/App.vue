<template>
  <div>
    <navbar-header />
    <router-view />
  </div>
</template>

<script>
export default {
  components: {
    NavbarHeader: () => import(/* webpackChunkName: "navbar" */ '@/components/NavbarHeader.vue')
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
@import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&family=Ubuntu:wght@700&display=swap');
@import "assets/custom.scss";

#app {
  font-family: 'Source Sans Pro', sans-serif !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

/* selected: multiselect__option--selected# */
.multiselect__option.multiselect__option--highlight,
.multiselect__option--highlight::after,
.multiselect__tag,
.multiselect__tag-icon:after,
.multiselect__tag-icon:focus,
.multiselect__tag-icon:hover {
  background: #660404 !important;
  color: white !important;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.page-item.active .page-link {
  background: #660404;
  border-color: #660404;
}

.page-link {
  color: #660404;
}

.gm-style-iw-d {
  overflow: auto !important;
}
</style>
