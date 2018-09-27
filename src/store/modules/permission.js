import { asyncRouterMap, constantRouterMap } from '@/router'
import Layout from '@/views/layout/Layout'
import store from '@/store'
import $ from 'jquery'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return (roles || []).some(role => route.meta.roles.indexOf(role) >= 0)
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, roles) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(roles, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    addPlugins: [],
    replacedViews: {}
  },
  getters: {
    getReplacedView(state) {
      return state.replacedViews
    }
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(state.addRouters).concat(state.addPlugins)
    },
    ADD_PLUGINS: (state, routers) => {
      state.addPlugins = state.addPlugins.concat(routers)
      state.routers = constantRouterMap.concat(state.addPlugins).concat(state.addRouters)
    },
    SET_REPLACED_VIEW: (state, obj) => {
      console.error('REPLACE OF' + obj.path)
      console.error(obj.route)
      var path = obj.route.path
      if (obj.route.children) {
        if (obj.route.children[0].path) {
          path = path + '/' + obj.route.children[0].path
        }
      }
      state.replacedViews[obj.path] = path
    }
  },
  actions: {
    ActivatePlugins({ commit, state }, data) {
      const roles = data || window.app.$store.getters.roles
      return new Promise((resolve, reject) => {
        // TODO: Check for failed plugins ??
        const asyncTestRouterMap = []
        var replaceUrls = {}

        /* eslint-disable */
        for (var input = null; input = window.asyncTestRouterMapTemp.shift(); input !== undefined ) {
          /* eslint-enable */
          // Make sure we only load the registered plugins paths
          console.error('test input')
          console.error(input.path)
          if ((input.path || '').startsWith('/plugins/') || (input.path || '').startsWith('/')) {
            console.error('OK IT DOES?')
            if (!input['layout']) {
              input['component'] = Layout
            } else {
              if (input['layout'] === 'default' || input['layout'] === 'Layout') {
                input['component'] = Layout
              }
            }
            console.error('test input')
            console.error(input['replacePrecedence'])
            console.error(input['replacePath'])
            if (input['replacePrecedence'] && input['replacePath']) {
              console.error('REPLCE')
              console.error(input)
              var replacePath = input['replacePath']
              var replacePrecedence = input['replacePrecedence']
              if (!replaceUrls[replacePath]) {
                replaceUrls[replacePath] = {
                  precedence: replacePrecedence,
                  route: input
                }
              }
              if (replaceUrls[replacePath].precedence > replacePrecedence) {
                replaceUrls[replacePath] = {
                  precedence: replacePrecedence,
                  route: input
                }
              }
              // commit('SET_REPLACED_VIEW', { path: '/dashboard', route: input })
              // input['path'] = '/dashboard'
            }
            // console.error(window.app.$store)
            asyncTestRouterMap.push(input)
          }
        }
        for (var k in replaceUrls) {
          commit('SET_REPLACED_VIEW', { path: k, route: replaceUrls[k].route })
        }
        const accessedRoutersTmp = filterAsyncRouter(asyncTestRouterMap, roles)
        commit('ADD_PLUGINS', accessedRoutersTmp)
        if (accessedRoutersTmp) {
          window.app.$router.addRoutes(accessedRoutersTmp)
        }
        resolve(accessedRoutersTmp)
      })
    },
    LoadPlugins({ commit }, data) {
      var self = this
      var hasPlugins = false
      return new Promise(function(resolve, reject) {
        var lstPromises = []
        for (var v in store.getters.settings.plugins) {
          var basePlugin = '/plugins/'
          var basePluginWithout = ''
          if (window.location.href.indexOf('http://localhost') === 0) {
            // On localhost for development we need to use a custom forwarder
            // This allow local development of a plugin
            basePlugin = 'http://localhost:9528' + basePlugin
            basePluginWithout = 'http://localhost:9528' + basePluginWithout
          }
          var scriptAdd = 0
          var tmpPluginUrl = basePlugin + v
          var tmpPluginWithoutUrl = basePluginWithout
          var tmpPromise = new Promise((rl, reject) => {
            $.ajax({
              url: tmpPluginUrl + '/',
              type: 'get',
              success: function(data) {
                var hasScripts = 0
                $(data).each(function(l, v) {
                  var tmp = $(v)
                  if (tmp.attr('src') || tmp.attr('href')) {
                    var lnk = tmp.attr('src') || tmp.attr('href')
                    if (lnk.startsWith('/plugins/')) {
                      lnk = tmpPluginWithoutUrl + lnk
                    } else {
                      lnk = tmpPluginUrl + lnk
                    }

                    if (tmp.attr('src')) {
                      tmp.attr('src', lnk)
                    } else if (tmp.attr('href')) {
                      tmp.attr('href', lnk)
                    }
                    if (tmp.is('link')) {
                      $('body').append(tmp)
                    }
                    if (tmp.is('script')) {
                      if (tmp.attr('src')) {
                        scriptAdd++
                        hasPlugins = true
                        hasScripts = true
                        // TODO: Return from getSettings ?
                        const script = document.createElement('script')
                        script.type = 'text/javascript'
                        /*
                        if (tmp.attr('src').startsWith(basePlugin)) {
                          script.src = tmpPluginWithoutUrl + tmp.attr('src')
                        } else {
                          script.src = tmpPluginUrl + tmp.attr('src')
                        }
                        */
                        script.src = tmp.attr('src')
                        script.onload = () => {
                          try {
                            scriptAdd--

                            if (scriptAdd <= 0) {
                              setTimeout(function() {
                                if (scriptAdd <= 0) {
                                  rl(true)
                                }
                              }, 100)
                            }
                          } catch (exx) {
                            console.error(exx.stack)
                          }
                        }
                        // document.head.appendChild(script)
                        document.body.appendChild(script)
                      }
                    }
                  } else {
                    if (tmp.is('script')) {
                      // Just raw script nothing else.. just add it..
                      $('body').append(tmp)
                    }
                  }
                })
                if (hasScripts === 0) {
                  rl()
                }
              },
              error: function(err) {
                console.error('Could not load plugin ...', v)
                console.error(err)
                rl()
                // $('#wtf').html($(data).find('#link').text());
                // resolve()
              }
            })
          })
          lstPromises.push(tmpPromise)
        }

        Promise.all(lstPromises).then(function(rr) {
          console.error(this)
          // console.error(self) // self is store
          self.dispatch('ActivatePlugins', data)
          // .then(function(r) {
          resolve(hasPlugins)
          // resolve(r)
          // })
        })
      })
    },
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        let accessedRouters

        if (roles) {
          if (roles.indexOf('admin') >= 0) {
            accessedRouters = asyncRouterMap
          } else {
            accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
          }
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        }
        console.error('ading routes of ..')
        console.error(accessedRouters)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
