import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "events" */ '@/views/PageEvents.vue')
  },
  {
    path: '/events',
    name: 'Events',
    component: () => import(/* webpackChunkName: "events" */ '@/views/PageEvents.vue')
  },
  {
    path: '/teachers',
    name: 'Teachers',
    component: () => import(/* webpackChunkName: "teachers" */ '@/views/PageEvents.vue')
  }
]

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes
})

router.afterEach((to, from) => {
  Vue.nextTick(() => {
    document.title = to.meta.title ? to.meta.title : 'Ukata Tango Map'
  })
})

export default router
