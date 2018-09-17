import store from '@/store'
import { getSiteSettings } from '@/api/app.js'
import { getSettingsToken, setSettingsToken } from '@/utils/settings.js'

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
        REGION: 'us-east-1', // 'YOUR_COGNITO_REGION',
        USER_POOL_ID: 'us-east-1_wCUctuupQ', // 'YOUR_COGNITO_USER_POOL_ID',
        APP_CLIENT_ID: '1v25fnqa2tve7cj48a665pj4o0', // 'YOUR_COGNITO_APP_CLIENT_ID',
        IDENTITY_POOL_ID: 'us-east-1:8cd5d86c-246e-4f9b-bd82-a67f42d18e66' // 'YOUR_IDENTITY_POOL_ID'
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
    SET_PLUGINS: (state, plugins) => {
      state.plugins = plugins
      console.error('saving state of')
      console.error(state)
      console.error(state.plugins)
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
    },
    SET_COGNITO: (state, cognito) => {
      try {
        state.cognito = cognito || state.cognito || { s3: {}, apiGateway: {}, cognito: {}}
        console.error('got cognito a')
        console.error(state.cognito)

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
        console.error(ex.stack)
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
      console.error('receieved update site stettings')
      console.error(commit)
      console.error(data)
      commit('SET_LOADED', true)
      commit('SET_RECAPCHA_KEY', data.recaptchaKey)
      commit('SET_ALLOW_REGISTER', data.allowRegister)
      commit('SET_FIRST_TIME', data.firstTime)
      commit('SET_MISSING_SITE_ENTRY', data.missingSiteEntry)
      commit('SET_STACK_URL', data.stackUrl)
      console.error('RECIEVED SETTINGS PLUGIN A')
      console.error(data)
      commit('SET_PLUGINS', data.plugins)

      commit('SET_COGNITO', data.cognito)

      setSettingsToken(data)
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
        }
      })
    }
  }
}

export default settings
