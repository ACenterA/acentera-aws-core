import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: true })// NProgress Configuration
window.NProgress = window.NProgress || NProgress

// permission judge function
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin permission passed directly
  if (!permissionRoles) return true
  return (roles || []).some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = [
  '/login',
  '/auth-redirect',
  '/error/no_api_access',
  '/passwordreset',
  '/401',
  '/404'
] // no redirect whitelist

var fixLoop = 0
router.beforeEach((to, from, next) => {
  try {
    if (fixLoop >= 10) {
      console.error('PREVENT LOOP ERROR')
      return
    }
    // console.error('BEFORE EACH 01')
    store.dispatch('NPROGRESS_START').then((res) => {
      // NProgress.start() // start progress bar
      if (
        to.path.startsWith('/error/') ||
        to.path.startsWith('/4') ||
        to.path === '/error/no_api_access' ||
        to.path === '/error/no_api_access_error' ||
        to.path.startsWith('/public/')
      ) {
        // TODO: Make sure the GenerateRoutes always add at least 1 route?
        console.error('in here a')
        if (!store.getters || !store.getters.addRouters || (store.getters.addRouters && store.getters.addRouters.length <= 0)) {
          console.error('in here b')
          store.dispatch('NPROGRESS_START').then((res) => {
            store.dispatch('GenerateRoutes', { }).then(() => { // 根据roles权限生成可访问的路由表
              router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
              next() // {  path: '/error/no_api_access_error', replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
              store.commit('NPROGRESS_END_DELAY')
              // store.commit('NPROGRESS_END_DELAY')
              // NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
              // }, 60)
            })
          })
        } else {
          // store.commit('NPROGRESS_END')
          next()
          // store.commit('NPROGRESS_END_DELAY')
        }
      } else {
        store.dispatch('NPROGRESS_START').then((res) => {
          store.dispatch('GetSiteSettings').then(res => { // Required for firstTime loging notification in login page and other plugins infos?
            if (getToken()) { // determine if there has token
              store.dispatch('SET_ROUTE_INFO', { to, from, next }).then(res => { // Required for firstTime loging notification in login page and other plugins infos?
                // store.commit('SET_ROUTE_INFO', { to, from, next })
                /* has token*/
                if (to.path === '/login') {
                  next({ path: '/' })
                  store.commit('NPROGRESS_END')
                  // store.commit('NPROGRESS_END_DELAY')
                  // setTimeout(function() {
                  //  NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
                  // }, 60)
                } else {
                  console.error('GET SITE SETTINGS HERE AA???')
                  if (store.getters.roles.length === 0 && (!store.getters || !store.getters.addRouters || (store.getters.addRouters && store.getters.addRouters.length <= 0))) { // 判断当前用户是否已拉取完user_info信息
                    store.dispatch('GetSiteConfiguration').then(res => { // get site configuration since we have logged in successfully
                      console.error('ok dispatched')
                      store.dispatch('GetUserInfo').then(res => { // user_info
                        console.error('GET USER INFO RES')
                        console.error(res)
                        if (!store.getters || !store.getters.addRouters || (store.getters.addRouters && store.getters.addRouters.length <= 0)) {
                          const roles = []
                          var len = res.data.roles.length // note: roles must be a array! such as: ['editor','develop']
                          for (var z = 0; z < len; z++) {
                            roles.push(res.data.roles[z].toLowerCase())
                          }

                          console.error('GET USER INFO RES 1')
                          if (to.path.startsWith('/plugins/')) {
                            store.dispatch('LoadPlugins', { roles }).then((hasPlugins) => {
                              store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
                                router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
                                store.dispatch('Ready').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....]
                                  console.error('hasPlugins 1 ' + hasPlugins)
                                  fixLoop++
                                  if (hasPlugins) {
                                    // do not call next the plugin will do it
                                    // store.commit('NPROGRESS_END')
                                  } else {
                                    // store.commit('NPROGRESS_END')
                                    next({ ...to, replace: true }) // hack ... addRoutes, set the replace: true so the navigation will not leave a history record
                                    // store.commit('NPROGRESS_END_DELAY')
                                  }
                                  store.commit('NPROGRESS_END_DELAY')
                                }).catch((err) => {
                                  console.error('A2 GOT ERROR HERE?')
                                  console.error(err)
                                })
                              })
                            }).catch((err) => {
                              console.error('GOT ERROR HERE?')
                              console.error(err)
                            })
                          } else {
                            console.error('generate routes Z')
                            store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
                              console.error('generate routes Z 1')
                              router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
                              console.error(store.getters.addRouters)
                              console.error('generate routes Z 2')
                              store.dispatch('LoadPlugins', { roles }).then((hasPlugins) => {
                                console.error('generate routes Z 3')
                                store.dispatch('Ready').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                                  fixLoop++
                                  console.error('hasPlugins 2 ' + hasPlugins)
                                  if (hasPlugins) {
                                    // do not call next the plugin will do it
                                    // var tmpTo = to
                                    var tmpFrom = from
                                    setTimeout(function() {
                                      // in case of error
                                      // could not load plugins
                                      if (window.app.$route.path === tmpFrom.path) {
                                        console.error('[ERROR] The plugin did successfully load. Have some of them failed?')
                                        next({ path: '/500', replace: true, query: { noGoBack: true }})
                                      }
                                      // next({ ...to, replace: true }) // hack ... addRoutes, set the replace: true so the navigation will not leave a history record
                                    }, 10000)
                                  } else {
                                    // store.commit('NPROGRESS_END')
                                    next({ ...to, replace: true }) // hack ... addRoutes, set the replace: true so the navigation will not leave a history record
                                    // store.commit('NPROGRESS_END_DELAY')
                                  }
                                  store.commit('NPROGRESS_END_DELAY')
                                }).catch((err) => {
                                  console.error('GOT ERROR HERE ZA?')
                                  console.error(err)
                                  next({ ...to, replace: true }) // hack ... addRoutes, set the replace: true so the navigation will not leave a history record
                                  store.commit('NPROGRESS_END')
                                  // store.commit('NPROGRESS_END_DELAY')
                                })
                              }).catch((err) => {
                                console.error('GOT ERROR HERE A?')
                                console.error(err)
                                // store.commit('NPROGRESS_END')
                                next()
                                // store.commit('NPROGRESS_END_DELAY')
                                store.commit('NPROGRESS_END_DELAY')
                              })
                            })
                          }
                        } else {
                          store.dispatch('RouteChange').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                            console.error('routeChange 01')
                            console.error(res)
                            // store.commit('NPROGRESS_END')
                            next()
                            // store.commit('NPROGRESS_END_DELAY')
                            store.commit('NPROGRESS_END_DELAY')
                          })
                        }
                      }).catch((err) => {
                        console.error('ERORR FAILED HERE')
                        store.dispatch('FedLogOut').then(() => {
                          Message.error(err || 'Verification failed, please login again')
                          // store.commit('NPROGRESS_END')
                          next({ path: '/' })
                          // store.commit('NPROGRESS_END_DELAY')
                          store.commit('NPROGRESS_END_DELAY')
                        }).catch((ex) => {
                          console.error('ERORR FAILED HERE 1 ')
                          // assume it always works
                          // store.commit('NPROGRESS_END')
                          next({ path: '/' })
                          // store.commit('NPROGRESS_END_DELAY')
                          store.commit('NPROGRESS_END_DELAY')
                        })
                      })
                    }).catch((err) => {
                      console.error(err.stack)
                      // store.commit('NPROGRESS_END')
                      next()
                      // store.commit('NPROGRESS_END_DELAY')
                      store.commit('NPROGRESS_END_DELAY')
                    })
                  } else {
                    // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
                    console.error('check if has permission..')
                    if (hasPermission(store.getters.roles, to.meta.roles)) {
                      console.error('test too')
                      var replacedViews = store.getters.getReplacedView
                      console.error('state is vs ')
                      console.error(replacedViews)
                      if (replacedViews[to.path]) {
                        console.error(' AA ')
                        store.dispatch('RouteChangeReplaced').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                          // store.commit('NPROGRESS_END')
                          next({ path: replacedViews[to.path], replace: true })
                          store.commit('NPROGRESS_END_DELAY')
                          // store.commit('NPROGRESS_END_DELAY')
                        })
                        // next()
                      } else {
                        console.error(' BB ')
                        // return currRoute.fullPath
                        console.error()
                        console.error(to)
                        store.dispatch('RouteChange').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                          next()
                          store.commit('NPROGRESS_END_DELAY')
                          // store.commit('NPROGRESS_END_DELAY')
                          // store.commit('NPROGRESS_END')
                        })
                      }
                    } else {
                      console.error('not athorized dispatch')
                      store.dispatch('RouteNotAuthorized').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                        console.error('/401 not authorized')
                        console.error(res)
                        next({ path: '/401', replace: true, query: { noGoBack: true }})
                        store.commit('NPROGRESS_END')
                        // store.commit('NPROGRESS_END_NOW')
                        // store.commit('NPROGRESS_END')
                      })
                    }
                    // 可删 ↑
                  }
                }
              })
            } else {
              /* has no token*/
              console.error('here aa FF')
              if (whiteList.indexOf(to.path) !== -1 || to.path.startsWith('/public/')) {
                store.dispatch('RouteChange').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                  // store.commit('NPROGRESS_END')
                  next()
                  store.commit('NPROGRESS_END_DELAY')
                  // store.commit('NPROGRESS_END_DELAY')
                })
              } else {
                // store.commit('NPROGRESS_END')
                next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
                store.commit('NPROGRESS_END')
                // setTimeout(function() {
                //  NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
                // }, 60)
              }
            }
          }).catch((err) => {
            console.error(err)
            store.commit('NPROGRESS_START')
            store.dispatch('RouteError').then(res => { // Tell an error occured
              console.error('route error')
              console.error(res)
              store.commit('NPROGRESS_END')
            })
            /*
            // store.dispatch('FedLogOut').then(() => {
            Message.error(err || 'Verification failed, please login again')
            // next({ path: '/' })
            // }).catch((ex) => {
              // assume it always works
              next({ path: '/' })
            })
            // NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
            */
          })
        })
      }
      setTimeout(function() {
        store.commit('NPROGRESS_END')
      }, 500)
    })
  } catch (ez) {
    console.error(ez.stack)
  }
})

router.afterEach(() => {
  // allow a few timeout for the mounted view to potentially tell its still waiting for ajax resources...
  // ie: do now show the UI just yet ...
  /*
  setTimeout(function() {
    // this doesnt always get called ...
    store.commit('NPROGRESS_END')
  // setTimeout(function() {
  //  NProgress.done() // finish progress bar
  // }, 60)
  },150)
  */
})
