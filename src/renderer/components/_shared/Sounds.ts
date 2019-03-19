// @ts-ignore
import Settings from './Settings.ts'

export default {
  mixins: [ Settings ],
  data () {
    return {
      timeout_callbacks: {
        ambiance: null,
        alert: null
      },
      ambiance: null,
      alert: null,
      default_settings: {
        loop: false,
        timer: false
      }
    }
  },
  methods: {
    clearTimeout (key) {
      if (this.timeout_callbacks[key]) {
        clearTimeout(this.timeout_callbacks[key])
      }
    },
    getRandom (key) {
      let items = this.settings[key]
      return items[Math.floor(Math.random() * items.length)]
    },
    smartPlay (event, type) {
      type = type === 'break' ? 'break' : 'pomodoro'
      let random_sound
      switch (event) {
        case 'start':
          random_sound = this.getRandom(type + '_musics')
          this.$emit('play-sound', 'music', random_sound, { loop: true })
          break
        case 'stop':
          this.$emit('play-stop', 'music')
          break
        case 'finished':
          this.$emit('play-stop', 'music')
          random_sound = this.getRandom(type + '_alerts')
          this.$emit('play-sound', 'alert', random_sound, { loop: false })
          break
        case 'done':
          break
        default:
          break
      }
    }
  },
  mounted () {
    this.$on('play-sound', (type, sound, settings) => {
      if (type === undefined || sound === undefined) { return false }

      settings = this.lodash.defaults(settings, this.default_settings)
      let that = this
      let key = type === 'alert' ? 'alert' : 'ambiance'
      let url = 'static/sounds/' + key + '/' + sound

      this.clearTimeout(key)

      if (this[key]) {
        this[key].setAttribute('src', url)
      } else {
        this[key] = new Audio(url)
      }

      this[key].currentTime = 0
      this[key].loop = settings.loop
      this[key].play()

      if (settings.timer) {
        this.timeout_callbacks[key] = window.setTimeout(() => {
          that.$emit('play-stop', type)
        }, settings.timer)
      }
    })

    this.$on('play-stop', (type) => {
      let key = type === 'alert' ? 'alert' : 'ambiance'

      this.clearTimeout(key)

      if (this[key]) {
        this[key].pause()
        this[key].currentTime = 0
      }
    })
  }
}
