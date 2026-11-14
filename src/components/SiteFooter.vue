<template>
  <footer class="site-footer">
    <div class="footer-row">
      <a class="pill" :href="site.home">Back to UKATA</a>
      <div class="footer-brand">
        <strong>{{ site.name }}</strong>
        <span>Registered Charity {{ site.charityNumber }}</span>
      </div>
      <div class="footer-links">
        <a :href="site.privacy">Privacy Policy</a>
        <div class="social">
          <a class="social-btn social-btn--fb" :href="site.facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <font-awesome-icon :icon="['fab', 'facebook-f']" />
          </a>
          <a class="social-btn social-btn--ig" :href="site.instagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <font-awesome-icon :icon="['fab', 'instagram']" />
          </a>
          <a class="social-btn social-btn--yt" :href="site.youtube" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <font-awesome-icon :icon="['fab', 'youtube']" />
          </a>
        </div>
      </div>
    </div>
    <p class="copy">{{ site.copyright }}</p>
    <powered-by placement="footer" />
  </footer>
</template>

<script>
import { SITE } from '@/config/site'
import PoweredBy from '@/components/PoweredBy.vue'

export default {
  name: 'SiteFooter',
  components: { PoweredBy },
  data () {
    return { site: SITE }
  }
}
</script>

<style scoped>
.site-footer {
  border-top: 1px solid #E8E6E6;
  padding: 22px 40px 18px;
  background: #fff;
  margin-top: auto;
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  background: #1B82C5;
  color: #fff;
  border-radius: 999px;
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
}

.pill:hover {
  background: #156A9F;
  color: #fff;
  text-decoration: none;
}

.footer-brand {
  text-align: center;
  flex: 1 1 240px;
}

.footer-brand strong {
  display: block;
  color: #1B82C5;
  font-family: 'Open Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
}

.footer-brand span {
  color: #1B82C5;
  font-size: 13px;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 13px;
}

.footer-links > a {
  color: #1B82C5;
  text-underline-offset: 2px;
}

.footer-links > a:hover {
  color: #156A9F;
}

.social {
  display: flex;
  gap: 8px;
}

.social-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  text-decoration: none;
  font-size: 14px;
}

.social-btn:hover {
  color: #fff;
  opacity: 0.9;
}

.social-btn--fb { background: #1877F2; }
.social-btn--ig { background: #E1306C; }
.social-btn--yt { background: #FF0000; }

.copy {
  text-align: center;
  margin: 14px 0 0;
  font-size: 13px;
  color: #191919;
}

@media (max-width: 767px) {
  .site-footer {
    padding: 16px 16px 12px;
  }

  .footer-row {
    flex-direction: column;
    text-align: center;
  }

  .footer-links {
    flex-direction: column;
  }
}
</style>
