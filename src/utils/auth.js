import Cookies from 'js-cookie'
import store from '@/store'
import request from '@/utils/request'

const TokenKey = 'Token'
const TokenLastRefreshKey = 'TokenRefresh'
const AdminTokenKey = 'Admin-Token'

export function getToken() {
  if (store && store.getters && store.getters.token) {
    return store.getters.token
  }
  return Cookies.get(TokenKey)
}

export function getTokenLastRefresh() {
  if (store && store.getters && store.getters.lastTokenRefresh) {
    return store.getters.lastTokenRefresh
  }
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

export function refreshToken(config) {
  console.error('received refreshToken')
  console.error(config)
  if (config.url === '/user/token/refresh') {
    console.error('doing ...refresh...already sending')
    return Promise.resolve(config)
  } else {
    console.error('received refreshToken not in refresh')
    return performTokenRefresh().then(res => { // 拉取user_info
      console.error('got token resp')
      const data = res.data
      if (data && data.token) {
        store.commit('SET_TOKEN', data.token)
        setToken(data.token)
      }
      return Promise.resolve(config)
    })
  }
}
