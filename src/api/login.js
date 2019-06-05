import request from '@/utils/request'

export function loginByUsernameThirdParty(username, type, userinfo, thirdparty) {
  const data = {
    username,
    type,
    userinfo,
    thirdparty
  }
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}

export function registerDeviceCodeByUsernameThirdParty(username, type, userinfo, thirdparty, code, secret) {
  const data = {
    username,
    type,
    userinfo,
    thirdparty,
    code,
    secret
  }
  return request({
    url: '/login/login',
    method: 'post',
    data
  })
}

export function loginByUsername(username, password) {
  const data = {
    username,
    password
  }
  return request({
    url: '/login/login',
    method: 'post',
    data
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
