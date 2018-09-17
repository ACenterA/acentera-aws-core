import Cookies from 'js-cookie'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      visible: true,
      withoutAnimation: false
    },
    device: 'desktop',
    version: '0.1',
    language: Cookies.get('language') || 'en',
    size: Cookies.get('size') || 'medium'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        console.error('set opened')
        Cookies.set('sidebarStatus', 1)
      } else {
        console.error('set set closed')
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    SHOW_SIDEBAR: (state, withoutAnimation) => {
      console.error('show sidebbar')
      console.error('set state to visible..')
      state.sidebar.visible = true
      state.sidebar.withoutAnimation = withoutAnimation
    },
    HIDE_SIDEBAR: (state, withoutAnimation) => {
      console.error('hide sidebbar')
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
    }
  },
  actions: {
    toggleSideBar({ commit }) {
      console.error('commit toggle sidebar')
      commit('TOGGLE_SIDEBAR')
    },
    closeSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
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
    showSidebar({ commit }, sidebar) {
      commit('SHOW_SIDEBAR', sidebar)
    },
    hideSidebar({ commit }, sidebar) {
      commit('HIDE_SIDEBAR', sidebar)
    }
  }
}

export default app
