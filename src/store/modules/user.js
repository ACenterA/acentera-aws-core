import { registerFirstAdmin, registerByUsernameCode, loginByUsername, logout, getUserInfo } from '@/api/login'
import router from '@/router'

// TODO: Move request into api/user file
import request from '@/utils/request'
import Cookies from 'js-cookie'

import store from '@/store'
import { MessageBox } from 'element-ui' // Message
import { getAdminToken, removeAdminToken, getToken, setToken, removeToken, setTokenLastRefresh } from '@/utils/auth'

export function changeUserRole(role, password) {
  const data = {
    role,
    password
  }
  return request({
    url: '/user/change/role',
    method: 'post',
    data
  })
}

const user = {
  state: {
    user: '',
    status: '',
    code: '',
    lastTokenRefresh: 0,
    token: getToken(),
    admin_token: getAdminToken(),
    name: '',
    avatar: '',
    introduction: '',
    roles_active: [], // List of current activated roles
    roles: [], // List of available roles for this user
    setting: {
      articlePlatform: []
    }
  },

  mutations: {
    SET_CODE: (state, code) => {
      state.code = code
    },
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_ADMIN_TOKEN: (state, token) => {
      state.admin_token = token
    },
    SET_LAST_TOKEN_REFRESH: (state, refreshTime) => {
      console.error('set last token refresh to')
      console.error(state)
      state.lastTokenRefresh = refreshTime
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_SETTING: (state, setting) => {
      state.setting = setting
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      console.error('override roles...')
      state.roles = roles
      console.error(roles)
    },
    SET_ROLES_ACTIVE: (state, roles) => {
      try {
        console.error(roles)
        state.roles_active = roles.slice()
      } catch (e) {
        console.error(e.stack)
      }
      console.error('ROLES ARE:')
      console.error(state.roles)
      console.error(state.roles_active)
    }
  },

  actions: {
    // 用户名登录
    UpdateRefreshTime({ commit }, newRefreshTime) {
      return new Promise((resolve, reject) => {
        // Store tokenRefreshTime inside a cookie ...
        commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
        setTokenLastRefresh(newRefreshTime)
        resolve()
      })
    },
    RegisterFirstUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        registerFirstAdmin(username, userInfo.password).then(response => {
          console.error('OK GOT REGISTER FIRST ADMIN A')
          console.error(response)
          window.app.$message({ message: window.app.$t('login.adminCreated'), type: 'success' })

          store.dispatch('LogOut').then(() => {
            // location.reload()// In order to re-instantiate the vue-router object to avoid bugs
            router.push({ path: '/login', replace: true, query: { noGoBack: false }})
          })
          resolve()
        }).catch(error => {
          console.error('OK GOT REGISTER FIRST ERRR ')
          console.error(error)
          reject(error)
        })
      })
    },

    RegisterByUsernameCode({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        registerByUsernameCode(username, userInfo.password, userInfo.code).then(response => {
          const data = response.data
          console.error('SET TOKEN OF....' + data.token)
          commit('SET_TOKEN', data.token)
          setToken(data.token)
          const newRefreshTime = Math.round(new Date().getTime() / 1000)
          commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
          setTokenLastRefresh(newRefreshTime)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(response => {
          const data = response.data
          console.error('SET TOKEN OF....' + data.token)
          commit('SET_TOKEN', data.token)
          setToken(response.data.token)
          const newRefreshTime = Math.round(new Date().getTime() / 1000)
          commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
          setTokenLastRefresh(newRefreshTime)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const data = response.data

          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
            commit('SET_ROLES_ACTIVE', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }

          if (!Cookies.get('language')) {
            if (data.language) {
              commit('SET_LANGUAGE', data.language)
            }
          }

          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar || 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
          commit('SET_INTRODUCTION', data.introduction)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        console.error('calling logout here A')
        logout(state.token).then(() => {
          console.error('calling logout here B')
          commit('SET_TOKEN', '')
          commit('SET_ADMIN_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_ROLES_ACTIVE', [])
          removeToken()
          console.error('calling logout here C')
          removeAdminToken()
          console.error('calling logout here D')
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        removeAdminToken()
        resolve()
      })
    },

    ImpersonateUser({ commit }, role) {
      return null
      /*
      // TODO: Save current Token to setAdminToken
      // TODO: Call the impersonate API and refresh user.. info
      impersonateUser(user).then(response => {
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          resolve()
        })
      })
      */
    },

    // 动态修改权限
    ChangeRoles({ commit }, role) {
      return new Promise(resolve => {
        var roles = store.getters.roles
        var found = false
        if (roles && roles.length > 0) {
          var len = roles.length
          for (var i = 0; i < len && !found; i++) {
            if (roles[i] === role) {
              found = true
              break
            }
          }
          if (found) {
            // Change User Role (ServerSession already contains this role)
            changeUserRole(role).then(getUserInfo().then(response => {
              const data = response.data
              commit('SET_ROLES', data.roles)
              commit('SET_NAME', data.name)
              commit('SET_AVATAR', data.avatar)
              commit('SET_INTRODUCTION', data.introduction)
              resolve()
            })
            )
          }
        }
        if (!found) {
          console.error('Need to ask user password')

          MessageBox.confirm('Switch to role ' + role + '', 'Confirm your password', {
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            showInput: true,
            inputValue: '',
            inputPlaceholder: 'Enter password here'
          }).then((action) => {
            changeUserRole(role, action.value).then(getUserInfo().then(response => {
              const data = response.data
              commit('SET_ROLES', data.roles)
              commit('SET_NAME', data.name)
              commit('SET_AVATAR', data.avatar)
              commit('SET_INTRODUCTION', data.introduction)
              resolve()
            })
            )
          })
        }
        /*
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          resolve()
        })
        */
      })
    }
  }
}

export default user
