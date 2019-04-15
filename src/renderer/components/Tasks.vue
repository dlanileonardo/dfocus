<template>
  <sui-container id="tasks">

    <sui-segment basic>
      <sui-grid centered>
        <sui-grid-column :width="2" text-align="right">
          <sui-button compact :inverted="!configs.sidebar" color="orange" class="extra-margin" @click.native="sidebar()" icon="sidebar"></sui-button>
        </sui-grid-column>

        <sui-grid-column :width="12" class="filters">

          <div class="ui large label extra-margin">
            {{ $t(group_active.name) }}<div class="detail">{{list.length}}</div>
          </div>

          <div class="ui large label extra-margin">
            {{ $t('Show') }}<div class="detail">{{ $t(view_type) }}</div>
          </div>

        </sui-grid-column>

        <sui-grid-column :width="2" text-align="right">
          <sui-button compact inverted class="extra-margin" @click.native="toggle(false)" icon="plus"></sui-button>
        </sui-grid-column>

      </sui-grid>
    </sui-segment>

    <sui-message
      :key="message.id"
      v-for="message in messages"
      :header="message.header"
      :content="message.content"
      :error="message.error"
      :sucess="message.success"
      @click="handleDismiss(message)"
      >
    </sui-message>


    <sui-sidebar animation="push" direction="bottom" class="pointing inverted" :visible="configs.sidebar" width="very thin">
      <sui-menu-item>
       <div class="header" v-t="'Filter'"></div>
        <div class="menu pointing inverted secondary">
          <a
            is="sui-menu-item"
            v-for="item in submenu_group"
            :active="isActiveGroup(item)"
            :key="item.name"
            :content="item.name"
            @click="selectGroup(item)"
          />
        </div>
      </sui-menu-item>

      <sui-menu-item>
        <div class="header">Filter</div>
        <div class="menu pointing inverted secondary">
          <a
            is="sui-menu-item"
            :active="isActiveView('straight')"
            :content="$t('Straight')"
            @click="selectView('straight')"
          />
          <a
            is="sui-menu-item"
            :active="isActiveView('extended')"
            :content="$t('Extended')"
            @click="selectView('extended')"
          />
        </div>
      </sui-menu-item>

      <sui-menu-item>
        <sui-input icon="search" :placeholder="$t('Search')" v-model="configs.filter" />
      </sui-menu-item>
    </sui-sidebar>


    <transition-group class="list-items" name="list" tag="sui-grid">
      <sui-grid-column :width="16" :key="task._id" v-for="task in list">
          <sui-segment inverted>
            <sui-list divided inverted relaxed>
              <sui-list-item>

                <div class="right floated content">
                  <sui-icon name="coffee" v-if="task.break" class="extra-margin-right"></sui-icon>

                  <sui-label circular color="black" class="extra-margin-right" size="medium">
                    <sui-icon name="clock"></sui-icon>{{task.pomodoro_time}}
                  </sui-label>

                  <sui-label circular color="red" class="extra-margin-right" size="small">{{task.weight}}</sui-label>

                  <sui-button-group compact size="mini" icons>
                    <sui-button size="mini" compact icon="minus" :disabled="decreased(task)" @click="removeWeight(task)" />
                    <sui-button size="mini" compact icon="plus"  :disabled="increased(task)" @click="addWeight(task)" />
                  </sui-button-group>

                  <sui-button size="mini" color="green" negative icon="trash" @click="removeTask(task)" v-show="removable(task)" />
                  <sui-button size="mini" positive icon="check" @click="finishTask(task)" v-show="finishable(task)" />
                </div>

                <sui-list-content  @click.native="toggle(task)">
                  <p is="sui-list-header"><sui-input inverted :transparent="true" :value="task.name" /></p>

                  <div v-if="isExtended()">
                    <h4 class="ui horizontal inverted divider">Description</h4>
                    <span>{{task.updatedAt | moment("dddd, MMMM Do YYYY - HH:mm")}}</span>
                    <span is="sui-list-description" >
                      <p>{{task.description}}</p>
                    </span>
                  </div>
                </sui-list-content>

              </sui-list-item>
            </sui-list>
          </sui-segment>
      </sui-grid-column>
    </transition-group>

    <sui-modal v-model="open" basic>
      <sui-modal-header v-t="'Add a Task'"></sui-modal-header>
      <sui-modal-content>
        <sui-modal-description>
          <sui-form :error="errors.items.length > 0">
            <!-- <sui-segment> -->
              <sui-form-field :error="errors.collect('taskName').length > 0">
                <sui-input name="taskName" v-model="newTask.name" :placeholder="$t('Task Name')" :required="true" v-validate="'required'" />
              </sui-form-field>
              <sui-form-field :error="errors.collect('taskDescription').length > 0">
                <textarea namw="taskDescription" v-model="newTask.description" :placeholder="$t('Description')" :required="true"  rows="1"></textarea>
              </sui-form-field>
            <!-- </sui-segment> -->

            <sui-segment>
              <sui-form-fields :fields="1">
                <sui-form-field :error="errors.collect('taskPomodoros').length > 0">
                  <label>Pomodoros</label>
                  <sui-input name="taskPomodoros" type="number" v-model="newTask.weight" min="1" max="99" icon="layer-group" :required="true" data-vv-as="field" v-validate="'min_value:1'" />
                </sui-form-field>
                <sui-form-field>
                  <label v-t="'Pomodoro Time'"></label>
                  <sui-input  type="time" v-model="newTask.pomodoro_time" min="00:10" max="01:00" icon="clock" required />
                </sui-form-field>
              </sui-form-fields>
            </sui-segment>

            <sui-segment :disabled="canEditBreak()">
              <sui-form-fields :fields="1">
                <sui-form-field>
                  <label v-t="'Has Break?'"></label>
                  <div class="ui hack-checkbox fitted toggle checkbox">
                    <input type="checkbox" v-model="newTask.break">
                    <label></label>
                  </div>
                  <!-- <sui-icon class="ui float right" name="coffee"></sui-icon> -->
                </sui-form-field>

                <sui-form-field>
                  <label v-t="'Break Time'"></label>
                  <sui-input  type="time" :disabled="!newTask.break" v-model="newTask.break_time" min="00:05" max="01:00" icon="coffee" required />
                </sui-form-field>
              </sui-form-fields>

            </sui-segment>
          </sui-form>
        </sui-modal-description>
      </sui-modal-content>
      <sui-modal-actions>
        <sui-button positive @click.native="saveTask(newTask)" v-t="'Save'"></sui-button>
        <sui-button negative @click.native="toggle(false)" v-t="'Cancel'"></sui-button>
      </sui-modal-actions>
    </sui-modal>

  <!-- <sui-segment inverted><pre>{{newTask}}</pre></sui-segment> -->

  </sui-container>
