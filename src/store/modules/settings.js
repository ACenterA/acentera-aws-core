import store from '@/store'
import { getSiteSettings } from '@/api/app.js'
import { getSettingsToken, setSettingsToken } from '@/utils/settings.js'

const settings = {
  state: {
    allowRegister: false,
    recaptchaKey: '',
    mfaEnabled: false,
    firstTime: '',
    missingSiteEntry: false,
    stackUrl: ''
  },

  mutations: {
    SET_RECAPCHA_KEY: (state, recaptchaKey) => {
      state.recaptchaKey = recaptchaKey
    },
    SET_ALLOW_REGISTER: (state, allowRegister) => {
      state.allowRegister = allowRegister
    },
    SET_FIRST_TIME: (state, firstTime) => {
      state.firstTime = firstTime
    },
    SET_MISSING_SITE_ENTRY: (state, entry) => {
      console.error('stateu  is ')
      console.error(state)
      console.error(this)
      console.error('Updating entry to  ' + entry)
      state.missingSiteEntry = entry
    },
    SET_STACK_URL: (state, stackUrl) => {
      state.stackUrl = stackUrl
    }
  },
  actions: {
    loginDisableFirstTime({ commit, state }, input) {
      commit('SET_FIRST_TIME', false)
      // TODO: Should we save the cookie ?
      setSettingsToken(state)
    },
    UpdateSiteSettings({ commit, state }, input) {
      var data = input.data || input
      console.error('receieved update site stettings')
      console.error(commit)
      console.error(data)
      commit('SET_RECAPCHA_KEY', data.recaptchaKey)
      commit('SET_ALLOW_REGISTER', data.allowRegister)
      commit('SET_FIRST_TIME', data.firstTime)
      commit('SET_MISSING_SITE_ENTRY', data.missingSiteEntry)
      commit('SET_STACK_URL', data.stackUrl)
      console.error('recieved et site settings...BZZ')
      console.error(data)
      setSettingsToken(data)
    },
    GetSiteSettings({ commit, state }) {
      return new Promise((resolve, reject) => {
        var data = getSettingsToken()
        var hasResolved = false
        if (data) {
          store.dispatch('UpdateSiteSettings', { data }).then(() => {
            hasResolved = true
            resolve('resolve')
          })
        }
        // We will update based on rest api if needed
        getSiteSettings().then(response => {
          console.error('recieved et site settings...B')
          if (response && response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            // Save app Settings ...
            const data = response.data
            store.dispatch('UpdateSiteSettings', { data }).then(() => { // 根据roles权限生成可访问的路由表
              if (!hasResolved) {
                hasResolved = true
                resolve('resolve fetch')
              }
            })
          }
          if (!hasResolved) {
            resolve('forced_no_internet_or_cookies')
          }
        })
        /*
        .catch(err => {
          if (err) {
            console.error('could not refresh cache')
          }
        })
        */
      })
    }
  }
}

export default settings
