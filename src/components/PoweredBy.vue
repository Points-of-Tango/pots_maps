<template>
  <a
    class="powered-by"
    :class="`powered-by--${placement}`"
    :href="site.pointsOfTango"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Powered by Points of Tango"
  >
    <span class="powered-by__label">Powered by</span>
    <img src="@/assets/logo-pot-completo.png" alt="Points of Tango">
  </a>
</template>

<script>
import { SITE } from '@/config/site'

export default {
  name: 'PoweredBy',
  props: {
    placement: {
      type: String,
      default: 'header'
    }
  },
  data () {
    return { site: SITE }
  }
}
</script>

<style scoped>
.powered-by {
  display: inline-flex;
  text-decoration: none;
  color: inherit;
}

.powered-by__label {
  font-family: 'Open Sans', sans-serif;
  font-weight: 600;
  font-size: 9px;
  line-height: 1;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #607980;
}

.powered-by img {
  width: auto;
  max-width: none;
  display: block;
}

.powered-by--header {
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.powered-by--header img {
  height: 36px;
}

.powered-by--bar {
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.powered-by--bar img {
  height: 28px;
}

.powered-by--footer {
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin: 12px auto 0;
}

.powered-by--footer img {
  height: 40px;
}
</style>
