import Vue from 'vue'
import axios from 'axios'
import SuiVue from 'semantic-ui-vue'
import VueLodash from 'vue-lodash'

import App from './App'
import router from './router'
import store from './store'
// import 'semantic-ui-css/semantic.min.css'
import '../semantic/src/semantic.less'
import { tasksCollection, settingsCollection, pomodoroCollection } from './datastore'

import VueApexCharts from 'vue-apexcharts'
import VeeValidate from 'vee-validate'

import i18n from '../i18n/index'

import Notify from './plugins/Notify.ts'

const options = { name: 'lodash' }

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(SuiVue)
Vue.use(VueLodash, options)
Vue.use(require('vue-moment'))
Vue.use(VueApexCharts)
Vue.use(VeeValidate, {
  events: 'change|blur',
  fieldsBagName: 'formFields'
})
Vue.use(Notify)

Vue.component('apexchart', VueApexCharts)
Vue.prototype.$db = {
  tasks: tasksCollection,
  pomodoros: pomodoroCollection,
  settings: settingsCollection
}

Vue.filter('round', function (value) {
  return Math.round(value)
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>'
}).$mount('#app')
