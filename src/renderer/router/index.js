import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/tasks',
      name: 'tasks',
      component: require('@/components/Tasks').default
    },
    {
      path: '/timer',
      name: 'timer',
      component: require('@/components/Timer').default
    },
    {
      path: '/charts',
      name: 'charts',
      component: require('@/components/Charts').default
    },
    {
      path: '/settings',
      name: 'seggings',
      component: require('@/components/Settings').default
    },
    {
      path: '*',
      redirect: '/timer'
    }
  ]
})
