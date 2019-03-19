<template>
  <sui-container id="timer">
    <!-- <sui-dimmer active :inverted="false"/> -->
    <sui-segment basic>
      <div class="ui two column centered grid">
        <div class="column">
            <sui-dropdown
              v-on:click="reloadTask()"
              button
              :loading="loading_tasks"
              :disabled="timer_running"
              class="icon scrolling small"
              icon="tasks"
              labeled
              :options="tasks"
              :placeholder="texts.dropdown.placeholder"
              :text="texts.dropdown.placeholder"
              v-model="selected_task"
              :menu-header="menuHeader"
              :search-in-menu="searchInMenu"
            />
        </div>
        <div class="column text-right">
          <span>
            <sui-icon :color="indicator.color" class="circular extra-margin-right" :name="indicator.name"></sui-icon>
            <sui-label class="label-of" circular color="blue" size="large">{{task.actual_display}} of {{task.weight}}</sui-label>
          </span>
        </div>
      </div>
    </sui-segment>

    <div class="ui grid">
      <div class="sixteen wide column">
        <flip-clock ref="flipclock" :options="options" />
      </div>

      <div class="sixteen wide column centered row">
        <div class="column centered text-center">
          <sui-button @click="start" :content="texts.buttons.start" label-position="left" class="tiny" :disabled="timer_running" icon="play" :primary="true"></sui-button>
          <sui-button @click="done" :content="texts.buttons.done" label-position="left" class="tiny" :disabled="!timer_started" icon="check" :positive="true"></sui-button>
          <sui-button @click="pause" :content="texts.buttons.pause" label-position="left" class="tiny" :disabled="!timer_running" icon="pause" :negative="true"></sui-button>
        </div>
      </div>
    </div>

    <sui-grid>
      <sui-grid-column :width="16">
        <sui-segment inverted>
          <h3 class="ui centered header dash_header" v-t="'Performance Info'"></h3>
          <div class="ui divider"></div>
          <p v-for="info in tasks_info.status" :key="info.name">
            {{ $t(info.name) }}
            <sui-label circular :color="info.color" class="float right" size="small">{{info.count}}</sui-label>
          </p>
          <p>
            <sui-progress indicating inverted state="active" :label="tasks_info.label" :percent="tasks_info.percent" />
          </p>
        </sui-segment>
      </sui-grid-column>
    </sui-grid>

    <!-- <div class="ui grid">
      <div class="sixteen wide centered column row" v-if="selected_task">
        <sui-step-group size="mini" unstackable>
          <sui-step
            :completed="task.task_completed"
            :active="task.running"
            :title="task.name"
            icon="tasks" />
          <sui-step
            :completed="task.break_completed"
            :active="task.breaking"
            title="Break"
            icon="coffee" />
         </sui-step-group>
      </div>
    </div> -->

    <!-- <div class="ui grid">
      <div class="sixteen wide column row">
        <pre>pomodoro_info: {{pomodoro_info}}</pre>
      </div>
      <div class="sixteen wide column row">
        <pre>task: {{task}}</pre>
      </div>
      <div class="sixteen wide column row">
        <pre>options: {{options}}</pre>
      </div>
    </div> -->

    <!-- <sui-segment inverted><pre>{{pomodoro_info}}</pre></sui-segment> -->
    <!-- <sui-segment inverted><pre>{{task}}</pre></sui-segment> -->

  </sui-container>