</template>
<script>
export default {
  methods: {
    sidebar () {
      this.configs.sidebar = !this.configs.sidebar
    },
    isExtended () {
      return this.view_type === 'extended'
    },
    isActiveGroup (active) {
      return this.group_active.name === active.name
    },
    selectGroup (name) {
      this.group_active = name
      this.reloadItems()
    },
    isActiveView (active) {
      return this.view_type === active
    },
    selectView (type) {
      this.view_type = type
    },
    handleDismiss (message) {
      this.messages.pop(message)
    },
    canEditBreak () {
      return this.newTask.status !== 'created'
    },
    reloadItems  () {
      this.newTask = {
        name: '',
        description: '',
        weight: 1,
        status: 'created',
        pomodoro_time: '00:25',
        break: true,
        break_time: '00:10',
        actual_pomodoro: 1,
        running: false
      }
      let that = this
      this.$db.tasks.find({ status: { $in: this.group_active.status } }, (err, docs) => {
        that.tasks = docs
        if (err) { console.error(err) }
      })
    },
    saveTask (task = false) {
      this.$validator.validate().then(valid => {
        if (valid) {
          let that = this
          if (task._id) {
            this.update(task)
          } else {
            this.$db.tasks.insert(this.newTask, () => {
              that.update(task)
            })
          }
          this.toggle()
          this.reloadItems()
        } else {

        }
      })
    },
    removeTask (task) {
      this.$db.tasks.remove({ _id: task._id })
      this.reloadItems()
    },
    finishTask (task) {
      task.status = 'completed'
      this.update(task)
    },
    toggle (task = false) {
      if (task) { this.newTask = task }
      if (!task) { this.reloadItems() }
      this.open = !this.open
    },
    addWeight (task) {
      task.weight++
      this.update(task)
    },
    removeWeight (task) {
      task.weight--
      this.update(task)
    },
    decreased (task) {
      return task.weight <= 1 || task.weight <= task.actual_pomodoro || ['completed'].includes(task.status)
    },
    increased (task) {
      return ['completed'].includes(task.status)
    },
    removable (task) {
      return ['created', 'processed'].includes(task.status)
    },
    finishable (task) {
      return ['running', 'started'].includes(task.status)
    },
    update (task) {
      this.$db.tasks.update({ _id: task._id }, { $set: task })
      this.reloadItems()
    }
  },
  created () {
    this.reloadItems()
  },
  computed: {
    list: function () {
      const filter = this.configs.filter
      const regex = new RegExp(filter, 'i')
      return this.lodash.filter(this.tasks, task => regex.test(task.name) || regex.test(task.description))
    }
  },
  data () {
    return {
      configs: {
        filter: '',
        sidebar: false
      },
      submenu_group: [
        { name: this.$t('Pending'), status: ['created', 'started', 'processed'] },
        { name: this.$t('Completed'), status: ['completed'] }
      ],
      group_active: { name: 'Pending', status: ['created', 'started', 'processed'] },
      view_type: 'straight',
      open: false,
      newTask: { },
      tasks: [],
      done: [],
      messages: []
    }
  }
}
</script>
<style>
  .list-enter-active, .list-leave-active {
    transition: all 0.5s;
  }

  .list-enter, .list-leave-to /* .list-leave-active em versões anteriores a 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
  }

  .hack-checkbox {
    margin-top: 9px;
  }

  #tasks {
    margin-top: 5px;
  }

  #tasks .filters {
    text-align: center;
  }

  #tasks .filters .label {
    margin-top: 6px;
  }

  #tasks .ui.grid.list-items .column {
    padding-top: 0px;
    padding-bottom: 4px;
    /* margin-bottom: 15px; */
  }

  #tasks .ui.button.extra-margin {
    margin-top: 5px;
  }

  #tasks .ui.segment .right.floated.content button.negative,
  #tasks .ui.segment .right.floated.content button.positive {
    margin-left: 10px
  }

  #tasks .ui.segment .right.floated.content div {
    margin-right: 10px
  }

  #tasks .ui.ui.segment .description {
    padding: 10px;
  }
</style>
