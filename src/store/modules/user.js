import { loginForgotPassword, userLoginUpdatePassword, registerFirstAdmin, registerByUsernameCode, loginByUsername, loginByUsernameThirdParty, logout, getUserInfo } from '@/api/login'
import router from '@/router'
import { Auth, Logger } from 'aws-amplify'

// TODO: Move request into api/user file
import request from '@/utils/request'
import Cookies from 'js-cookie'

import store from '@/store'
import { MessageBox, Message } from 'element-ui' // Message
import { getAdminToken, removeAdminToken, getToken, setToken, removeToken, setTokenLastRefresh } from '@/utils/auth'

// import { AmazonCognitoIdentity, CognitoUserPool, CognitoUserAttribute, CognitoUser } from 'amazon-cognito-identity-js'
// import { AmazonCognitoIdentity } from 'amazon-cognito-identity-js'
// import { CognitoUse1r } from 'amazon-cognito-identity-js'

const logger = new Logger('store:auth')

var cognitoUser = null
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
    },
    cognito: null
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
        state.roles_active = roles.slice() // Clone the object
      } catch (e) {
        console.error(e.stack)
      }
      console.error('ROLES ARE:')
      console.error(state.roles)
      console.error(state.roles_active)
    },
    SET_COGNITO_USER: (state, cognitoUser) => {
      state.cognito = cognitoUser
    }

  },
  getters: {
    getCognitoUser(state) {
      return state.cognito
    },
    isLoginCodeReset(state) {
      if (state) {
        return !!state.code
      }
      return false
    }
  },
  actions: {
    awsSignIn: async(context, params) => {
      logger.debug('signIn for {}', params.username)
      context.commit('auth/clearAuthenticationStatus', null, { root: true })
      try {
        const user = await Auth.signIn(params.username, params.password)
        context.commit('setUserAuthenticated', user)
      } catch (err) {
        context.commit('auth/setAuthenticationError', err, { root: true })
      }
    },
    awsSignOut: async(context) => {
      try {
        await Auth.signOut()
      } catch (err) {
        logger.error('error during sign out: {}', err)
      }
      context.commit('auth/clearAuthentication', null, { root: true })
    },
    awsSignUp: async(context, params) => {
      context.commit('auth/clearAuthenticationStatus', null, { root: true })
      try {
        await Auth.signUp(params)
        context.commit('auth/clearAuthentication', null, { root: true })
      } catch (err) {
        context.commit('auth/setAuthenticationError', err, { root: true })
      }
    },
    UserPasswordChangeByCodeCancel({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        commit('SET_CODE', '')
        resolve()
      })
    },
    UserPasswordChangeCancel({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        commit('SET_CODE', '')
        commit('SET_COGNITO_USER', '')
        resolve()
      })
    },
    UserPasswordChangeByCode({ commit }, userInfo) {
      // Cognito ?? by default
      return new Promise((resolve, reject) => {
        Auth.forgotPasswordSubmit(userInfo.username, userInfo.code, userInfo.password).then(user => {
          commit('SET_CODE', '')
          window.app.$message({ message: window.app.$t('login.passwordResetSuccessfully'), type: 'success' })
          resolve(userInfo.username)
        }).catch(err => {
          console.error(err)
          window.app.$message({ message: window.app.$t('login.' + err.code), type: 'error' })
          // Who care if it doesn't exist
          reject(err)
        })
      })
    },
    UserLoginConfirmByCode({ commit }, params) {
      return new Promise((resolve, reject) => {
        var code = params.code
        var mfaType = params.mfaType
        // var user = store.getters.isCognitoUser
        // Somehow the getter doesnt have all the functions ?
        Auth.confirmSignIn(cognitoUser, code, mfaType).then(user => {
          cognitoUser = user
          console.error('GET COGNITOA A')
          commit('SET_COGNITO_USER', cognitoUser)
          if (user && user.signInUserSession) {
            // TODO: Create a session with the UserId / Cognito User validation
            loginByUsernameThirdParty(cognitoUser.username, 'cognito', cognitoUser, store.getters.settings.cognito).then(response => {
              if (response && response.data) {
                window.app.$message({ message: window.app.$t('login.Successfully') + '', type: 'success' })
                const data = response.data
                commit('SET_TOKEN', data.token)

                // TODO: We should use some kond of encryption to send the token in an encrypted way ... even though we are using SSL ? ...
                // Make Sure we do not keep any AWS Credentials locally. We keep it encrypted using AWS KMS.

                cognitoUser.cacheTokens()
                cognitoUser = null
                commit('SET_COGNITO_USER', {})

                setToken(response.data.token)
                const newRefreshTime = Math.round(new Date().getTime() / 1000)
                commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
                setTokenLastRefresh(newRefreshTime)
              }
              resolve()
            }).catch(error => {
              try {
                if (error.response.status === 401) {
                  Message({
                    message: window.app.$t('login.invalidPassword') + ' 2 ',
                    type: 'error',
                    duration: 5 * 1000
                  })
                }
              } catch (ef) {
                console.error(ef.stack)
              }
              reject(error)
            })
          } else {
            resolve()
          }
        }).catch(e => {
          console.error('confirmSigninUser EE')
          var Msg = window.app.$t('login.' + e.code)
          if (e.message) {
            Msg = Msg + '[' + e.message + ']'
          }
          console.error('confirmSigninUser FF')
          window.app.$message({ message: Msg + '', type: 'error' })
          console.log(e)
          reject(e)
        })
      })
    },
    UserPasswordChange({ commit }, params) {
      const userInfo = params.password
      const reqAttr = params.attributes
      if (store.getters.isCognitoUser) {
        return new Promise((resolve, reject) => {
          const currentUsername = this.getters.getCognitoUser.username
          Auth.signIn(currentUsername, userInfo.oldPassword).then(function(a) {
            console.error('GET COGNITOA SIGNING A')
            console.error('GOT SIGNING')
            console.error('Calling complete new Pwd')
            cognitoUser = a
            Auth.completeNewPassword(a, userInfo.password, reqAttr).then(user => {
              console.error('ok auth complted a')
              console.error(user)
              commit('SET_COGNITO_USER', user)
              console.error('ok auth complted updating')
              cognitoUser = user
              store.dispatch('LoginByUsername', { username: currentUsername, password: userInfo.password }).then(f => {
                console.error('will login 1')
                console.log(user)
                console.log(f)
                resolve(user)
              }).catch(err => {
                console.error('will login error')
                console.error(err) // should not happend
                reject(err)
              })
            }).catch(e => {
              console.error('will login GOT ERR')
              console.error(e)
              // {code: "InvalidPasswordException", name: "InvalidPasswordException", message: "Password does not conform to policy: Password must have symbol characters"}
              var Msg = window.app.$t('login.' + e.code)
              if (e.message) {
                Msg = Msg + '[' + e.message + ']'
              }
              window.app.$message({ message: Msg + '', type: 'error' })
              console.log(e)
              reject(e)
            })
          }).catch(e => {
            var Msg = window.app.$t('login.' + e.code)
            if (e.message) {
              Msg = Msg + '[' + e.message + ']'
            }
            window.app.$message({ message: Msg, type: 'error' })
            // {code: "InvalidPasswordException", name: "InvalidPasswordException", message: "Password does not conform to policy: Password must have symbol characters"}
            console.log(e)
            reject(e)
          })
          /*
          // var self = this
          console.error('got test')
          store.dispatch('authenticateUser', { email: 'support@acentera.com', password: '1Lovebeer!' }).then(f => {
            console.error('got succc')
            console.error(f)
            // self['cognito'].actions.changePassword({ currentPassword: 'Hello', newPassword: 'World!' }).then(f => {
            //   console.error(f)
            // })
          }).catch(err => {
            console.error('got errr login')
            console.error(err)
            store.dispatch('forgotPassword', { email: this.getters.getCognitoUser.username }).then(f => { // )'1Lovebeer!', newPassword: '8Lovebeer!' }).then(f => {
              console.error('got succc1 pw change')
              console.error(f)
            }).catch(err => {
              console.error('err pw change')
              console.error(err)
            })
          })
          console.error(this.getters.getCognitoUser.storage)
          var keyPrefix = 'CognitoIdentityServiceProvider.' + this.getters.getCognitoUser.pool.getClientId() + '.' + this.getters.getCognitoUser.username
          var idTokenKey = keyPrefix + '.idToken'
          this.getters.getCognitoUser.storage.setItem(idTokenKey, 'null')
          Auth.changePassword(this.getters.getCognitoUser.username, userInfo.oldPassword, userInfo.password)
          */
          /*
          Auth.currentAuthenticatedUser()
            .then(user => {
              if (userInfo.password === userInfo.passwordConfirm) {
                return Auth.completeNewPassword(user, userInfo.oldPassword, userInfo.password)
              } else {
                window.app.$message({ message: window.app.$t('login.passwordMisMatch'), type: 'success' })
                reject()
              }
            })
            .then(data => {
              console.error('got change password data')
              console.log(data)
              window.app.$message({ message: window.app.$t('login.passwordResetSuccessfully'), type: 'success' })
              resolve()
            })
            .catch(err => {
              console.error('got change password error')
              console.log(err)
              reject(err)
            })
          */
        })
        /*
        .catch((e) => {
          console.error(e.code)
          window.app.$message({ message: window.app.$t('login.' + e.code), type: 'error' })
          reject(e)
        })
        */
      } else {
        return new Promise((resolve, reject) => {
          /*
          userLoginUpdatePassword(userInfo.token, userInfo.password, userInfo.passwordConfirm, userInfo.code).then(response => {
            window.app.$message({ message: window.app.$t('login.passwordResetSuccessfully'), type: 'success' })
            store.dispatch('LogOut').then(() => {
              router.push({ path: '/login', replace: true, query: { noGoBack: false }})
            })
            resolve()
          }).catch(error => {
            reject(error)
          })
          */
          reject()
        })
      }
    },
    UserLoginUpdatePassword({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        userLoginUpdatePassword(userInfo.token, userInfo.password, userInfo.passwordConfirm, userInfo.code).then(response => {
          window.app.$message({ message: window.app.$t('login.passwordResetSuccessfully') + '', type: 'success' })
          store.dispatch('LogOut').then(() => {
            router.push({ path: '/login', replace: true, query: { noGoBack: false }})
          })
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
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
            store.dispatch('loginDisableFirstTime').then(() => {
              router.push({ path: '/login', replace: true, query: { noGoBack: false }})
            })
          })
          resolve()
        }).catch(error => {
          console.error('OK GOT REGISTER FIRST ERRR ')
          console.error(error)
          reject(error)
        })
      })
    },
    LoginForgotPassword({ commit }, userInfo) {
      if (store.getters.isCognitoUser) {
        return new Promise((resolve, reject) => {
          Auth.forgotPassword(userInfo.username).then(user => {
            window.app.$message({ message: window.app.$t('login.codeSubmitted'), type: 'success' })
            commit('SET_CODE', true)
            console.error(user)
            resolve(userInfo.username)
          }).catch(err => {
            console.error(err)
            window.app.$message({ message: window.app.$t('login.codeSubmitted'), type: 'success' })
            // Who care if it doesn't exist
            commit('SET_CODE', true)
            resolve(userInfo.username)
          })
        })
      } else {
        const username = userInfo.username.trim()
        return new Promise((resolve, reject) => {
          loginForgotPassword(username, userInfo.code).then(response => {
            console.error('received ')
            console.error(response)
            window.app.$message({ message: window.app.$t('login.forgotPasswordEmail'), type: 'success' })
            resolve()
          }).catch(error => {
            reject(error)
          })
        })
      }
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
      if (store.getters.isCognitoUser) {
        return new Promise((resolve, reject) => {
          console.error('GET COGNITOA SIGNING AA')
          Auth.signIn(username, userInfo.password).then(function(a) {
            console.error('GET COGNITOA SIGNING BB')
            // Ok cognito User now have a Session so we are good
            commit('SET_COGNITO_USER', a)
            cognitoUser = a
            // TODO: Create a session with the UserId / Cognito User validation
            if (a && a.signInUserSession) {
              // There was maybe no MFA. This is bad but you know ..
              // This also gets called as a dispatch in some other functions to ensure we re-use the same functions
              loginByUsernameThirdParty(cognitoUser.username, 'cognito', a, store.getters.settings.cognito).then(response => {
                if (response && response.data) {
                  window.app.$message({ message: window.app.$t('login.Successfully'), type: 'success' })
                  const data = response.data
                  commit('SET_TOKEN', data.token)
                  setToken(response.data.token)
                  // TODO: We should use some kond of encryption to send the token in an encrypted way ... even though we are using SSL ? ...
                  // Make Sure we do not keep any AWS Credentials locally. We keep it encrypted using AWS KMS.
                  a.cacheTokens()
                  cognitoUser = null
                  commit('SET_COGNITO_USER', {})
                  const newRefreshTime = Math.round(new Date().getTime() / 1000)
                  commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
                  setTokenLastRefresh(newRefreshTime)
                }
                resolve()
              }).catch(error => {
                try {
                  if (error.response.status === 401) {
                    Message({
                      message: window.app.$t('login.invalidPassword'),
                      type: 'error',
                      duration: 5 * 1000
                    })
                  }
                } catch (ef) {
                  console.error(ef.stack)
                }
                reject(error)
              })
            } else {
              resolve()
            }
          }).catch((e) => {
            console.error('GET COGNITOA SIGNING CC')
            console.error(e.code)
            window.app.$message({ message: window.app.$t('login.' + e.code), type: 'error' })
            reject(e)
          })
        })
      } else {
        return new Promise((resolve, reject) => {
          loginByUsername(username, userInfo.password).then(response => {
            if (response && response.data) {
              window.app.$message({ message: window.app.$t('login.Successfully'), type: 'success' })
              const data = response.data
              commit('SET_TOKEN', data.token)
              setToken(response.data.token)
              const newRefreshTime = Math.round(new Date().getTime() / 1000)
              commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
              setTokenLastRefresh(newRefreshTime)
            }
            resolve()
          }).catch(error => {
            try {
              if (!error.response) {
                Message({
                  message: window.app.$t('error.ServerTimeout') + '',
                  type: 'error',
                  duration: 5 * 1000
                })
              } else if (error.response.status === 401) {
                Message({
                  message: window.app.$t('login.invalidPassword') + '',
                  type: 'error',
                  duration: 5 * 1000
                })
              }
            } catch (ef) {
              console.error(ef.stack)
            }
            reject(error)
          })
        })
      }
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(state.token).then(response => {
          console.error('getUserInfo here  INFO A')
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const data = response.data

          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            var lowerCaseRoles = []
            var roleLen = data.roles.length
            for (var z = 0; z < roleLen; z++) {
              lowerCaseRoles.push(data.roles[z].toLowerCase())
            }
            commit('SET_ROLES', lowerCaseRoles)
            commit('SET_ROLES_ACTIVE', lowerCaseRoles)
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
              console.error('GET UESR INFO A')
              const data = response.data

              var lowerCaseRoles = []
              if (!data.roles) {
                data.roles = [] // cannot be but if backend error... safety
              }
              var roleLen = data.roles.length
              for (var z = 0; z < roleLen; z++) {
                lowerCaseRoles.push(data.roles[z].toLowerCase())
              }

              commit('SET_ROLES', lowerCaseRoles)
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
              console.error('GET UESR INFO B')
              const data = response.data

              var lowerCaseRoles = []
              var roleLen = data.roles.length
              for (var z = 0; z < roleLen; z++) {
                lowerCaseRoles.push(data.roles[z].toLowerCase())
              }
              commit('SET_ROLES', lowerCaseRoles)

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
