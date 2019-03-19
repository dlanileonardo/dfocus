export default {
  data () {
    return {
      settings: {
        pomodoro_alerts: [],
        break_alerts: [],
        pomodoro_musics: [],
        break_musics: [],
        pomodoro_time: '00:25',
        break: true,
        break_time: '00:10'
      },
      loading_settings: 1
    }
  },
  methods: {
    reloadSettings () {
      if (localStorage.settings) {
        this.settings = JSON.parse(localStorage.settings)
      }
    }
  },
  mounted () {
    window.setTimeout(() => {
      this.loading_settings = 0
    }, 500)
  }
}
