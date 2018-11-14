import axios from 'axios'
import localforage from 'localforage'
import router from '@/router'
import { setupCache } from 'axios-cache-adapter'

// import { Message } from 'element-ui'
import store from '@/store'
import { getToken, refreshToken, getTokenLastRefresh } from '@/utils/auth'
import { getVersion } from '@/utils/settings'

/*
const config = { headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}};
const { data } = await axios.get('http://www.youraddress.com/api/data.json', config);
*/

const localCacheStore = localforage.createInstance({
  // List of drivers used
  driver: [
    localforage.INDEXEDDB,
    localforage.LOCALSTORAGE
  ],
  // Prefix all storage keys to prevent conflicts
  name: 'admin-rest-cache'
})

const cache = setupCache({
  maxAge: 15 * 60 * 1000,
  debug: true,
  localCacheStore
})

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 55000 // request timeout
})

const cachedService = axios.create({
  adapter: cache.adapter,
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 55000 // request timeout
})

var avoidDoubleRefresh = false
const configHandler = function(config) {
  // Do something before request is sent
  console.error('do we have a token?')
  console.error(getToken())
  if (getToken()) {
    // With the User Token we have received, lets make sure to refresh the token
    // Every here and there ...
    // Submit another refresh Token to replace the current token ...
    config.headers['X-Token'] = getToken()
    config.headers['X-Version'] = getVersion()

    console.error('do we have a token A?')
    console.error(config.headers)
    if (config && !config.url.endsWith('/token/refresh')) {
      var currentTime = Math.round(new Date().getTime() / 1000)
      console.error('GET TOKEN OF A' + getToken())
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
          // console.error('alst refresh was ' + Math.abs(currentTime - lastTokenRefresh))
          // console.error((tokenExpirationTime - currentTime))
          // console.error(Math.abs(currentTime - lastTokenRefresh))
          if ((Math.abs(currentTime - lastTokenRefresh) >= 3000)) { // every hour for now, due to cognito
            // Trigger a token Refresh in 5 seconds to avoid 401's and ensure user-activity?
            setTimeout(function() {
              var currentTime = Math.round(new Date().getTime() / 1000)
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
              // console.error('alst refresh was ' + Math.abs(currentTime - lastTokenRefresh))
              // console.error((tokenExpirationTime - currentTime))
              // console.error(Math.abs(currentTime - lastTokenRefresh))
              if ((Math.abs(currentTime - lastTokenRefresh) >= 3000)) { // every hour for now, due to cognito
                if (!avoidDoubleRefresh) {
                  store.dispatch('GET_CREDENTIALS') // If Cognito make sure we have valid AWS Keys
                  store.dispatch('UpdateRefreshTime', currentTime).then(() => {
                    // if ((tokenExpirationTime - currentTime) < refreshIfMinimumOf) {
                    console.error('CALLING REFRESH TOKEN....')
                    return refreshToken({ config: config }).then((r) => {
                      return r
                    })
                  })
                }
              }
            }, 5000)
          }
        }
      } catch (er) {
        console.error(er)
      }
    }
  }
  console.error('do we have a token returning?')
  console.error(config.headers)
  return config
}

