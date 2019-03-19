<template>
  <div id="app">
    <sui-dimmer :active="loading">
      <sui-loader size="mini">Loading</sui-loader>
    </sui-dimmer>

    <Navigation></Navigation>
      <div id="content">
        <transition name="fade" mode="out-in">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </transition>
      </div>
  </div>
</template>

<script>
  import Navigation from './components/Navigation'
  import Timer from './components/Timer'
  import { EventBus } from './libs/eventbus.ts'

  export default {
    name: 'dfocus',
    components: {
      'Navigation': Navigation,
      'Timer': Timer
    },
    data () {
      return {
        loading: false,
        count: 0,
        timeString: ''
      }
    },
    created () {
    },
    methods: {
      updateTime (stringTime) {
        this.$electron.ipcRenderer.send('updateTime', stringTime)
      }
    },
    watch: {
      '$route': function (value) {
        EventBus.$emit('route:change:to:' + value.name)
      }
    }
  }
</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }

  .extra-margin-right {
    margin-right: 20px !important;
  }

  .float.right {
    float: right;
  }

  .text-right {
    text-align: right !important;
  }

  .float::after {
    content: "";
    clear: both;
    display: table;
  }

  .text-center {
    text-align: center !important;
  }

  #content {
    padding-top: 30px;
  }

  div {
    /* border: 1px solid red; */
  }

  body {
    background-color: #222222 !important;
  }
</style>
