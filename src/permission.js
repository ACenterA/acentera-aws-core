import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

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

router.beforeEach((to, from, next) => {
  try {
    NProgress.start() // start progress bar
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
        store.dispatch('GenerateRoutes', { }).then(() => { // 根据roles权限生成可访问的路由表
          router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
          next() // {  path: '/error/no_api_access_error', replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
          NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
        })
      } else {
        next()
      }
    } else {
      store.dispatch('GetSiteSettings').then(res => { // Required for firstTime loging notification in login page and other plugins infos?
        if (getToken()) { // determine if there has token
          store.commit('SET_ROUTE_INFO', { to, from, next })
          /* has token*/
          if (to.path === '/login') {
            next({ path: '/' })
            NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
          } else {
            if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
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
                            if (hasPlugins) {
                              // do not call next the plugin will do it
                            } else {
                              next({ ...to, replace: true }) // hack ... addRoutes, set the replace: true so the navigation will not leave a history record
                            }
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
                            console.error('hasPlugins 2 ' + hasPlugins)
                            if (hasPlugins) {
                              // do not call next the plugin will do it
                            } else {
                              next({ ...to, replace: true }) // hack ... addRoutes, set the replace: true so the navigation will not leave a history record
                            }
                          })
                        }).catch((err) => {
                          console.error('GOT ERROR HERE A?')
                          console.error(err)
                          next()
                        })
                      })
                    }
                  } else {
                    store.dispatch('RouteChange').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                      console.error('routeChange 01')
                      console.error(res)
                      next()
                    })
                  }
                }).catch((err) => {
                  console.error('ERORR FAILED HERE')
                  store.dispatch('FedLogOut').then(() => {
                    Message.error(err || 'Verification failed, please login again')
                    next({ path: '/' })
                  }).catch((ex) => {
                    console.error('ERORR FAILED HERE 1 ')
                    // assume it always works
                    next({ path: '/' })
                  })
                })
              }).catch((err) => {
                console.error(err.stack)
                next()
              })
            } else {
              // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
              if (hasPermission(store.getters.roles, to.meta.roles)) {
                console.error('test too')
                var replacedViews = store.getters.getReplacedView
                console.error('state is vs ')
                console.error(replacedViews)
                if (replacedViews[to.path]) {
                  console.error(' AA ')
                  store.dispatch('RouteChangeReplaced').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                    next({ path: replacedViews[to.path], replace: true })
                  })
                  // next()
                } else {
                  console.error(' BB ')
                  // return currRoute.fullPath
                  console.error()
                  console.error(to)
                  store.dispatch('RouteChange').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                    next()
                  })
                }
              } else {
                store.dispatch('RouteNotAuthorized').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
                  console.error('/401 not authorized')
                  console.error(res)
                  next({ path: '/401', replace: true, query: { noGoBack: true }})
                })
              }
              // 可删 ↑
            }
          }
        } else {
          /* has no token*/
          console.error('here aa FF')
          if (whiteList.indexOf(to.path) !== -1 || to.path.startsWith('/public/')) {
            store.dispatch('RouteChange').then(res => { // Tell plugins all plugins loaded, user logged in and ready.....
              next()
            })
          } else {
            next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
            NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
          }
        }
      }).catch((err) => {
        console.error(err)
        store.dispatch('RouteError').then(res => { // Tell an error occured
          console.error('route error')
          console.error(res)
        })
        /*
        // store.dispatch('FedLogOut').then(() => {
        Message.error(err || 'Verification failed, please login again')
        // next({ path: '/' })
        // }).catch((ex) => {
          // assume it always works
          next({ path: '/' })
        })
        NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
        */
      })
    }
  } catch (ez) {
    console.error(ez.stack)
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
