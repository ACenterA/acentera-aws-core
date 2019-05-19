import Cookies from 'js-cookie'
import { validateAccountId, performAppInitialization } from '@/api/app'

const staticAccountId = process.env.DEV_ACCOUNTID || ''

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      visible: true,
      withoutAnimation: false
    },
    mainsidebar: {
      opened: !+Cookies.get('mainsidebarStatus'),
      visible: true,
      withoutAnimation: false
    },
    ready: false,
    customClass: '',
    activePlugin: '',
    innerSidebar: false,
    nbiteration: 0,
    nprogress: 0,
    plugin: 0,
    device: 'desktop',
    version: '0.1',
    accountid: '',
    lastClearInterval: null,
    lastLoading: new Date().getTime(),
    loading: true,
    language: Cookies.get('language') || 'en',
    size: Cookies.get('size') || 'medium'
  },
  getters: {
    isLoading(state) {
      return state.loading === true
    },
    inProgress(state) {
      return state.nprogress > 0
    },
    isAccountIdSet(state) {
      if (staticAccountId !== '' && process.env.ENV_CONFIG !== 'prod') {
        return '' + state.accountid === '' + staticAccountId
      } else {
        return state.accountid > 0
      }
    }
  },
  mutations: {
    SET_READY: (state, val) => {
      state.ready = val
    },
    ADD_PLUGIN: (state, val) => {
      state.plugin = state.plugin + 1
    },
    // TODO Change this to Plugin Loaded X
    REMOVE_PLUGIN: (state, val) => {
      state.plugin = state.plugin - 1
      if (state.plugin === 0) {
        state.ready = true
      }
    },
    SET_ACTIVE_PLUGIN: (state, val) => {
      state.activePlugin = val
    },
    SET_ACCOUNT_ID: (state, val) => {
      state.accountid = val
    },
    SET_CLASS: (state, val) => {
      state.customClass = val
    },
    TOGGLE_SIDEBAR: state => {
      if (state.innerSidebar === true) {
        if (state.sidebar.opened) {
          Cookies.set('sidebarStatus', 1)
        } else {
          Cookies.set('sidebarStatus', 0)
        }
        state.sidebar.opened = !state.sidebar.opened
        state.sidebar.withoutAnimation = false
      } else {
        if (state.mainsidebar.opened) {
          Cookies.set('mainsidebarStatus', 1)
        } else {
          Cookies.set('mainsidebarStatus', 0)
        }
        state.mainsidebar.opened = !state.mainsidebar.opened
        state.mainsidebar.withoutAnimation = false
      }
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      // if (state.innerSidebar === true) {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
      /* } else {
        Cookies.set('mainsidebarStatus', 1)
        state.mainsidebar.opened = false
        state.mainsidebar.withoutAnimation = withoutAnimation
      }*/
    },
    SET_LOADING: (state, val) => {
      state.loading = val
      // NOV: state.nprogress++
      // if (state.nprogress === 1) {
      // clearInterval(state.lastClearInterval)
      //  store.commit('NPROGRESS_END')
      // }
    },
    SHOW_SIDEBAR: (state, withoutAnimation) => {
      if (state.innerSidebar === true) {
        state.sidebar.visible = true
        state.sidebar.withoutAnimation = withoutAnimation
      } else {
        state.mainsidebar.visible = true
        state.mainsidebar.withoutAnimation = withoutAnimation
      }
    },
    HIDE_SIDEBAR: (state, withoutAnimation) => {
      if (state.innerSidebar === true) {
        state.sidebar.visible = false
        state.sidebar.withoutAnimation = withoutAnimation
      } else {
        state.mainsidebar.visible = false
        state.mainsidebar.withoutAnimation = withoutAnimation
      }
    },
    TOGGLE_MAIN_SIDEBAR: state => {
      state.mainsidebar.opened = !state.mainsidebar.opened
      if (state.innerSidebar === true) {
        state.mainsidebar.visible = !state.mainsidebar.visible
      } else {
        /*
        if (state.mainsidebar.opened == true) {
          state.mainsidebar.visible = !state.mainsidebar.visible
        }
        */
      }
      state.mainsidebar.withoutAnimation = false
    },
    TOGGLE_MAIN_SIDEBAR_FORCE: state => {
      state.mainsidebar.opened = true
      state.mainsidebar.visible = true
      state.mainsidebar.withoutAnimation = false
    },
    TOGGLE_MAIN_SIDEBAR_OFF: state => {
      state.mainsidebar = new Date()
      state.mainsidebar.opened = false
      state.mainsidebar.visible = false
      state.mainsidebar.withoutAnimation = false
    },
    CLOSE_MAIN_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('mainsidebarStatus', 1)
      state.mainsidebar.opened = false
      if (state.innerSidebar) {
        state.mainsidebar.visible = false
      }
      state.mainsidebar.withoutAnimation = withoutAnimation
    },
    SHOW_MAIN_SIDEBAR: (state, withoutAnimation) => {
      state.mainsidebar.visible = true
      state.mainsidebar.withoutAnimation = withoutAnimation
    },
    HIDE_MAIN_SIDEBAR: (state, withoutAnimation) => {
      state.mainsidebar.visible = false
      state.mainsidebar.withoutAnimation = withoutAnimation
    },
    SHOW_INNER_SIDEBAR: (state, withoutAnimation) => {
      state.sidebar.opened = true
      state.sidebar.visible = true
      state.innerSidebar = true
      state.sidebar.withoutAnimation = withoutAnimation
    },
    HIDE_INNER_SIDEBAR: (state, withoutAnimation) => {
      state.innerSidebar = false
      state.sidebar.visible = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_LANGUAGE: (state, language) => {
      state.language = language
      Cookies.set('language', language)
    },
    SET_SIZE: (state, size) => {
      state.size = size
      Cookies.set('size', size)
    },
    NPROGRESS_START_LOADING(state) {
      //  done in set route instead... state.nprogress++
      state.nprogress++
      clearInterval(state.lastClearInterval)
      if (window.NProgress) {
        window.NProgress.start()
      }
    },
    NPROGRESS_START(state) {
      //  done in set route instead... state.nprogress++
      //  done in the dispatch function ... state.loading = true
      if (state.nprogress < 0) {
        state.nprogress = 1
      } else {
        // state.nprogress = 1
        state.nprogress++
      }
      // } else {
      // }
      try {
        window.NProgress.start()
      } catch (exx) {
        console.error(exx.stack)
      }
    },
    NPROGRESS_END_DELAY(state) {
      var self = this
      var len = 350
      if (state.nprogress >= 2) {
        len = 800
      }
      setTimeout(function() {
        self.commit('NPROGRESS_END', state)
      }, len)
    },
    NPROGRESS_END(state) {
      if (state.lastClearInterval) {
        clearInterval(state.lastClearInterval)
      }
      // var lastNProgress = state.nprogress
      // if (--state.nprogress <= 0) {
      //  state.nprogress++ // lets re add it since we will remove it in the setinterval ...
      --state.nprogress
      const oldProgress = state.nprogress
      setTimeout(function() {
        if (state.nprogress <= 0) {
          state.loading = false
          window.NProgress.done()
          clearInterval(state.lastClearInterval)
        } else {
          // state.lastClearInterval = setInterval(function() {
          // --state.nprogress
          setTimeout(function() {
            if (state.nprogress === oldProgress || state.nprogress < 0) {
              // state.nprogress++
              state.nbiteration++
              if (state.nprogress <= 0) {
                state.nbiteration = 0
                state.loading = false
                window.NProgress.done()
                clearInterval(state.lastClearInterval)
              } else {
                if (state.nbiteration >= 1000) {
                  state.nbiteration = 0
                  state.loading = false
                  window.NProgress.done()
                  // clearInterval(state.lastClearInterval)
                }
              }
            }
          }, 300) // 300 milliseconds is a good value, 300 seems to low in local dev ??
        }
      }, 100)
    },
    NPROGRESS_END_NOW(state) {
      /*
      if (state.lastClearInterval) {
        clearInterval(state.lastClearInterval)
      }*

      /*
      state.lastClearInterval = setInterval(function() {
        if (--state.nprogress <= 0) {
          state.loading = false
          window.NProgress.done()
          clearInterval(state.lastClearInterval)
        }
      }, 30)
      */
    },
    SET_ROUTE_INFO(state, input) {
      // state.loading = true
      state.lastLoading = new Date().getTime()
      // NOV: state.nprogress++
      clearInterval(state.lastClearInterval)
    }
  },
  actions: {
    NPROGRESS_START({ state, commit }) {
      return new Promise((resolve, reject) => {
        commit('NPROGRESS_START')
        commit('SET_LOADING', true)
        /*
        if (state.nprogress <= 0) {
          setTimeout(function() {
            resolve(ff)
          }, 100)
        } else {
          resolve()
        }
        */
        // setTimeout(function() {
        resolve()
        // },60)
      })
    },
    NPROGRESS_END_DELAY({ state, commit }) {
      setTimeout(function() {
        commit('NPROGRESS_END')
      }, 150)
    },
    SET_ROUTE_INFO({ state, commit }, input) {
      var hasClass = false
      if (input && input.to && input.to.meta && input.to.meta.hideMainMenu) {
        commit('HIDE_MAIN_SIDEBAR', state.hideMenu)
        commit('SHOW_INNER_SIDEBAR', state.hideMenu)
      } else {
        commit('SHOW_MAIN_SIDEBAR', state.hideMenu)
        commit('HIDE_INNER_SIDEBAR', state.hideMenu)
      }
      /*
      if (input && input.to) {
        if (input && input.to.meta && input.to.meta) {
        }
      }
      */
      var actplugin = null
      if (input && input.to && input.to.meta && input.to.meta.showMenu) {
        actplugin = input.to.meta.showMenu
        if (input.to.meta.class) {
          hasClass = input.to.meta.class
        }
      } else {
        actplugin = ''
      }
      commit('SET_ACTIVE_PLUGIN', actplugin)
      commit('SET_CLASS', hasClass)
    },
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    toggleMainSideBar({ commit }) {
      commit('TOGGLE_MAIN_SIDEBAR')
    },
    showMainSideBar({ commit }) {
      commit('SHOW_MAIN_SIDEBAR')
    },
    hideInnerSidebarForce({ commit }) {
      // No Inner Project Sidebar ...
      commit('HIDE_INNER_SIDEBAR')
      commit('SHOW_MAIN_SIDEBAR')
    },
    toggleMainSideBarForce({ commit }) {
      commit('TOGGLE_MAIN_SIDEBAR_FORCE')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    hideMainSideBar({ commit }, { withoutAnimation }) {
      commit('HIDE_MAIN_SIDEBAR', withoutAnimation)
    },
    closeMainSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_MAIN_SIDEBAR', withoutAnimation)
    },
    toggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    setLanguage({ commit }, language) {
      commit('SET_LANGUAGE', language)
    },
    setSize({ commit }, size) {
      commit('SET_SIZE', size)
    },
    showInnerSidebarForce({ commit }, sidebar) {
      commit('SHOW_SIDEBAR', sidebar)
    },
    showSidebar({ commit }, sidebar) {
      commit('SHOW_SIDEBAR', sidebar)
    },
    hideSidebar({ commit }, sidebar) {
      commit('HIDE_SIDEBAR', sidebar)
    },
    ValidateAccountIdSetup({ commit }, data) {
      // Lets validate if thet accountid match and if website has not been initialized yet ...
      return new Promise((resolve, reject) => {
        // TODO: Add some security such as signed url / random token in the web UI ?
        validateAccountId(data).then(response => {
          // This returns the list of plugins
          if (response && response.data) {
            commit('SET_ACCOUNT_ID', response.data.accountid)
            return resolve(response.data)
          } else {
            return resolve(null)
          }
        }).catch((ex) => {
          console.error(ex)
          resolve(null)
        })
      })
    },
    PerformAppInitialization({ commit }, data) {
      // Lets validate if thet accountid match and if website has not been initialized yet ...
      data['accountid'] = this.state.app.accountid
      var self = this

      return new Promise((resolve, reject) => {
        // TODO: Add some security such as signed url / random token in the web UI ?
        performAppInitialization(data).then(response => {
          // This returns the list of plugins
          if (response && response.data) {
            // commit('SET_ACCOUNT_ID', null)
            commit('SET_LOADING', false)
            window.preventLoop = false // ?? Hack see in settings ....
            self.dispatch('GetSiteSettings').then(res => { // Required for firstTime loging notification in login page and other plugins infos?
              return resolve(true)
            })
          } else {
            return resolve(false)
          }
        }).catch((ex) => {
          resolve(ex)
        })
      })
    },
    AddPlugin({ commit }, data) {
      commit('ADD_PLUGIN', 1)
    },
    ActivatePluginsLoaded({ commit }, data) {
      commit('REMOVE_PLUGIN', 1)
    },
    UserLoggedIn({ commit }, data) {
      //  var self = this
      /*
      return new Promise((resolve, reject) => {
        window.app.$store.dispatch('RefreshAllRoutes').then((re) => {
          resolve(re)
        })
      })
      */
    }
    /*
    RouteChange({ commit, state }, input) {
      commit('SET_LOADING', true)
    },
    RouteChangeReplaced({ commit, state }, input) {
      commit('SET_LOADING', true)
    }
    */
  }
}

export default app
