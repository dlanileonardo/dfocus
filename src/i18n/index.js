import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ptBR from './pt-br.json'
import enUS from './en.json'

const osLocale = require('os-locale')

Vue.use(VueI18n)

const messages = {
  'pt_BR': ptBR,
  'pt-BR': ptBR,
  'en_us': enUS,
  'en-US': enUS,
  'en': enUS
}

let i18n = new VueI18n({
  locale: 'en-US',
  fallbackLocale: 'en-us',
  messages
})

osLocale().then((data) => {
  i18n.locale = data
})

export default i18n
