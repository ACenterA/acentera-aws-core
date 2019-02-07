import { loginForgotPassword, userLoginUpdatePassword, registerFirstAdmin, registerByUsernameCode, loginByUsername, loginByUsernameThirdParty, registerDeviceCodeByUsernameThirdParty, logout, getUserInfo } from '@/api/login'
import router from '@/router'
import { Auth, Logger } from 'aws-amplify'
import AWS from 'aws-sdk'

// TODO: Move request into api/user file
import request from '@/utils/request'
import Cookies from 'js-cookie'

import store from '@/store'
import { MessageBox, Message } from 'element-ui' // Message
// import { setCognitoUserInfo, setCredentials, getCredentials, getCognitoUser, getAdminToken, removeAdminToken, getToken, setToken, removeToken, setTokenLastRefresh } from '@/utils/auth'
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
    needRegisterMFA: '',
    credentials: '',
    needRegisterMFAStr: '',
    lastTokenRefresh: 0,
    token: getToken(),
    admin_token: getAdminToken(),
    name: '',
    avatar: '',
    AWS: '',
    introduction: '',
    roles_active: [], // List of current activated roles
    roles: [], // List of available roles for this user
    setting: {
      articlePlatform: []
    },
    cognito: null // getCognitoUser()
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
      console.error('SET AVATAR TO ')
      console.error(avatar)
      state.avatar = avatar
    },
    SET_NEED_MFA: (state, dta) => {
      state.needRegisterMFA = dta.code
      state.needRegisterMFAStr = dta.url
      // ex: otpauth://totp/@amazon.com?secret=42ON57B6HQ274UQOFMITDLTZ2UOEBPHJHWCJA77XYCLJSHEFXXX
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_ROLES_ACTIVE: (state, roles) => {
      state.roles_active = (roles || []).slice() // Clone the object
    },
    SET_COGNITO_USER: (state, cognitoUser) => {
      if (state.cognito && (cognitoUser && !cognitoUser.cacheTokens)) {
        state.cognito.cacheTokens()
        /*
        if (state.cognito.cacheTokens) {
          state.cognito.cacheTokens()
        }
        */
      }
      state.cognito = cognitoUser
      // setCognitoUserInfo(cognitoUser)
    },
    SET_CREDS: (state, creds) => {
      // https://github.com/awslabs/aws-mobile-appsync-sdk-js/issues/105
      if (creds === '') {
        // No creds
        state.credentials = null
      } else {
        state.credentials = creds
        // TODO: SET Apollo Client and infos

        // console.error(state.credentials)
        if (state.credentials.cognito && state.credentials.cognito.config) {
          var cognitoRegion = state.credentials.cognito.config.region
          var idCreds = state.credentials.webIdentityCredentials.params
          var userPoolId = store.state.settings.cognito.cognito.USER_POOL_ID
          var idpoolid = store.state.settings.cognito.cognito.IDENTITY_POOL_ID
          var appClientId = store.state.settings.cognito.cognito.APP_CLIENT_ID

          // POTENTIAL: Region needs to be set if not already set previously elsewhere.
          AWS.config.region = cognitoRegion
          AWS.config.credentials = new AWS.CognitoIdentityCredentials(idCreds)

          Auth.configure({
            region: cognitoRegion,
            userPoolId: userPoolId,
            identityPoolId: idpoolid,
            userPoolWebClientId: appClientId
          })
          console.error({
            region: cognitoRegion,
            userPoolId: userPoolId,
            identityPoolId: idpoolid,
            userPoolWebClientId: appClientId
          })
          store.dispatch('REFRESH_COGNITO_USER')
          /*
          Auth.currentAuthenticatedUser().then((user) => {
            console.error('COGNITO current user is')
            console.error(user)
            // if (user.Session) {
            state.cognito = user
            // } else {
            //  state.cognito = null
            //}
            // console.error(user)
          })
          */
        }
      }
    }
  },
  getters: {
    needMFARegistration(state) {
      if (state.needRegisterMFA) {
        return (state.needRegisterMFA).replace('"', '')
      }
      return ''
    },
    needMFARegistrationStr(state) {
      return state.needRegisterMFAStr
    },
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
    REFRESH_COGNITO_USER({ commit }) {
      return new Promise((resolve, reject) => {
        Auth.currentAuthenticatedUser({
          bypassCache: true
        }).then((curUser) => {
          console.error(curUser)
          commit('SET_COGNITO_USER', curUser)
          resolve(curUser)
        }).catch((ex) => {
          // maybe not cognito authenticated ?
          console.error(ex.stack)
          resolve(ex)
        })
      })
    },
    GET_CREDENTIALS({ commit }) {
      return new Promise((resolve, reject) => {
        Auth.currentUserCredentials().then(function(ff) {
          commit('SET_CREDS', ff)
          resolve(ff)
        }).catch((ex) => {
          // maybe not cognito authenticated ?
          console.error(ex.stack)
          resolve(ex)
        })
      })
    },
    UserAssignDeviceConfirmation({ commit }, mfaInfo) {
      return new Promise((resolve, reject) => {
        var mfaTmp = {
          code: mfaInfo.secret,
          url: mfaInfo.url
        }
        var mfaTmpA = {
          code: '',
          url: ''
        }
        commit('SET_NEED_MFA', mfaTmpA)
        registerDeviceCodeByUsernameThirdParty(cognitoUser.username, 'cognito', cognitoUser, store.getters.settings.cognito, mfaInfo.code, mfaInfo.code, mfaInfo.secret).then(response => {
          if (response && response.data) {
            window.app.$message({ message: window.app.$t('login.Successfully') + '', type: 'success' })
            const data = response.data
            commit('SET_TOKEN', data.token)
            // TODO: We should use some kond of encryption to send the token in an encrypted way ... even though we are using SSL ? ...
            // Make Sure we do not keep any AWS Credentials locally. We keep it encrypted using AWS KMS.
            // cognitoUser.cacheTokens()
            // cognitoUser = null
            // commit('SET_COGNITO_USER', '')

            setToken(response.data.token)
            const newRefreshTime = Math.round(new Date().getTime() / 1000)
            commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
            setTokenLastRefresh(newRefreshTime)
          } else {
            commit('SET_NEED_MFA', mfaTmp)
          }
          resolve()
        }).catch(function(er) {
          window.app.$message({ message: window.app.$t('login.InvalidCode') + '', type: 'warning' })
          commit('SET_NEED_MFA', mfaTmp)
          resolve()
        })
      })
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
          commit('SET_COGNITO_USER', cognitoUser)
          if (user && user.signInUserSession) {
            // TODO: Create a session with the UserId / Cognito User validation
            var needMFA = false
            loginByUsernameThirdParty(cognitoUser.username, 'cognito', cognitoUser, store.getters.settings.cognito).then(response => {
              if (response && response.data) {
                Auth.currentCredentials().then(credentials => {
                  commit('SET_CREDS', Auth.essentialCredentials(credentials))
                  store.dispatch('REFRESH_COGNITO_USER').then((emptyFct) => {
                    const data = response.data
                    commit('SET_TOKEN', data.token)

                    // TODO: We should use some kond of encryption to send the token in an encrypted way ... even though we are using SSL ? ...
                    // Make Sure we do not keep any AWS Credentials locally. We keep it encrypted using AWS KMS.

                    if (data.status === 'NeedMFA' && data.code) {
                      commit('SET_NEED_MFA', data)
                      // NeedMFA
                      needMFA = true
                      cognitoUser.challengeName = 'SOFTWARE_TOKEN_MFA'
                      // cognitoUser.signInUserSession = null
                      commit('SET_COGNITO_USER', cognitoUser)
                      window.app.$message({ message: window.app.$t('login.needMfa') + '', type: 'success' })
                      resolve(!needMFA)
                    } else {
                      setToken(response.data.token)
                      const newRefreshTime = Math.round(new Date().getTime() / 1000)
                      commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
                      setTokenLastRefresh(newRefreshTime)
                      store.dispatch('UserLoggedIn').then(userInfo => { // user_info
                        store.dispatch('GetUserInfo').then(userInfo => { // user_info
                          window.app.$message({ message: window.app.$t('login.Successfully') + '', type: 'success' })
                          // cognitoUser.cacheTokens()
                          // cognitoUser = null
                          // commit('SET_COGNITO_USER', '')
                          resolve(!needMFA)
                        })
                      })
                    }
                  })
                }).catch(error => {
                  console.error(error)
                  resolve(!needMFA)
                })
              } else {
                resolve(!needMFA)
              }
            }).catch(error => {
              if (error && error.response) {
                if (error.response.status === 401) {
                  Message({
                    message: window.app.$t('login.invalidPassword') + ' 2 ',
                    type: 'error',
                    duration: 5 * 1000
                  })
                }
              }
              reject(error)
            })
          } else {
            resolve()
          }
        }).catch(e => {
          var Msg = window.app.$t('login.' + e.code)
          if (e.message) {
            Msg = Msg + '[' + e.message + ']'
          }
          window.app.$message({ message: Msg + '', type: 'error' })
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
            cognitoUser = a
            Auth.completeNewPassword(a, userInfo.password, reqAttr).then(user => {
              commit('SET_COGNITO_USER', user)
              cognitoUser = user
              store.dispatch('LoginByUsername', { username: currentUsername, password: userInfo.password }).then(f => {
                resolve(user)
              }).catch(err => {
                reject(err)
              })
            }).catch(e => {
              // {code: "InvalidPasswordException", name: "InvalidPasswordException", message: "Password does not conform to policy: Password must have symbol characters"}
              var Msg = window.app.$t('login.' + e.code)
              if (e.message) {
                Msg = Msg + '[' + e.message + ']'
              }
              window.app.$message({ message: Msg + '', type: 'error' })
              reject(e)
            })
          }).catch(e => {
            var Msg = window.app.$t('login.' + e.code)
            if (e.message) {
              Msg = Msg + '[' + e.message + ']'
            }
            window.app.$message({ message: Msg, type: 'error' })
            // {code: "InvalidPasswordException", name: "InvalidPasswordException", message: "Password does not conform to policy: Password must have symbol characters"}
            reject(e)
          })
        })
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
          window.app.$message({ message: window.app.$t('login.adminCreated'), type: 'success' })
          store.dispatch('LogOut').then(() => {
            // location.reload()// In order to re-instantiate the vue-router object to avoid bugs
            store.dispatch('loginDisableFirstTime').then(() => {
              router.push({ path: '/login', replace: true, query: { noGoBack: false }})
            })
          })
          resolve()
        }).catch(error => {
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
            resolve(userInfo.username)
          }).catch(err => {
            if (err) {
              window.app.$message({ message: window.app.$t('login.codeSubmitted'), type: 'success' })
            }
            // Who care if it doesn't exist
            commit('SET_CODE', true)
            resolve(userInfo.username)
          })
        })
      } else {
        const username = userInfo.username.trim()
        return new Promise((resolve, reject) => {
          loginForgotPassword(username, userInfo.code).then(response => {
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
    LoginByUsernameWebapp({ commit }, userInfo) {
      const username = userInfo.username.trim()
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
        }).catch((err) => {
          reject(err)
        })
      })
    },
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      // TODO: Since we want to support both cognito and non cognioto users
      // we should separate this function with a LoginByUsernameWebapp
      // if the cognito login fails, and that the project has isCogito enabled we fallback to that LoginByUsernameWebapp
      if (store.getters.isCognitoUser) {
        return new Promise((resolve, reject) => {
          Auth.signIn(username, userInfo.password).then(function(a) {
            // Ok cognito User now have a Session so we are good
            commit('SET_COGNITO_USER', a)
            cognitoUser = a
            // TODO: Create a session with the UserId / Cognito User validation
            if (a && a.signInUserSession) {
              // There was maybe no MFA. This is bad but you know ..
              // This also gets called as a dispatch in some other functions to ensure we re-use the same functions
              loginByUsernameThirdParty(cognitoUser.username, 'cognito', a, store.getters.settings.cognito).then(response => {
                if (response && response.data) {
                  const data = response.data
                  if (data.status === 'NeedMFA' && data.code) {
                    commit('SET_NEED_MFA', data)
                    resolve()
                  } else {
                    commit('SET_TOKEN', data.token)
                    window.app.$message({ message: window.app.$t('login.Successfully'), type: 'success' })

                    Auth.currentCredentials().then(credentials => {
                      commit('SET_CREDS', Auth.essentialCredentials(credentials))

                      setToken(response.data.token)
                      // TODO: We should use some kond of encryption to send the token in an encrypted way ... even though we are using SSL ? ...
                      // Make Sure we do not keep any AWS Credentials locally. We keep it encrypted using AWS KMS.
                      // a.cacheTokens()
                      // cognitoUser = null
                      // commit('SET_COGNITO_USER', '')
                      const newRefreshTime = Math.round(new Date().getTime() / 1000)
                      commit('SET_LAST_TOKEN_REFRESH', newRefreshTime)
                      setTokenLastRefresh(newRefreshTime)

                      store.dispatch('UserLoggedIn').then(userInfo => { // user_info
                        store.dispatch('GetUserInfo').then(userInfo => { // user_info
                          return resolve(cognitoUser)
                        }).catch(error => {
                          console.error(error)
                          resolve(cognitoUser)
                        })
                      }).catch(error => {
                        console.error(error)
                        resolve(cognitoUser)
                      })
                    })
                  }
                }
              }).catch(error => {
                if (error && error.response) {
                  if (error.response.status === 401) {
                    Message({
                      message: window.app.$t('login.invalidPassword'),
                      type: 'error',
                      duration: 5 * 1000
                    })
                  }
                }
                reject(error)
              })
            } else {
              resolve()
            }
          }).catch((e) => {
            store.dispatch('LoginByUsernameWebapp', userInfo).then(() => {
              // All Good non cognito User
              window.app.$message({ message: window.app.$t('login.Successfully'), type: 'success' })
              resolve(userInfo)
            }).catch((err) => {
              if (err && e) {
                window.app.$message({ message: window.app.$t('login.' + e.code), type: 'error' })
              }
              reject(e)
            })
          })
        })
      } else {
        return new Promise((resolve, reject) => {
          store.dispatch('LoginByUsernameWebapp', userInfo).then(() => {
            // All Good
            window.app.$message({ message: window.app.$t('login.Successfully'), type: 'success' })
            resolve()
          }).catch(error => {
            if (!error || !error.response) {
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
            reject(error)
          })
        })
      }
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
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_CREDS', '')
          commit('SET_COGNITO_USER', '')
          commit('SET_ADMIN_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_ROLES_ACTIVE', [])
          localStorage.clear() // Remove all Cognito tokens...
          removeToken()
          removeAdminToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // This should be only a fed logout to signout from google, facebook, cognito etc?
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_CREDS', '')
        commit('SET_COGNITO_USER', '')
        commit('SET_ADMIN_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_ROLES_ACTIVE', [])
        localStorage.clear() // Remove all Cognito tokens...
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
          MessageBox.confirm('Switch to role ' + role + '', 'Confirm your password', {
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            showInput: true,
            inputValue: '',
            inputPlaceholder: 'Enter password here'
          }).then((action) => {
            changeUserRole(role, action.value).then(getUserInfo().then(response => {
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
      })
    }
  }
}

export default user