</template>
<script>
  import { FlipClock } from '@mvpleung/flipclock'
  import Sounds from './_shared/Sounds.ts'
  import { EventBus } from '../libs/eventbus.ts'

  export default {
    name: 'timer',
    components: { FlipClock },
    mixins: [ Sounds ],
    mounted () {
      this.init()
    },
    created () {
      let that = this
      EventBus.$on('route:change:to:timer', () => {
        that.init()
      })
    },
    data () {
      let that = this
      return {
        texts: {
          dropdown: {
            placeholder: this.$t('Select Task')
          },
          buttons: {
            start: this.$t('Start'),
            done: this.$t('Done'),
            pause: this.$t('Pause')
          }
        },
        debounceReloadPomodoroInfo: that.lodash.debounce(() => {
          that.task.status = 'processed'
          that.udateTask(that.task)
          that.reloadPomodorosInfo()
        }, 500),
        menuHeader: {
          icon: '',
          content: 'Header'
        },
        searchInMenu: {
          icon: 'search',
          iconPosition: 'left'
        },
        indicator: { name: 'hourglass', color: 'blue' },
        tasks: [],
        loading_tasks: true,
        selected_task: null,
        last_selected_task: null,
        timer_started: false,
        timer_running: false,
        percent: 0,
        init_auto: true,
        pomodoro_info: { count_total: 0, actual_pomodoro: {} },
        task: { name: 'Do Something', weight: 1, elapsed: 0, pomodoros: {}, actual_pomodoro: 1, actual_display: 1 },
        tasks_info: {
          percent: 0,
          label: '0% Completed',
          color: 'red',
          status: [
            {
              name: 'Pending',
              status: ['created', 'pending', 'started', 'processed'],
              color: 'orange',
              count: 0
            },
            {
              name: 'Completed',
              status: ['completed'],
              color: 'green',
              count: 0
            }
          ]
        },
        options: {
          autoPlay: true,
          autoStart: false,
          digit: 60 * 25,
          countdown: true,
          // clockFace: 'MinuteCounter',
          callbacks: {
            start: function () {
              // console.log(this)
            },

            stop: function () {
              // console.log(this.digit)
            },

            reset: function () {
              // console.log(this.digit)
            },

            interval: function () {
              that.$parent.count = this.count
              let secs = that.options.digit - this.count
              that.task.elapsed = this.count
              let stringTime = that.$moment.utc(secs * 1000).format('mm:ss')
              that.$parent.updateTime(stringTime)
              that.udateElapsed(this.count)
              if (secs === 60) { that.notify('Falta 1 Minuto', 'Terminando') }
              if (secs <= 0) { that.finished() }
            }
          }
        }
      }
    },
    methods: {
      init () {
        this.reloadItems()
        this.reloadTask()
        this.reloadTasksInfo()
        this.reloadSettings()
      },
      autoPauseOnInit () {
        if (this.init_auto && this.task.running) {
          this.pause()
        }
        this.init_auto = false
      },
      createOrNothingPomodoros () {
        let that = this
        let qty = that.task.break ? that.task.weight * 2 : that.task.weight
        if (that.pomodoro_info.count_total < qty) {
          let pomodorosToInsert = []
          that.$db.pomodoros.remove({ locked: { $ne: true } }, { multi: true }, () => {
            for (let index = that.pomodoro_info.count_total; index < qty; index++) {
              let type = 'pomodoro'
              if (that.task.break) {
                type = ((index + 1) % 2) === 0 ? 'break' : type
              }
              let time = type === 'pomodoro' ? that.task.pomodoro_time : that.task.break_time
              pomodorosToInsert.push({
                task_id: that.task._id,
                type: type,
                time: time,
                order: index
              })
            }
            that.$db.pomodoros.insert(pomodorosToInsert, (err, docs) => {
              if (err === null) {
                that.debounceReloadPomodoroInfo()
              }
            })
          })
        }
      },
      reloadTasksInfo () {
        let that = this
        this.tasks_info.status.map((value) => {
          that.$db.tasks.count({ status: { $in: value.status } }, (err, count) => {
            if (err) { console.error(err) }
            value.count = count

            let total = that.tasks_info.status[0].count + that.tasks_info.status[1].count
            let percent = Math.round((that.tasks_info.status[1].count / total) * 100)
            that.tasks_info.percent = isNaN(percent) ? 0 : percent
            that.tasks_info.label = that.tasks_info.percent + '% ' + this.$t('Completed')
          })
        })
      },
      reloadPomodorosInfo () {
        let that = this
        if (!that.task._id) { return this.createBlank() }
        that.$db.pomodoros.find({ task_id: that.task._id }).sort({ order: 1 }).exec((err, docs) => {
          if (err) { console.error(err) }
          that.pomodoro_info.count_total = docs.length
          that.pomodoro_info.actual_pomodoro = docs[that.task.actual_pomodoro - 1]

          if (that.task.status === 'running' && that.task.actual_pomodoro > that.pomodoro_info.count_total) {
            that.task.status = 'completed'
          }

          that.createOrNothingPomodoros()

          // if ( that.task.actual_pomodoro )
          if (that.pomodoro_info.actual_pomodoro) {
            that.timer_running = that.pomodoro_info.actual_pomodoro.task_running
            that.pomodoro_info.actual_pomodoro.elapsed = that.pomodoro_info.actual_pomodoro.elapsed ? that.pomodoro_info.actual_pomodoro.elapsed : 0
            that.options.digit = (that.$moment.duration(that.pomodoro_info.actual_pomodoro.time).asSeconds() - parseFloat(that.pomodoro_info.actual_pomodoro.elapsed))
            that.indicator = that.pomodoro_info.actual_pomodoro.type === 'pomodoro' ? { name: 'hourglass', color: 'blue' } : { name: 'coffee', color: 'green' }
          }

          this.task.actual_display = this.task.break ? Math.ceil(this.task.actual_pomodoro / 2) : this.task.actual_pomodoro
          that.autoPauseOnInit()
        })
      },
      canDone () {
        if (this.options.digit === 0) {
          return true
        }
      },
      createBlank () {
        this.task = { name: 'Do Something', weight: 1, elapsed: 0, pomodoros: {}, actual_pomodoro: 1, actual_display: 1 }
        this.pomodoro_info = { count_total: 0, actual_pomodoro: {} }
      },
      reloadTask () {
        let that = this
        if (this.last_selected_task === this.selected_task) { return false }
        this.$db.tasks.findOne({ _id: this.selected_task }, (err, docs) => {
          if (err) { console.error(err); return false }
          if (!docs) { return false }
          that.task = docs
          this.task.actual_display = this.task.break ? Math.ceil(this.task.actual_pomodoro / 2) : this.task.actual_pomodoro
          this.task.elapsed = this.task.elapsed ? this.task.elapsed : 0
          this.$refs.flipclock.reset(this.options)
          // this.$db.pomodoros.remove({ }, { multi: true }, () => {
          that.reloadPomodorosInfo()
          // })
        })
        this.last_selected_task = this.selected_task
      },
      reloadItems () {
        this.loading_tasks = true
        this.newTask = { name: '', description: '', weight: 1, pomodoro: '00:25' }
        let that = this

        return this.$db.tasks.find({ status: { $ne: 'completed' } }, (err, docs) => {
          if (err) { console.error(err); return false }

          let items = this.lodash.map(docs, (item, key) => {
            return {
              key: item._id,
              value: item._id.toString(),
              text: item.name
              // label: { color: 'red', empty: true, circular: true }
            }
          })
          that.tasks = items
          this.loading_tasks = false

          if (that.selected_task === null && docs.length > 0) {
            that.selected_task = docs[0]._id
            that.reloadTask()
          }
        })
      },
      updatePomodoro () {
        this.$db.pomodoros.update({ _id: this.pomodoro_info.actual_pomodoro._id }, { $set: this.pomodoro_info.actual_pomodoro }, (err, doc) => {
          if (err) { console.error(err) }
        })
      },
      udateTask (task) {
        this.$db.tasks.update({ _id: task._id }, { $set: task }, (err, doc) => {
          if (err) { console.error(err) }
        })
      },
      udateElapsed (elapsed) {
        if (this.task._id && elapsed > 0) {
          this.$db.tasks.update({ _id: this.task._id }, { $set: { elapsed: elapsed } }, (err, doc) => {
            if (err) { console.error(err) }
            this.pomodoro_info.actual_pomodoro.elapsed = elapsed
            this.updatePomodoro()
          })
        }
      },
      finished () {
        this.smartPlay('finished', this.pomodoro_info.actual_pomodoro.type)
      },
      done () {
        this.smartPlay('stop', this.pomodoro_info.actual_pomodoro.type)
        this.smartPlay('done', this.pomodoro_info.actual_pomodoro.type)
        this.task.actual_pomodoro++
        this.timer_running = false
        this.timer_started = false
        this.$refs.flipclock.reset(this.options)
        this.udateTask(this.task)
        this.reloadPomodorosInfo()
      },
      start () {
        this.smartPlay('start', this.pomodoro_info.actual_pomodoro.type)
        this.pomodoro_info.actual_pomodoro.locked = true
        this.task.running = true
        this.task.status = 'started'
        this.timer_started = true
        this.timer_running = true
        this.$refs.flipclock.start()
        this.udateTask(this.task)
      },
      pause () {
        this.smartPlay('stop', this.pomodoro_info.actual_pomodoro.type)
        this.$emit('play-stop', 'pause')
        this.task.running = false
        this.timer_running = false
        this.$refs.flipclock.stop()
        this.udateTask(this.task)
      }
    }
  }
</script>
<style src="./Timer/flipclock.css"></style>
<style>
  #timer {
    margin-top: 10px;
  }
  #timer .label-of {
    margin-top: 4px;
  }
</style>
