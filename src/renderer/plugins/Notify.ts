import Vue from 'vue'

const Notify ={
  install(Vue, options) {
    // Vue.myGlobalMethod = function () {
    // }

    // Vue.directive('my-directive', {
    //   bind (el, binding, vnode, oldVnode) {
    //   }
    // })

    Vue.mixin({
      data () {
        return {
          plugin_notify: null
        }
      },
      created: function () {
      }
    })

    Vue.prototype.notify = function (body = '', title = 'DFocus') {
      this.last = new Notification(title, {
          body: body
      })
    }
  },
}

export default Notify
