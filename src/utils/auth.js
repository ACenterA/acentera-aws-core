import Cookies from 'js-cookie'
import store from '@/store'
import request from '@/utils/request'
// import { Amplify, Auth } from 'aws-amplify'

const TokenKey = 'Token'
const TokenLastRefreshKey = 'TokenRefresh'
const AdminTokenKey = 'Admin-Token'

export function getToken() {
  // If we would like t do a multi esssion for the same user in different window ?
  /*
  if (store && store.getters && store.getters.token) {
    return store.getters.token
  }
  */
  return Cookies.get(TokenKey)
}

export function getTokenLastRefresh() {
  // If we would like t do a multi esssion for the same user in different window ?
  /*
  if (store && store.getters && store.getters.lastTokenRefresh) {
    return store.getters.lastTokenRefresh
  }
  */
  return Cookies.get(TokenLastRefreshKey)
}

export function setTokenLastRefresh(val) {
  return Cookies.set(TokenLastRefreshKey, val)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getAdminToken() {
  if (store && store.getters && store.getters.adminToken) {
    return store.getters.adminToken
  }
  return Cookies.get(TokenKey)
}

export function setAdminToken(token) {
  return Cookies.set(AdminTokenKey, token)
}

export function removeAdminToken() {
  return Cookies.remove(AdminTokenKey)
}

export function performTokenRefresh() {
  return request({
    url: '/user/token/refresh',
    method: 'get'
  })
}

export function refreshToken(data) {
  const config = data.config
  return new Promise((resolve, reject) => {
    if (config.url === '/user/token/refresh') {
      console.error('PERFORMED REFRESH TOKEN... current url ??? simply resolve it..')
      console.error(config)
      return resolve(config) // Promise.resolve(config)
    } else {
      performTokenRefresh().then(res => { // 拉取user_info
        console.error('PERFORMED REFRESH TOKEN...')
        console.error('res is...')
        console.error(res)
        try {
          const data = res.data
          if (data && data.token) {
            console.error('data token existed...')
            console.error('set token of...' + data.token)
            store.commit('SET_TOKEN', data.token)
            setToken(data.token)
            console.error('SET CONFIG HEADER.... override token to ' + data.token)
            console.error('SET CONFIG HEADER.... override token TEST of  ' + getToken())
            console.error('OK CONFIG IS')
            console.error(config)
            console.error('DELETIN GCONFIG TOKEN HERE X-Token')
            delete config.headers['X-Token']
            config.headers['X-Token'] = data.token // Reset Token to current received token
          }
          console.error('resolving ocnfig here')
          console.error(config)
          return resolve(config) // Promise.resolve(config)
        } catch (exx) {
          console.error(exx.stack)
          console.error('reject of config here here ...')
          console.error(config)
          return reject(config) // Promise.reject(config)
        }
      })
    }
  })
}

const CognitoTokenKey = 'CognitoToken'
const AWSTokenKey = 'CredentialsToken'

export function setCognitoUserInfo(token) {
  // console.error('set congito user toinfo')
  // console.error(token)
  // console.error(JSON.stringify(token))
  return Cookies.set(CognitoTokenKey, JSON.stringify(token))
}

export function getCognitoUser() {
  var val = Cookies.get(CognitoTokenKey)
  try {
    console.error('val is..')
    console.error(val)
    if (val === '{}') {
      return null
    }
    val = JSON.parse(val)
    console.error(val)
    return val
  } catch (err) {
    return null
  }
}

export function setCredentials(token) {
  return Cookies.set(AWSTokenKey, JSON.stringify(token))
}

export function getCredentials(cognitoUser) {
  return new Promise((resolve, reject) => {
    window.Amplify.currentUserCredentials().then(function(ff) {
      resolve(ff)
    }).catch((ex) => {
      console.error(ex.stack)
      reject(ex)
    })
  })
  /*
  if (store && store.getters && store.getters.cachedCredentials) {
    return store.getters.adminToken
  }
  */
  /*
  var val = Cookies.get(AWSTokenKey)
  try {
    val = JSON.parse(val)
    return val
  } catch (err) {
    return null
  }
  */
}
