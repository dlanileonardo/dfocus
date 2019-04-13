import Datastore from 'nedb'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\')
}

const { app, BrowserWindow, ipcMain, Tray } = require('electron')
const path = require('path')

const assetsDirectory = path.join(__static)

var os = require('os')
var nodeConsole = require('console')
var myConsole = new nodeConsole.Console(process.stdout, process.stderr)

let tray
let window

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

// Don't show the app in the doc
if (os.platform() === 'darwin') {
  app.dock.hide()
}

app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

let tasksCollection = new Datastore({ filename: path.join(app.getPath('userData'), 'DFocus/tasks.db'), autoload: true, timestampData: true })
let pomodoroCollection = new Datastore({ filename: path.join(app.getPath('userData'), 'DFocus/pomodoros.db'), autoload: true, timestampData: true })
let setingsCollection = new Datastore({ filename: path.join(app.getPath('userData'), 'DFocus/settings.db'), autoload: true, timestampData: true })

global.databases = {
  tasksCollection: tasksCollection,
  pomodoroCollection: pomodoroCollection,
  setingsCollection: setingsCollection
}

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'icon_16.png'))
  // tray.on('right-click', toggleWindow)
  // tray.on('click', toggleWindow)
  tray.setTitle('00:00')
  tray.setIgnoreDoubleClickEvents(true)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()
  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)
  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    // backgroundColor: "rgb(40, 40, 40)",
    // titleBarStyle: 'hidden',
    darkTheme: true,
    width: 550,
    height: 480,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    // transparent: true,
    icon: path.join(assetsDirectory, 'AppIcon.icns'),
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: true,
      nodeIntegration: true
    }
  })

  window.setVisibleOnAllWorkspaces(true)

  // window.setTouchBar(touchBar);

  window.loadURL(winURL)

  // Emitted when the window is closed.
  window.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    window = null
  })

  window.on('show', () => {
    tray.setHighlightMode('always')
  })

  window.on('hide', () => {
    tray.setHighlightMode('never')
  })

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })

  // window.openDevTools({mode: 'detach'})
}

const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  if (os.platform() === 'darwin') {
    window.setPosition(position.x, position.y, false)
  }
  window.show()
  window.focus()
}

ipcMain.on('updateTime', (event, timer) => {
  myConsole.log(timer)
  tray.setTitle(timer + '')
})

ipcMain.on('show-window', () => {
  showWindow()
})
