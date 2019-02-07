import store from '@/store'
import { getSiteSettings } from '@/api/app.js'
import { getToken, getTokenLastRefresh, refreshToken } from '@/utils/auth'
import { getSettingsToken, setSettingsToken } from '@/utils/settings.js'
import { getSiteConfiguration } from '@/api/app'
import { Auth } from 'aws-amplify'

// import { ApolloLink } from 'apollo-link'
// import { ApolloLink, concat, split } from 'apollo-link'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
// import { InMemoryCache } from 'apollo-cache-inmemory'
// import { HttpLink } from 'apollo-link-http'

// import AWSAppSyncClient, { createLinkWithCache, createAppSyncLink } from 'aws-appsync'
// import AWSAppSyncClient, { createAppSyncLink, createLinkWithCache } from 'aws-appsync'
import AWSAppSyncClient, { createAppSyncLink } from 'aws-appsync'
// import { withClientState } from 'apollo-link-state'

const settings = {
  state: {
    isLoaded: false,
    allowRegister: false,
    recaptchaKey: '',
    mfaEnabled: false,
    firstTime: '',
    stage: '',
    missingSiteEntry: false,
    stackUrl: '',
    plugins: {}, // add plugin hash to load plugins if needed..
    apollo: null,
    graphql: {},
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
    },
    aws: {
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
    SET_STAGE: (state, stg) => {
      state.stage = stg
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
    SET_GRAPHQL: (state, graphql) => {
      state.graphql = graphql || state.graphql
      if (state.graphql && (state.graphql.url || state.graphql.URL)) {
        // This is the same cache you pass into new ApolloClient
        // const cache = new InMemoryCache()
        /*
        const stateLink = createLinkWithCache(cache => withClientState({
          cache,
          resolvers: {},
          // resolvers,
          // defaults
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'no-cache'
            }
          }
        }))
        if (cache != null) {
          console.error('no cache?')
        }
        */
        const getAccessToken = async function() {
          return new Promise(function(resolve, reject) {
            // const authMiddleware = new ApolloLink((operation, forward) => {
            // add the authorization to the headers
            var config = {}
            var tk = getToken()
            if (tk) {
              // With the User Token we have received, lets make sure to refresh the token
              // Every here and there ...
              // Submit another refresh Token to replace the current token ...
              var currentTime = Math.round(new Date().getTime() / 1000)
              try {
                if (getToken() !== undefined) {
                  var playload = JSON.parse(atob(getToken().split('.')[1]))
                  // var tokenExpirationTime = playload.exp
                  var tokenDuration = playload.exp - playload.iat
                  // Refresh token every X iterations 25% of expiration time
                  const refreshTime = tokenDuration * 25 / 100 // not really used

                  var refreshIfMinimumOf = tokenDuration - refreshTime
                  if (refreshIfMinimumOf <= 300) {
                    refreshIfMinimumOf = 300
                  }
                  if (refreshIfMinimumOf >= 3500) { // refresh minimum of 1hour
                    refreshIfMinimumOf = 3500
                  }
                  var lastTokenRefresh = getTokenLastRefresh()
                  if ((Math.abs(currentTime - lastTokenRefresh) >= 3000)) { // every hour for now, due to cognito
                    // Trigger a token Refresh in 5 seconds to avoid 401's and ensure user-activity?
                    // var currentTime = Math.round(new Date().getTime() / 1000)
                    // var playload = JSON.parse(atob(getToken().split('.')[1]))
                    // var tokenExpirationTime = playload.exp
                    // var tokenDuration = playload.exp - playload.iat
                    // Refresh token every X iterations 25% of expiration time
                    const refreshTime = tokenDuration * 25 / 100 // not really used

                    refreshIfMinimumOf = tokenDuration - refreshTime
                    if (refreshIfMinimumOf <= 300) {
                      refreshIfMinimumOf = 300
                    }
                    if (refreshIfMinimumOf >= 3500) { // refresh minimum of 1hour
                      refreshIfMinimumOf = 3500
                    }
                    lastTokenRefresh = getTokenLastRefresh()
                    if ((Math.abs(currentTime - lastTokenRefresh) >= 3000)) { // every hour for now, due to cognito
                      store.dispatch('GET_CREDENTIALS') // If Cognito make sure we have valid AWS Keys
                      return store.dispatch('UpdateRefreshTime', currentTime).then(() => {
                        // if ((tokenExpirationTime - currentTime) < refreshIfMinimumOf) {
                        refreshToken({ config: config }).then((r) => {
                          tk = getToken()
                          return resolve(tk)
                        })
                      })
                    }
                  }
                }
              } catch (er) {
                if (er) {
                  return resolve(tk)
                  // console.error(er)
                }
              }
            }
            return resolve(tk)
          })
        }

        const authMiddleware = setContext(async req => {
          const tk = await getAccessToken()
          return {
            headers: {
              'x-token': tk
            }
          }
        })

        const appSyncLink = createAppSyncLink({
          url: state.graphql.URL || state.graphql.url,
          region: state.graphql.REGION || state.graphql.region, // config.appsync.REGION,
          auth: {
            type: state.graphql.AUTH_TYPE || 'AWS_IAM', // 'AMAZON_COGNITO_USER_POOLS', // 'AWS_IAM', // AUTH_TYPE.AWS_IAM,
            credentials: () => Auth.currentCredentials()
            // type: 'AMAZON_COGNITO_USER_POOLS', // 'AWS_IAM', // AUTH_TYPE.AWS_IAM,
          },
          disableOffline: true
        },
        {
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'no-cache'
            }
          }
        })
        const link = ApolloLink.from([
          // stateLink,
          authMiddleware,
          appSyncLink
        ])

        const appSyncClient = new AWSAppSyncClient({}, { link })

        /*
        const appsyncProvider = new VueApollo({
          // link: concat(authMiddleware, appSyncClient),
          defaultClient: appSyncClient
        })
        */

        state.apollo = appSyncClient // appSyncClient // appsyncProvider
        // VuVue.use(VueApollo)
        window.Apollo = appSyncClient // appsyncProvider // .provide()
        // window.app.$apollo.client = appsyncProvider.provide()
        // this.$apollo =
        // Vue.Use(appsyncProvider.provide())
        // console.error(window.Apollo)
      }
    },
    SET_COGNITO: (state, cognito) => {
      try {
        console.error('set cognito to ...')
        console.error(cognito)
        state.aws = cognito || state.cognito || { s3: {}, apiGateway: {}, cognito: {}}
        state.cognito = cognito || state.cognito || { s3: {}, apiGateway: {}, cognito: {}}
        console.error('set cognito to ...')
        console.error(cognito)
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
        console.error('now set amplify to')
        console.error(config)
        if (config.cognito) {
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
        }
        /*
        var cognitoRegion = config.cognito.REGION
        // var idCreds = store.state.credentials.webIdentityCredentials.params
        var userPoolId = config.cognito.USER_POOL_ID
        var idpoolid =  config.cognito.IDENTITY_POOL_ID // store.state.settings.cognito.cognito.IDENTITY_POOL_ID
        var appClientId = config.cognito.APP_CLIENT_ID // stotre.state.settings.cognito.cognito.APP_CLIENT_ID

        //POTENTIAL: Region needs to be set if not already set previously elsewhere.
        AWS.config.region = cognitoRegion
        // AWS.config.credentials = new AWS.CognitoIdentityCredentials(idCreds)

        Auth.configure({
          region: cognitoRegion,
          userPoolId: userPoolId,
          identityPoolId: idpoolid,
          userPoolWebClientId: appClientId
        })
        console.error('authc onfigure done')
        console.error({
          region: cognitoRegion,
          userPoolId: userPoolId,
          identityPoolId: idpoolid,
          userPoolWebClientId: appClientId
        })
        */
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
      commit('SET_STAGE', data.stage)
      commit('SET_MISSING_SITE_ENTRY', data.missingSiteEntry)
      commit('SET_STACK_URL', data.stackUrl)
      // commit('SET_PLUGINS', data.plugins)
      commit('SET_MFA', data.mfaEnabled)
      commit('SET_COGNITO', data.aws || data.Aws || data.cognito || data.Cognito) // somehow its uppercase?
      if (data.aws && data.aws.graphql) {
        commit('SET_GRAPHQL', data.aws.graphql || data.graphql || data.Graphql) // somehow its uppercase?
      } else {
        commit('SET_GRAPHQL', data.graphql || data.Graphql) // somehow its uppercase?
      }
      setSettingsToken(data)
    },
    GetSiteConfiguration({ commit, state }) {
      return new Promise((resolve, reject) => {
        getSiteConfiguration(state.token).then(response => {
          // This returns the list of plugins
          if (response && response.data) {
            var Plugins = {}
            for (var k in response.data.plugins) {
              var tmpPlugin = response.data.plugins[k]
              Plugins[tmpPlugin.title] = tmpPlugin
            }
            commit('SET_PLUGINS', Plugins)
          }
          resolve(true)
        }).catch((ex) => {
          console.error(ex)
          resolve(ex)
        })
      })
    },
    GetSiteSettings({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.isLoaded || (window.preventLoop === true)) { // preventLoop not really works when using Uglify and chunks ?
          resolve('loaded')
        } else {
          window.preventLoop = true
          commit('SET_LOADED', true) // FORCE LOADED
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
            if (response && response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
              // Save app Settings ...
              const data = response.data
              console.error('updadtting site setting data using ...')
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
            console.error(err)
            // if (err) {
            //  console.error('could not refresh cache')
            // }
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
