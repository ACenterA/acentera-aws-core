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
      console.error('GETROUTEINFO TEST')
      console.error(state)
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
      console.error('route change info aaaa...')
      console.error(input)
      console.error(this)
      console.error(state)
      if (input && state) {
        state.from = input.from
        state.to = input.to
        console.error('set next value')
        console.error(input.next)
        state.next = input.next
      }
    },
    GetRouteInfo(state) {
      return new Promise((resolve, reject) => {
        console.error('a GETROUTEINFO TEST')
        console.error(state)
        return resolve(state)
      })
    },
    RouteNotAuthorized({ commit, state }, input) {
      console.error('route not authorized...')
    },
    RouteError({ commit, state }, input) {
      console.error('route error aaaa...')
    },
    RouteChange({ commit, state }, input) {
      console.error('route change aaaa...')
    },
    RouteChangeReplaced({ commit, state }, input) {
      console.error('route change replaced')
    },
    Ready({ commit, state }, input) {
      store.dispatch('GET_CREDENTIALS')
      console.error('route ready replaced')
    }
  }
}

export default plugin
