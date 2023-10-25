import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import * as VueGoogleMaps from 'vue2-google-maps'
import { BootstrapVue, BIconFunnel, BIconX, BIconFilter } from 'bootstrap-vue'
import axios from '@/axios'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'
/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
/* import specific icons */
import { faEnvelope, faGlobe, faGrip, faLocationDot, faPencil, faTableList } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons'

Vue.use(BootstrapVue)
Vue.component('BIconFunnel', BIconFunnel)
Vue.component('BIconX', BIconX)
Vue.component('BIconFilter', BIconFilter)
Vue.component('font-awesome-icon', FontAwesomeIcon)

/* add icons to the library */
library.add(faPencil, faFacebook, faInstagram, faEnvelope, faWhatsapp, faGlobe, faLocationDot, faTableList, faGrip)

Vue.prototype.$axios = axios
Vue.prototype.$isMobile = false
Vue.prototype.$isTablet = false
Vue.prototype.$isDesktop = false

Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyCpHBXT2lNXuSkrYXDRILTnLxfXp3OtGE4',
    libraries: 'places'
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
