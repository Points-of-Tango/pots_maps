<template>
  <header class="site-header">
    <a class="logo" :href="site.home">
      <img src="@/assets/UKATA-logo-2025-AW.png" alt="UK Argentine Tango Association">
    </a>
    <nav
      id="primary-nav"
      class="primary-nav"
      :class="{ 'is-open': menuOpen }"
      aria-label="Primary"
    >
      <a
        v-for="link in site.nav"
        :key="link.label"
        :href="link.current ? '/' : link.href"
        :class="{ current: link.current }"
        :aria-current="link.current ? 'page' : null"
        @click="onNavClick(link, $event)"
      >{{ link.label }}</a>
    </nav>
    <button
      type="button"
      class="burger"
      :aria-expanded="menuOpen ? 'true' : 'false'"
      aria-controls="primary-nav"
      :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
      @click="menuOpen = !menuOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
    <powered-by placement="header" />
    <powered-by placement="bar" />
  </header>
</template>

<script>
import { SITE } from '@/config/site'
import PoweredBy from '@/components/PoweredBy.vue'

export default {
  name: 'NavbarHeader',
  components: { PoweredBy },
  data () {
    return {
      site: SITE,
      menuOpen: false
    }
  },
  mounted () {
    window.addEventListener('keydown', this.onKeydown)
    window.addEventListener('resize', this.onResize)
  },
  destroyed () {
    window.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    onNavClick (link, event) {
      this.menuOpen = false
      if (link.current) {
        event.preventDefault()
      }
    },
    onKeydown (event) {
      if (event.key === 'Escape') {
        this.menuOpen = false
      }
    },
    onResize () {
      if (window.innerWidth > 991) {
        this.menuOpen = false
      }
    }
  }
}
</script>

<style scoped>
.site-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "logo nav powered";
  align-items: center;
  column-gap: 16px;
  padding: 12px 28px 10px;
  min-height: 108px;
  background: #fff;
  border-bottom: 1px solid #E8E6E6;
  position: relative;
  z-index: 20;
}

.logo {
  grid-area: logo;
  display: flex;
  align-items: center;
  justify-self: start;
  line-height: 0;
}

.logo img {
  height: 84px;
  width: auto;
  display: block;
}

.primary-nav {
  grid-area: nav;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  margin: 0;
}

.primary-nav a {
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #585858;
  text-decoration: none;
  padding: 0 11px;
  border-left: 1px solid #c9b8d0;
  line-height: 1;
  white-space: nowrap;
}

.primary-nav a:first-child {
  border-left: 0;
}

.primary-nav a.current {
  color: #522462;
}

.primary-nav a:hover {
  color: #1B82C5;
}

.primary-nav a.current:hover {
  color: #522462;
}

.burger {
  display: none;
  width: 40px;
  height: 40px;
  padding: 8px;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.burger span {
  display: block;
  height: 2px;
  margin: 5px 0;
  background: #191919;
  border-radius: 2px;
}

.site-header > .powered-by--header {
  grid-area: powered;
  justify-self: end;
}

.site-header > .powered-by--bar {
  display: none;
}

@media (max-width: 991px) {
  .site-header {
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas:
      "logo logo logo"
      "bar bar bar"
      "menu menu menu";
    min-height: 0;
    padding: 6px 12px 0;
    column-gap: 0;
  }

  .logo {
    grid-area: logo;
    justify-self: center;
  }

  .logo img {
    height: 60px;
  }

  .burger {
    display: inline-block;
    grid-area: logo;
    justify-self: end;
    align-self: center;
    z-index: 1;
  }

  .primary-nav {
    grid-area: menu;
    display: none;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    padding: 4px 0 12px;
    border-top: 1px solid #E8E6E6;
  }

  .primary-nav.is-open {
    display: flex;
  }

  .primary-nav a {
    border-left: 0;
    padding: 12px 8px;
    text-align: center;
    border-bottom: 1px solid #F0F7F9;
  }

  .site-header > .powered-by--header {
    display: none;
  }

  .site-header > .powered-by--bar {
    display: flex;
    grid-area: bar;
    border-top: 1px solid #E8E6E6;
    padding: 6px 0 8px;
    margin-top: 2px;
  }
}
</style>
