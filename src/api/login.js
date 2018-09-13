import request from '@/utils/request'
import { Message } from 'element-ui'

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/login/login',
    method: 'post',
    data
  }).catch(error => {
    try {
      console.error('got error here ')
      console.error(error)
      console.error(error.response)
      if (error.response.status === 401) {
        Message({
          message: window.app.$t('login.invalidPassword'),
          type: 'error',
          duration: 5 * 1000
        })
      // } else {
        // default error
      }
    } catch (ef) {
      console.error(ef.stack)
    }
  })
}

export function userLoginUpdatePassword(token, password, passwordConfirm, code) {
  const data = {
    token,
    password,
    passwordConfirm,
    code
  }
  return request({
    url: '/login/password/reset/confirm',
    method: 'post',
    data
  })
}

export function registerFirstAdmin(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/login/admin',
    method: 'post',
    data
  })
}

export function loginForgotPassword(username, code) {
  const data = {
    username,
    code
  }
  return request({
    url: '/login/password/reset',
    method: 'post',
    data
  })
}

export function registerByUsernameCode(username, password, code) {
  const data = {
    username,
    password,
    code
  }
  return request({
    url: '/login/register',
    method: 'post',
    data
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get'
  })
}
