const { app } = require('electron')

const path = require('path')

let window
var Helpers = {
  define: function (win) {
    window = win
  },
  send: function (slug) {
    window.webContents.send(slug)
  }
}

var exeName = path.basename(process.execPath).replace(/\.exe$/i, '')
global.appUserModelId = 'com.dlani.' + exeName

const plataform = {
  Helpers: Helpers
}

app.setAppUserModelId(global.appUserModelId)

export { plataform }
