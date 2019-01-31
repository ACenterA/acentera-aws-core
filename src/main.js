import Vue from 'vue'
import VueApollo from 'vue-apollo'
import Vuetify from 'vuetify'

// # Importing jQuery for plugin load... temp addition
window.$ = require('jquery')
window.JQuery = require('jquery')
window._ = require('underscore')
window.select = require('select.js')

const fixConsoleLog = {
  log: function() {

  },
  error: function() {

  }
}

window.plugin_loaded = 0

Vue.use(Vuetify, {
  // theme: {
  //   primary: colors.indigo.base, // #E53935
  //   secondary: colors.indigo.lighten4, // #FFCDD2
  //   accent: colors.indigo.base // #3F51B5
  // },
  options: {
    themeVariations: ['primary', 'secondary', 'accent'],
    extra: {
      mainToolbar: {
        color: 'primary'
      },
      sideToolbar: {
      },
      sideNav: 'primary',
      mainNav: 'primary lighten-1',
      bodyBg: ''
    }
  }
})
window.console = window.console || fixConsoleLog

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

//global registration
import VueFormWizard from 'vue-form-wizard'
import 'vue-form-wizard/dist/vue-form-wizard.min.css'
Vue.use(VueFormWizard)

import i18n from './lang' // Internationalization
import './icons' // icon
import './errorLog' // error log
import './permission' // permission control
// do not import './mock' // simulation data

// Import Amplify aws
import Amplify from 'aws-amplify'
// import aws_exports from '@/aws-exports'
// Amplify.Logger.LOG_LEVEL = 'DEBUG' // to show detailed logs from Amplify library
// Amplify.configure(aws_exports)
window.Amplify = Amplify

import * as filters from './filters' // global filters

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

const apolloProvider = new VueApollo({
  clients: {
    acentera: function() {
      return window.Apollo // store.$getters.ap
    }
  },
  defaultClient: function() {
    () => {
    }
  }
})

Vue.use(VueApollo)

const app = new Vue({
  el: '#app',
  router,
  store,
  apolloProvider,
  i18n,
  render: h => h(App)
})
window.app = app
