import axios from 'axios'
import localforage from 'localforage'
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
  timeout: 5000 // request timeout
})

const cachedService = axios.create({
  adapter: cache.adapter,
  baseURL: process.env.BASE_API, // api 的 base_url
  timeout: 5000 // request timeout
})

const configHandler = function(config) {
  console.error(this)
  console.error(config)
  // Do something before request is sent
  if (getToken()) {
    // With the User Token we have received, lets make sure to refresh the token
    // Every here and there ...
    // Submit another refresh Token to replace the current token ...
    config.headers['X-Token'] = getToken()
    config.headers['X-Version'] = getVersion()
    var currentTime = Math.round(new Date().getTime() / 1000)
    var playload = JSON.parse(atob(getToken().split('.')[1]))
    var tokenExpirationTime = playload.exp
    var tokenDuration = playload.exp - playload.iat

    // Refresh token every X iterations 25% of expiration time
    const refreshTime = tokenDuration * 25 / 100

    var refreshIfMinimumOf = tokenDuration - refreshTime
    if (refreshIfMinimumOf <= 300) {
      refreshIfMinimumOf = 300
    }

    var lastTokenRefresh = getTokenLastRefresh()
    if (Math.abs(currentTime - lastTokenRefresh) >= 300) {
      store.dispatch('UpdateRefreshTime', currentTime).then(() => {
        // store.commit('SET_LAST_TOKEN_REFRESH', currentTime)
        if ((tokenExpirationTime - currentTime) < refreshIfMinimumOf) {
          return refreshToken(config)
        }
      })
    }
  }
  return config
}

const handleSuccess = function(response) {
  const res = response
  if (res.status === 200 || res.status === 204) {
    return response
  } else {
    // TODO: On 409, retry ?
    if (res.status === 409) {
      // Ask the user to reload its browser, new verseion of this website exists
    }

    console.error('got status ' + res.status)
    if (res.status === 401) {
      return store.dispatch('LogOut').then(() => {
        location.reload()// In order to re-instantiate the vue-router object to avoid bugs
      })
    }
    return Promise.reject('error')
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
  //           location.reload() // 为了重新实例化vue-router对象 避免bug
  //         })
  //       })
  //     }
  //     return Promise.reject('error')
  //   } else {
  //     return response.data
  //   }
}
const handleError = function(error) {
  // For LogOut someone might already have remoed this session ...
  // Also sessions does auto-expires if left over on the server side or on password / role changes
  if (error.response.config.url.endsWith('/login/logout')) {
    if (error.response.status === 401) {
      return Promise.resolve()
    }
  }
  return Promise.reject(error)
}

cachedService.interceptors.request.use(
  config => configHandler(config),
  response => handleSuccess(response),
  error => handleError(error)
)

// response interceptor
service.interceptors.response.use(
  config => configHandler(config),
  response => handleSuccess(response),
  error => handleError(error)
)

const handler = function(data, cache) {
  if (cache) {
    data['cache'] = cache
    console.error('using cache')
    return cachedService(data)
  } else {
    console.error('not using cache')
    return service(data)
  }
}

export default handler
