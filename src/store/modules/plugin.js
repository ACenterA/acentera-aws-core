import store from '@/store'

const plugin = {
  state: {
    from: '',
    to: '',
    next: null
  },
  mutations: {
  },
  getters: {
    GetRouteInfo(state) {
      return state
      /*
      return new Promise((resolve, reject) => {
        console.error('GETROUTEINFO TEST')
        console.error(state)
        return resolve(state)
      })
      // return state
      */
    }
  },
  actions: {
    SET_ROUTE_INFO({ state, commit }, input) {
      if (input && state) {
        state.from = input.from
        state.to = input.to
        state.next = input.next
      }
    },
    GetRouteInfo(state) {
      return new Promise((resolve, reject) => {
        return resolve(state)
      })
    },
    RouteNotAuthorized({ commit, state }, input) {
      // console.error('route not authorized...')
    },
    RouteError({ commit, state }, input) {
      // console.error('route error...')
    },
    RouteChange({ commit, state }, input) {
      // console.error('route change...')
    },
    RouteChangeReplaced({ commit, state }, input) {
      // console.error('route change replaced')
    },
    Ready({ commit, state }, input) {
      store.dispatch('GET_CREDENTIALS')
    }
  }
}

export default plugin
