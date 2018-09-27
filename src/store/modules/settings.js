import store from '@/store'
import { getSiteSettings } from '@/api/app.js'
import { getSettingsToken, setSettingsToken } from '@/utils/settings.js'
import { getSiteConfiguration } from '@/api/app'

const settings = {
  state: {
    isLoaded: false,
    allowRegister: false,
    recaptchaKey: '',
    mfaEnabled: false,
    firstTime: '',
    missingSiteEntry: false,
    stackUrl: '',
    plugins: {}, // add plugin hash to load plugins if needed..
    cognito: {
      s3: {
        REGION: 'YOUR_S3_UPLOADS_BUCKET_REGION',
        BUCKET: 'YOUR_S3_UPLOADS_BUCKET_NAME'
      },
      apiGateway: {
        REGION: 'YOUR_API_GATEWAY_REGION',
        URL: 'YOUR_API_GATEWAY_URL'
      },
      cognito: {
        REGION: '', // 'YOUR_COGNITO_REGION',
        USER_POOL_ID: '', // 'YOUR_COGNITO_USER_POOL_ID',
        APP_CLIENT_ID: '', // 'YOUR_COGNITO_APP_CLIENT_ID',
        IDENTITY_POOL_ID: '' // 'YOUR_IDENTITY_POOL_ID'
      }
    }
  },
  mutations: {
    SET_RECAPCHA_KEY: (state, recaptchaKey) => {
      state.recaptchaKey = recaptchaKey
    },
    SET_ALLOW_REGISTER: (state, allowRegister) => {
      state.allowRegister = allowRegister
    },
    SET_LOADED: (state, val) => {
      state.isLoaded = val
    },
    SET_FIRST_TIME: (state, firstTime) => {
      state.firstTime = firstTime
    },
    SET_MFA: (state, enable) => {
      state.mfaEnabled = enable
    },
    SET_PLUGINS: (state, plugins) => {
      state.plugins = plugins
    },
    SET_MISSING_SITE_ENTRY: (state, entry) => {
      state.missingSiteEntry = entry
    },
    SET_STACK_URL: (state, stackUrl) => {
      state.stackUrl = stackUrl
    },
    SET_COGNITO: (state, cognito) => {
      try {
        state.cognito = cognito || state.cognito || { s3: {}, apiGateway: {}, cognito: {}}

        if (!state.cognito.s3) {
          state.cognito.s3 = {}
        }

        if (!state.cognito.cognito) {
          state.cognito.cognito = {}
        }

        if (!state.cognito.apiGateway) {
          state.cognito.apiGateway = {}
        }

        const config = state.cognito
        window.Amplify.configure({
          Auth: {
            mandatorySignIn: true,
            region: config.cognito.REGION,
            userPoolId: config.cognito.USER_POOL_ID,
            identityPoolId: config.cognito.IDENTITY_POOL_ID,
            userPoolWebClientId: config.cognito.APP_CLIENT_ID
          },
          Storage: {
            region: config.s3.REGION,
            bucket: config.s3.BUCKET,
            identityPoolId: config.cognito.IDENTITY_POOL_ID
          },
          API: {
            endpoints: [
              {
                name: 'admin',
                endpoint: config.apiGateway.URL,
                region: config.apiGateway.REGION
              }
            ]
          }
        })
      } catch (ex) {
        if (ex) {
          console.error(ex)
        }
      }
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
      commit('SET_LOADED', true)
      commit('SET_RECAPCHA_KEY', data.recaptchaKey)
      commit('SET_ALLOW_REGISTER', data.allowRegister)
      commit('SET_FIRST_TIME', data.firstTime)
      commit('SET_MISSING_SITE_ENTRY', data.missingSiteEntry)
      commit('SET_STACK_URL', data.stackUrl)
      // commit('SET_PLUGINS', data.plugins)
      commit('SET_MFA', data.mfaEnabled)
      commit('SET_COGNITO', data.cognito || data.Cognito) // somehow its uppercase?

      setSettingsToken(data)
    },
    GetSiteConfiguration({ commit, state }) {
      return new Promise((resolve, reject) => {
        getSiteConfiguration(state.token).then(response => {
          console.error('received state config?')
          // This returns the list of plugins
          if (response && response.data) {
            console.error('plugins of')
            console.error(response.data)
            console.error(store)
            var Plugins = {}
            for (var k in response.data.plugins) {
              var tmpPlugin = response.data.plugins[k]
              Plugins[tmpPlugin.title] = tmpPlugin
            }
            commit('SET_PLUGINS', Plugins)
          }
          console.error(response)
          resolve(true)
        }).catch((ex) => {
          console.error(ex)
          resolve(ex)
        })
      })
    },
    GetSiteSettings({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.isLoaded) {
          resolve('loaded')
        } else {
          var data = getSettingsToken()
          var hasResolved = false
          if (data) {
            store.dispatch('UpdateSiteSettings', { data }).then(() => {
              hasResolved = true
              console.error('resolve here a')
              resolve('resolve')
            })
          }
          // We will update based on rest api if needed
          getSiteSettings().then(response => {
            console.error('get info')
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
          }).catch(err => {
            if (err) {
              console.error('could not refresh cache')
            }
            resolve()
          })
          /*

          */
        }
      })
    }
  }
}

export default settings
