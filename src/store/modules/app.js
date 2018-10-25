import Cookies from 'js-cookie'
import store from '@/store'

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
    customClass: '',
    activePlugin: '',
    innerSidebar: false,
    nbiteration: 0,
    nprogress: 0,
    device: 'desktop',
    version: '0.1',
    lastClearInterval: null,
    lastLoading: new Date().getTime(),
    loading: true,
    language: Cookies.get('language') || 'en',
    size: Cookies.get('size') || 'medium'
  },
  getters: {
    isLoading(state) {
      console.error('is loading test')
      console.error(state)
      console.error('return ... loading of (isLoading?LOADING...) -> ', state.loading)
      return state.loading === true
    },
    inProgress(state) {
      return state.nprogress > 0
    }
  },
  mutations: {
    SET_CLASS: (state, val) => {
      state.customClass = val
    },
    TOGGLE_SIDEBAR: state => {
      console.error('toggle a')
      console.error(state.innerSidebar)
      if (state.innerSidebar === true) {
        if (state.sidebar.opened) {
          Cookies.set('sidebarStatus', 1)
        } else {
          Cookies.set('sidebarStatus', 0)
        }
        state.sidebar.opened = !state.sidebar.opened
        state.sidebar.withoutAnimation = false
      } else {
        console.error('toggle b')
        console.error('called toggle 1')
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
      console.error('close a')
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
      console.error('SET LOADING CALLED HERE (LOADING NOW) ->', val)
      state.loading = val
      console.error('NPROGRESS 1 - ADD ' + state.nprogress)
      state.nprogress++
      if (state.nprogress === 1) {
        // clearInterval(state.lastClearInterval)
        store.commit('NPROGRESS_END')
      }
    },
    SHOW_SIDEBAR: (state, withoutAnimation) => {
      console.error('toggle c')
      if (state.innerSidebar === true) {
        state.sidebar.visible = true
        state.sidebar.withoutAnimation = withoutAnimation
      } else {
        console.error('toggle d')
        state.mainsidebar.visible = true
        state.mainsidebar.withoutAnimation = withoutAnimation
      }
    },
    HIDE_SIDEBAR: (state, withoutAnimation) => {
      console.error('toggle e')
      if (state.innerSidebar === true) {
        state.sidebar.visible = false
        state.sidebar.withoutAnimation = withoutAnimation
      } else {
        console.error('toggle f')
        state.mainsidebar.visible = false
        state.mainsidebar.withoutAnimation = withoutAnimation
      }
    },
    TOGGLE_MAIN_SIDEBAR: state => {
      console.error('toggle g')
      state.mainsidebar.opened = !state.mainsidebar.opened
      state.mainsidebar.visible = !state.mainsidebar.visible
      state.mainsidebar.withoutAnimation = false
    },
    TOGGLE_MAIN_SIDEBAR_FORCE: state => {
      state.mainsidebar.opened = true
      state.mainsidebar.visible = true
      state.mainsidebar.withoutAnimation = false
    },
    TOGGLE_MAIN_SIDEBAR_OFF: state => {
      console.error('toggle g')
      console.error('toggle h')
      state.mainsidebar = new Date()
      state.mainsidebar.opened = false
      state.mainsidebar.visible = false
      state.mainsidebar.withoutAnimation = false
    },
    CLOSE_MAIN_SIDEBAR: (state, withoutAnimation) => {
      console.error('toggle i')
      Cookies.set('mainsidebarStatus', 1)
      state.mainsidebar.opened = false
      if (state.innerSidebar) {
        state.mainsidebar.visible = false
      }
      state.mainsidebar.withoutAnimation = withoutAnimation
    },
    SHOW_MAIN_SIDEBAR: (state, withoutAnimation) => {
      console.error('toggle w')
      state.mainsidebar.visible = true
      state.mainsidebar.withoutAnimation = withoutAnimation
    },
    HIDE_MAIN_SIDEBAR: (state, withoutAnimation) => {
      console.error('toggle ww')
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
      // console.error('toggle wwf')
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
      console.error('NPROGRESS ADD AGAIN (LOADING..)', state.nprogress + new Date().getTime())
      state.nprogress++
      clearInterval(state.lastClearInterval)
      try {
        window.NProgress.start()
      } catch (exx) {
        console.error(exx.stack)
      }
    },
    NPROGRESS_START(state) {
      //  done in set route instead... state.nprogress++
      console.error('calling start (LOADING AND )?' + state.nprogress + new Date().getTime())
      // if (!state.loading) {
      state.loading = true
      if (state.nprogress < 0) {
        console.error('calling start? set loading... and nprogress to 1 from ' + state.nprogress)
        state.nprogress = 1
      } else {
        // state.nprogress = 1
        state.nprogress++
        console.error('calling start? set loading... and nprogress to next now is' + state.nprogress)
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
        console.error('ZZZ receive dend here (LOADING) -> ... dispattching state.nprogress is ' + state.nprogress + new Date().getTime())
        self.commit('NPROGRESS_END', state)
      }, len)
    },
    NPROGRESS_END(state) {
      console.error('zzz3 receive dend here (LOADING) -> ... state.nprogress is ' + state.nprogress + new Date().getTime())
      if (state.lastClearInterval) {
        clearInterval(state.lastClearInterval)
      }
      // var lastNProgress = state.nprogress
      // if (--state.nprogress <= 0) {
      //  state.nprogress++ // lets re add it since we will remove it in the setinterval ...
      --state.nprogress
      setTimeout(function() {
        if (state.nprogress <= 0) {
          console.error('elss than zero (LOADING)')
          state.loading = false
          window.NProgress.done()
          console.error('aaacccc')
          clearInterval(state.lastClearInterval)
        } else {
          console.error('aaa')
          // state.lastClearInterval = setInterval(function() {
          // --state.nprogress
          setTimeout(function() {
            console.error('bbb ' + state.nprogress)
            // state.nprogress++
            state.nbiteration++
            if (state.nprogress <= 0) {
              console.error('fff3 receive dend here (LOADING) -> false')
              state.nbiteration = 0
              state.loading = false
              window.NProgress.done()
              clearInterval(state.lastClearInterval)
            } else {
              if (state.nbiteration >= 1000) {
                console.error('fff3 receive dend here (LOADING) -> false')
                state.nbiteration = 0
                state.loading = false
                window.NProgress.done()
                // clearInterval(state.lastClearInterval)
              }
            }
          }, 300) // 300 milliseconds is a good value, 300 seems to low in local dev ??
        }
      }, 100)
    },
    NPROGRESS_END_NOW(state) {
      console.error('2 - receive dend here')
      if (state.lastClearInterval) {
        console.error('ddd')
        clearInterval(state.lastClearInterval)
      }
      state.lastClearInterval = setInterval(function() {
        console.error('2- NPROGRESS LOWER HERE A', state.nprogress)
        if (--state.nprogress <= 0) {
          console.error('SET LOADING 1 receive dend here is 0 (LOADING) -> false')
          state.loading = false
          window.NProgress.done()
          console.error('eee')
          clearInterval(state.lastClearInterval)
        }
      }, 30)
    },
    SET_ROUTE_INFO(state, input) {
      console.error('SET LOADING to true 2 - received (LOADING) --> true ')
      state.loading = true
      state.lastLoading = new Date().getTime()
      console.error('NPROGRESS ADD new route AGAIN ', state.nprogress)
      state.nprogress++
      console.error('fff')
      clearInterval(state.lastClearInterval)
      console.error('route loading change info aaaa...')
    }
  },
  actions: {
    NPROGRESS_START({ state, commit }) {
      return new Promise((resolve, reject) => {
        console.error(state)
        commit('NPROGRESS_START')
        /*
        if (state.nprogress <= 0) {
          setTimeout(function() {
            console.error('start done')
            resolve(ff)
          }, 100)
        } else {
          resolve()
        }
        */
        resolve()
      })
    },
    NPROGRESS_END_DELAY({ state, commit }) {
      setTimeout(function() {
        console.error('AA receive dend here (LOADING) -> ... dispattching state.nprogress is ' + state.nprogress)
        commit('NPROGRESS_END')
      }, 150)
    },
    SET_ROUTE_INFO({ state, commit }, input) {
      console.error('in app route change info aaaa...')
      console.error(input)
      console.error(state)
      var hasClass = false
      if (input && input.to && input.to.meta && input.to.meta.hideMainMenu) {
        commit('HIDE_MAIN_SIDEBAR', state.hideMenu)
        commit('SHOW_INNER_SIDEBAR', state.hideMenu)
      } else {
        commit('SHOW_MAIN_SIDEBAR', state.hideMenu)
        commit('HIDE_INNER_SIDEBAR', state.hideMenu)
      }
      console.error('test class 1')
      if (input && input.to && input.to.meta && input.to.meta.showMenu) {
        state.activePlugin = input.to.meta.showMenu
        console.error('test class 2')
        if (input.to.meta.class) {
          console.error('test class 3')
          hasClass = input.to.meta.class
        }
      } else {
        state.activePlugin = ''
      }
      console.error('test class 4', hasClass)
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
