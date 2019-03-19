<template>
  <sui-menu :inverted="true" :fixed="true">
    <router-link
      is="sui-menu-item"
      :key="comp.title"
      :to="comp"
      v-for="comp in route"
      replace
      :icon="comp.icon"
      :position="comp.position"
    >
    {{ $t(comp.title) }}
    </router-link>
  </sui-menu>
</template>
<script>
export default {
  data () {
    return {
      route: [
        {
          path: '/timer',
          title: 'Timer',
          icon: 'time'
        },
        {
          path: '/tasks',
          title: 'Tasks',
          icon: 'tasks'
        },
        {
          path: '/charts',
          title: 'Charts',
          icon: 'chart bar'
        },
        {
          path: '/settings',
          title: 'Settings',
          icon: 'settings',
          position: 'right'
        }
      ]
    }
  }
}
</script>


