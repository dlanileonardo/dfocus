<template>
  <sui-container id="settings">
    <sui-grid>
      <sui-grid-column :width="16">

      <sui-segment inverted>
        <sui-grid>
          <!-- <h3>Alerts</h3> -->

          <sui-grid-column :width="16">
            <sui-form-field>
              <label v-t="'Sound Alert Pomodoro when Finished'"></label>
              <sui-dropdown
                multiple
                fluid
                :options="alerts"
                :placeholder="$t('Pomodoro Alerts')"
                search
                selection
                v-model="settings.pomodoro_alerts"
              >
              </sui-dropdown>

            </sui-form-field>
          </sui-grid-column>

          <sui-grid-column :width="16">
            <sui-form-field>
              <label v-t="'Sound Alert Breaks when Finished'"></label>
              <sui-dropdown
                multiple
                fluid
                :options="alerts"
                :placeholder="$t('Break Alerts')"
                search
                selection
                v-model="settings.break_alerts"
              />
            </sui-form-field>
          </sui-grid-column>

        </sui-grid>

      </sui-segment>

      <sui-segment inverted>
        <sui-grid>
          <!-- <h3>Musics</h3> -->

          <sui-grid-column :width="16">
            <sui-form-field>
              <label v-t="'Musics in Pomodoro Activity'"></label>
              <sui-dropdown
                multiple
                fluid
                :options="musics"
                :placeholder="$t('Pomodoro Musics')"
                search
                selection
                v-model="settings.pomodoro_musics"
              >
              </sui-dropdown>

            </sui-form-field>
          </sui-grid-column>

          <sui-grid-column :width="16">
            <sui-form-field>
              <label v-t="'Musics in Break Activity'"></label>
              <sui-dropdown
                multiple
                fluid
                :options="musics"
                :placeholder="$t('Break Musics')"
                search
                selection
                v-model="settings.break_musics"
              />
            </sui-form-field>
          </sui-grid-column>

        </sui-grid>

      </sui-segment>

      <!-- <sui-segment inverted><pre>{{ settings }}</pre></sui-segment> -->

      </sui-grid-column>
    </sui-grid>

  </sui-container>
</template>
<script>
import Sounds from './_shared/Sounds.ts'

export default {
  name: 'settings',
  mixins: [ Sounds ],
  mounted () {
    this.reloadSettings()
    this.diff_pomodoro_alerts = []
  },
  watch: {
    'settings.pomodoro_alerts': function (val) {
      this.saveSettings()
      this.playSong('pomodoro', 'alert')
    },
    'settings.break_alerts': function (val) {
      this.saveSettings()
      this.playSong('break', 'alert')
    },
    'settings.pomodoro_musics': function (val) {
      this.saveSettings()
      this.playSong('pomodoro', 'music')
    },
    'settings.break_musics': function (val) {
      this.saveSettings()
      this.playSong('break', 'music')
    }
  },
  methods: {
    saveSettings () {
      localStorage.setItem('settings', JSON.stringify(this.settings))
    },
    playSong (kind, type) {
      if (this.loading_settings) { return false }
      this.$emit('play-stop', type)
      let key = kind + '_' + type + 's'
      let diff = this.lodash.difference(this.settings[key], this['diff' + key])
      if (diff.length > 0) {
        this.$emit('play-sound', type, diff[0], { timer: 10000 })
      }
      this['diff' + key] = this.settings[key]
    }
  },
  data () {
    return {
      alerts: [
        { text: 'Door Bell', value: 'Door Bell-SoundBible.com-1986366504.mp3' },
        { text: 'SMS Alert 1', value: 'sms-alert-1-daniel_simon.mp3' },
        { text: 'SMS Alert 2', value: 'sms-alert-3-daniel_simon.mp3' },
        { text: 'SMS Alert 3', value: 'sms-alert-4-daniel_simon.mp3' },
        { text: 'SMS Alert 4', value: 'sms-alert-5-daniel_simon.mp3' },
        { text: 'Bells Tibetan', value: 'bells-tibetan-daniel_simon.ogg' },
        { text: 'Final Fantasy VII - Victory', value: 'final-fantasy-vii-victory-fanfare-hq.ogg' },
        { text: 'Final Fantasy III - Victory', value: 'final-fantasy-iii-snes-music-victory-fanfare.ogg' }
      ],
      musics: [
        { text: 'Rain Storm', value: '45min_april_rainstorm-mike-koenig.mp3' },
        { text: 'Bird in Rain', value: 'Bird_in_Rain-Mike_Koenig-441535833.mp3' },
        { text: 'Final Fantasy V - Battle Theme', value: 'final-fantasy-v-snes-music-battle-theme.mp3' },
        { text: 'Meadowlark', value: 'meadowlark_daniel-simion.mp3' },
        { text: 'Final Fantasy VII - Battle Theme', value: 'final-fantasy-vii-fighting-hq.mp3' }
      ]
    }
  }
}
</script>
<style lang="css">
  #settings {
    margin-top: 20px;
  }
</style>