const handleSuccess = function(response) {
  const res = response
  if (res.status >= 200 || res.status <= 204) { // 200, 201, 204 /// all good
    return response
  } else {
    // TODO: On 409, retry ?
    if (res.status === 409) {
      // Ask the user to reload its browser, new verseion of this website exists
    }

    if (res.status === 401) {
      console.error('RECEIVED SUCCESS OF 401 ???????')
      // return store.dispatch('LogOut').then(() => {
      //   location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      // })
    }
    return Promise.reject(response)
  }
  // response => {
  //   const res = response.data
  //   if (res.code !== 20000) {
  //     Message({
  //       message: res.message,
  //       type: 'error',
  //       duration: 5 * 1000
  //     })
  //     // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
  //     if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
  //       // 请自行在引入 MessageBox
  //       // import { Message, MessageBox } from 'element-ui'
  //       MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
  //         confirmButtonText: '重新登录',
  //         cancelButtonText: '取消',
  //         type: 'warning'
  //       }).then(() => {
  //         store.dispatch('FedLogOut').then(() => {
  //           location.reload() // 为了重新实例化vue-router对象 避免bufg
  //         })
  //       })
  //     }
  //     return Promise.reject('error')
  //   } else {
  //     return response.data
  //   }
}
const handleError = function(error, test) {
  return new Promise(function(resolve, reject) {
    // const status = error.response ? error.response.status : null
    // For LogOut someone might already have remoed this session ...
    // Also sessions does auto-expires if left over on the server side or on password / role changes
    var config = null
    var resp = null
    var err = {}

    if (error) {
      if (error.config) {
        config = error.config
      } else {
        if (error.response && error.response.config) {
          config = error.response.config
        }
      }

      if (error.response) {
        resp = error.response
      } else {
        if (error.response && error.response) {
          resp = error.response
        }
      }
      err['config'] = config
      err['response'] = resp
    }
    console.error('received error here 1')
    if (!err.config) {
      err = error
    }

    console.error('received error here 1 config 1')
    // if (config && config.url.endsWith('/login/logout')) {
    console.error(config)
    console.error(err)
    if (config && config.url.endsWith('/login/logout')) {
      console.error('received error here 1 config 2')
      if (resp.status === 401 || resp.status === 404) {
        return resolve()
      }
    } else {
      console.error('received error here 1 config 3')
      console.error(resp)
      if (resp && resp.status === 401) {
        console.error('received error here 1 config 4')
        // TODO: The plugin might want to only receive the Reject error instead and handle this on his side
        if (config && !config.url.endsWith('/token/refresh')) {
          console.error('received error here 1 config 5')
          console.error('received error here 1 config 5 a1')
          store.dispatch('GET_CREDENTIALS') // If Cognito make sure we have valid AWS Keys
          console.error('received error here 1 config 5 a2')
          console.error('received error here 1 config 5a3')

          var currentTime = Math.round(new Date().getTime() / 1000)
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
          // console.error('alst refresh was ' + Math.abs(currentTime - lastTokenRefresh))
          // console.error((tokenExpirationTime - currentTime))
          console.error('last refresh .... was')
          // console.error(Math.abs(currentTime - lastTokenRefresh))
          if ((Math.abs(currentTime - lastTokenRefresh) >= 300)) { // Make sure only 1 refresh per 5 minutes (avoid loops)
            avoidDoubleRefresh = true
            // if ((Math.abs(currentTime - lastTokenRefresh) >= 3500)) { // Make sure the end-user wasn't away for maximum of 1 hour ...  ???
            console.error('last refresh .... was ok lets try it ')
            return store.dispatch('UpdateRefreshTime', currentTime).then(() => {
              console.error('last refresh .... was ok lets try it ok refreshing ')
              refreshToken({ config: config }).then((r) => {
                avoidDoubleRefresh = false
                console.error('received error here 1 config 5a4')
                // error.config.headers['Authorization'] = 'Bearer ' + store.state.auth.token;
                error.config.headers['Authorization'] = getToken()
                error.config.baseURL = undefined
                console.error('received error here 1 config 5a6')
                resolve(service.request(error.config))
              }).catch((err) => {
                avoidDoubleRefresh = false
                console.error('received error here 1 config 5a7')
                console.error('WOULD OF LOGGED OUT HERE 1')
                console.error('WOULD OF LOGGED OUT HERE 1')
                console.error('WOULD OF LOGGED OUT HERE 1')
                err['message'] = window.app.$t('error.SessionTimedout')
                store.dispatch('LogOut')
                router.push({ path: '/', replace: true, query: { noGoBack: false }})
                return reject(err)
              })
            })
          } else {
            err['message'] = window.app.$t('error.SessionTimedout')
            store.dispatch('LogOut')
            router.push({ path: '/', replace: true, query: { noGoBack: false }})
            return reject(err)
          }
        } else {
          console.error('received error here 1 config 6')
          console.error('WOULD OF LOGGED OUT HERE')
          store.dispatch('LogOut')
          router.push({ path: '/', replace: true, query: { noGoBack: false }})
          err['message'] = window.app.$t('error.SessionTimedout')
          return reject(err)
          // store.dispatch('LogOut')
          // router.push({ path: '/', replace: true, query: { noGoBack: false }})
        }
      }
      console.error('received error here 1 config 8')
      // API Is Down
      if (!resp) {
        router.push({ path: '/error/no_api_access', replace: true, query: { noGoBack: false }})
        return reject({ error: 'no_api_access', message: window.app.$t('error.ServerTimeout') })
      }
    }
    // if (!err.message) {
    err['message'] = window.app.$t('error.ServerTimeout')
    // }
    return reject(err)
  })
}

cachedService.interceptors.request.use(
  config => configHandler(config)
)
cachedService.interceptors.response.use(
  response => handleSuccess(response),
  error => handleError(error)
)

// response interceptor
service.interceptors.request.use(
  config => configHandler(config)
)

service.interceptors.response.use(
  response => handleSuccess(response),
  error => handleError(error)
)

const handler = function(data, cache) {
  if (cache) {
    data['cache'] = cache
    return cachedService(data)
  } else {
    return service(data)
  }
}
window.$request = handler
export default handler
