// import store from '@/store'

const route = {
  state: {
    isLoaded: false
  },
  mutations: {
  },
  actions: {
    RouteChange({ commit, state }, input) {
      console.error('route change aaaa...')
    },
    RouteChangeReplaced({ commit, state }, input) {
      console.error('route change replaced')
    },
    Ready({ commit, state }, input) {
      console.error('route ready replaced')
    }
  }
}

export default route
