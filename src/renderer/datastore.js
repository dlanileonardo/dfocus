import { remote } from 'electron'
import Datastore from 'nedb'

const path = require('path')

// var tasksCollection = remote.getGlobal('databases').tasksCollection
// var settingsCollection = remote.getGlobal('databases').settingsCollection

let tasksCollection = new Datastore({ filename: path.join(remote.app.getPath('userData'), 'DFocus/tasks.db'), autoload: true, timestampData: true })
let pomodoroCollection = new Datastore({ filename: path.join(remote.app.getPath('userData'), 'DFocus/pomodoro.db'), autoload: true, timestampData: true })
let settingsCollection = new Datastore({ filename: path.join(remote.app.getPath('userData'), 'DFocus/settings.db'), autoload: true, timestampData: true })

export { tasksCollection, settingsCollection, pomodoroCollection }
