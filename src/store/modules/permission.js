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
    plugin_routers: {},
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
      // console.error('SET OF ROUTERS.....')
      state.addRouters = routers
      state.routers = constantRouterMap.concat(state.addRouters).concat(state.addPlugins)
    },
    ADD_INNER_PLUGINS: (state, data) => {
      state.plugin_routers[data.plugin] = data.routes
    },
    ADD_PLUGINS: (state, routers) => {
      state.addPlugins = state.addPlugins.concat(routers)
      state.routers = constantRouterMap.concat(state.addPlugins).concat(state.addRouters)
    },
    SET_REPLACED_VIEW: (state, obj) => {
      // console.error('REPLACE OF' + obj.path)
      // console.error(obj.route)
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
        const asyncTestRouterMap = []
        var replaceUrls = {}
        const innerMenusHash = {}
        console.error('IN ACTIVE PLUGIN')
        /* eslint-disable */
        if (window.asyncTestRouterMapTemp.length >= 1) {
          try {
            for (var input = null; input = window.asyncTestRouterMapTemp.shift(); input !== undefined ) {
              /* eslint-enable */
              console.error(input.path)
              if ((input.path || '').startsWith('/api/plugins/') || (input.path || '').startsWith('/')) {
                console.error('RECEIVED PLUGIN TEST ACTIVE')
                if (!input['layout']) {
                  input['component'] = Layout
                } else {
                  if (input['layout'] === 'default' || input['layout'] === 'Layout') {
                    input['component'] = Layout
                  }
                }
                if (input['replacePrecedence'] && input['replacePath']) {
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
                }
                if (input['innerMenu']) {
                  if (!innerMenusHash['innerMenu']) {
                    innerMenusHash[input['innerMenu']] = []
                  }
                  innerMenusHash[input['innerMenu']].push(input)
                }
                console.error('got innermnu hash of ')
                console.error(innerMenusHash)
                asyncTestRouterMap.push(input)
              }
            }
          } catch (ez) {
            console.error(ez)
          }
          try {
            for (var k in replaceUrls) {
              commit('SET_REPLACED_VIEW', { path: k, route: replaceUrls[k].route })
            }
          } catch (eza) {
            console.error(eza)
          }

          try {
            const accessedRoutersTmp = filterAsyncRouter(asyncTestRouterMap, roles)
            commit('ADD_PLUGINS', accessedRoutersTmp)
            for (var w in innerMenusHash) {
              // Filter async router Test ... do we need ??
              const accessedInnerRoutersTmp = filterAsyncRouter(innerMenusHash[w], roles)
              console.error(accessedInnerRoutersTmp)
              commit('ADD_INNER_PLUGINS', { plugin: w, routes: accessedInnerRoutersTmp })
            }
            if (accessedRoutersTmp) {
              window.app.$router.addRoutes(accessedRoutersTmp)
            }
            resolve(accessedRoutersTmp)
          } catch (ezz) {
            console.error(ezz)
          }
        } else {
          console.error('resolving EMPTY HERE')
          resolve([])
        }
      })
    },
    LoadPlugins({ commit }, data) {
      var self = this
      var objToAdd = []
      var last = 0
      var nFct = function(i, resolve, reject) {
        try {
          var nbElem = objToAdd.length
          if (i < nbElem) {
            var js = objToAdd[i]
            if (!js.src) {
              const tmp = document.createElement('script')
              tmp.type = 'application/javascript'
              tmp.innerHTML = js.innerHTML
              document.body.appendChild(tmp)
              nFct(i + 1, resolve, reject)
            } else {
              const tmp = document.createElement('script')
              tmp.type = 'application/javascript'
              tmp.onload = function() {
                try {
                  nFct(i + 1, resolve, reject)
                } catch (exx) {
                  console.error(exx.stack)
                }
              }
              tmp.onerror = function() {
                nFct(i + 1, resolve, reject)
              }

              tmp.src = js.src
              document.body.appendChild(tmp)
            }
          } else {
            self.dispatch('ActivatePlugins', data)
            resolve(true)
          }
        } catch (z) {
          console.error(z)
        }
      }

      return new Promise(function(resolve, reject) {
        var lstPromises = []
        for (var v in store.getters.settings.plugins) {
          var basePlugin = '/api/plugins/'
          var basePluginWithout = ''
          if (window.location.href.indexOf('http://localhost') === 0) {
            // On localhost for development we need to use a custom forwarder
            // This allow local development of a plugin
            basePlugin = 'http://localhost:9528' + basePlugin
            basePluginWithout = 'http://localhost:9528' + basePluginWithout
          }
          var tmpPluginUrl = basePlugin + v + '/static'
          var tmpPluginWithoutUrl = basePluginWithout
          var tmpPromise = new Promise((rl, reject) => {
            $.ajax({
              // url: tmpPluginUrl + '/manifest',
              url: tmpPluginUrl + '/',
              type: 'get',
              success: function(data) {
                // var hasScripts = 0
                $(data).each(function(l, v) {
                  var tmp = $(v)
                  if (tmp.attr('src') || tmp.attr('href')) {
                    var lnk = tmp.attr('src') || tmp.attr('href')
                    // console.error('GOT LINK OF ' + lnk)
                    if (lnk.startsWith('/api/plugins/')) {
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
                        objToAdd.push({ 'src': tmp.attr('src') })
                      }
                    }
                  } else {
                    if (tmp.is('script')) {
                      // Just raw script nothing else.. just add it..
                      // console.error('-------------------OK SIMPLY APPENDING TMP 1------------------')
                      try {
                        var innerHTML = 'try { ' + tmp[0].innerHTML + ' } catch (fe) { console.error(fe.stack); console.error(fe); }' // layout[i].text + "//# sourceURL=test_file_name.js";
                        objToAdd.push({ 'innerHTML': innerHTML })
                      } catch (exx) {
                        objToAdd.push(tmp)
                      }
                    }
                  }
                })
                rl(true)
              },
              error: function(err) {
                console.error(err)
                rl(false)
              }
            })
          })
          lstPromises.push(tmpPromise)
        }

        Promise.all(lstPromises).then(function(rr) {
          if (objToAdd.length <= 0) {
            resolve(0) // no plugins
          } else {
            nFct(last, resolve, reject)
          }
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
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
