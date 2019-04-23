const { app, ipcMain, TouchBar } = require('electron')

const path = require('path')

const { TouchBarLabel, TouchBarGroup, TouchBarButton, TouchBarSpacer } = TouchBar

const assetsDirectory = path.join(__static)

app.dock.hide()

let window
var Helpers = {
  define: function (win) {
    window = win
  },
  send: function (slug) {
    window.webContents.send(slug)
  }
}

// Spin button
const Play = new TouchBarButton({
  // label: 'Play',
  icon: path.join(assetsDirectory, 'touchbar', 'play.png'),
  backgroundColor: '#2185D1',
  click: () => {
    Helpers.send('play-timer')
  }
})

const Done = new TouchBarButton({
  // label: '︎Done',
  icon: path.join(assetsDirectory, 'touchbar', 'done.png'),
  backgroundColor: '#20BA45',
  click: () => {
    Helpers.send('done-timer')
  }
})

const Pause = new TouchBarButton({
  // label: '︎Pause',
  icon: path.join(assetsDirectory, 'touchbar', 'pause.png'),
  backgroundColor: '#D12626',
  click: () => {
    Helpers.send('pause-timer')
  }
})

const clock = new TouchBarLabel({
  label: '00:00',
  textColor: 'white'
})

ipcMain.on('updateTime', (event, timer) => {
  // myConsole.log(timer)
  clock.label = timer
})

const touchBarControls = new TouchBarGroup({
  items: [Play, Done, Pause]
})

const touchBar = new TouchBar([
  touchBarControls,
  new TouchBarSpacer({ size: 'small' }),
  clock,
  new TouchBarSpacer({ size: 'small' })
])

const plataform = {
  touchBar: touchBar,
  Helpers: Helpers
}

export { plataform }
