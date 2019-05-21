import { asyncRouterMap, constantRouterMap } from '@/router'
import Layout from '@/views/layout/Layout'
import store from '@/store'
import router from '@/router'
import $ from 'jquery'

const plugin_url = process.env.BASE_PLUGIN_URL || ''

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
function filterAsyncRouter(aasyncRouterMap, roles) {
  if (Object.prototype.toString.call(aasyncRouterMap) === '[object Array]') {
    const accessedRouters = aasyncRouterMap.filter(route => {
      if (hasPermission(roles, route)) {
        if (route.children_orig) {
          route.children = route.children_orig
        }
        route.children_orig = route.children

        if (route.children && route.children.length) {
          // Backup the children orig in case of logging user reload of menu this is a bad hack / fix
          route.children = filterAsyncRouter(route.children, roles)
        }
        return true
      }
      return false
    })
    return accessedRouters
  } else {
    return []
  }
}

const permission = {
  state: {
    routers: constantRouterMap,
    plugin_routers: {},
    loading: true,
    addRouters: [],
    addPlugins: [],
    addPluginsWithoutRoles: [],
    addPluginsInnerWithoutRoles: [],
    origViews: [],
    replacedViews: {}
  },
  getters: {
    getReplacedView(state) {
      return state.replacedViews
    }
  },
  mutations: {
    SET_SETTINGS_LOADING: (state, val) => {
      state.loading = true // val
      state.routers = constantRouterMap.concat(state.addRouters).concat(state.addPlugins)
    },
    SET_ROUTERS: (state, routers) => {
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
    RESET_PLUGINS: (state, routers) => {
      state.addPlugins.length = 0
      state.addRouters.length = 0
      state.routers.length = 0
      state.routers = constantRouterMap.concat(state.addRouters).concat(state.addPlugins)
    },
    SET_REPLACED_VIEW: (state, obj) => {
      var path = obj.route.path
      if (obj.route.children) {
        if (obj.route.children[0] && obj.route.children[0].path) {
          path = path + '/' + obj.route.children[0].path
        }
      }
      // console.error('adding replace view of ' + obj.path + ' to ' + path)
      state.replacedViews[obj.path] = path
    },
    ADD_PLUGINS_WITHOUT_ROLES: (state, routers) => {
      state.addPluginsWithoutRoles = state.addPluginsWithoutRoles.concat(routers)
    },
    ADD_PLUGINS_INNER_MENU_WITHOUT_ROLES: (state, routers) => {
      state.addPluginsInnerWithoutRoles = state.addPluginsInnerWithoutRoles.concat(routers)
    },
    ADD_ORIG: (state, routers) => {
      state.origViews = state.origViews.concat(routers)
    }
  },
  actions: {
    RefreshAllRoutes({ commit, state }, data) {
      commit('RESET_PLUGINS')
      commit('SET_SETTINGS_LOADING', false)
      window.asyncTestRouterMapTemp = window.asyncTestRouterMapTemp.concat(state.origViews).concat([])
      state.routers = constantRouterMap.concat(state.addRouters).concat(state.addPlugins)
      window.app.$store.dispatch('ActivatePlugins', window.app.$store.getters.roles).then((res) => {
        var aR = window.ResetRouter()
        window.app.$router.marcher = aR.matcher
        window.app.$router.addRoutes(window.app.$store.state.permission.routers)

        // addRouters
        /* setTimeout(function() {
          commit('SET_SETTINGS_LOADING', true)
          console.error('set loaded of aaa ok ')
          const roles = window.app.$store.getters.roles
          var tmpRouters = window.app.$store.state.permission.routers
          if (roles)
            var accessedRoutersTmp = filterAsyncRouter(tmpRouters, roles)
            // var tmpRoutes = accessedRouters.concat(accessedRoutersTmp)
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
          }
          */

        // }, 200)
        return res
      })
    },
    RefreshRoutes({ commit, state }, data) {
      return new Promise((resolve, reject) => {
        const roles = data || window.app.$store.getters.roles
        const asyncTestRouterMap = state.addPluginsWithoutRoles
        const innerMenusHash = state.addPluginsInnerWithoutRoles

        const accessedRoutersTmp = filterAsyncRouter(asyncTestRouterMap, roles)
        commit('ADD_PLUGINS', accessedRoutersTmp)
        for (var w in innerMenusHash) {
          // Filter async router Test ... do we need ??
          const accessedInnerRoutersTmp = filterAsyncRouter(innerMenusHash[w], roles)
          commit('ADD_INNER_PLUGINS', { plugin: w, routes: accessedInnerRoutersTmp })
        }

        if (accessedRoutersTmp) {
          window.app.$router.addRoutes(accessedRoutersTmp)
        }
        // window.plugin_loaded--
        resolve(accessedRoutersTmp)
      })
    },
    ActivatePlugins({ commit, state }, data) {
      const roles = data || window.app.$store.getters.roles
      return new Promise((resolve, reject) => {
        const asyncTestRouterMap = []
        var replaceUrls = {}
        const innerMenusHash = {}
        /* eslint-disable */
        // console.error('CORE: ACTIVATING')
        if (window.asyncTestRouterMapTemp.length >= 1) {
          if (!window.app.$store.state.app.ready) {
            // window.asyncTestRouterMapTemp
            commit('ADD_ORIG', window.asyncTestRouterMapTemp)
          }
          try {
            for (var input = null; input = window.asyncTestRouterMapTemp.shift(); input !== undefined ) {
              /* eslint-enable */
              // if ((input.path || '').startsWith('/api/plugins/') || (input.path || '').startsWith('/')) {
              // Fix for loggedin user and show proper menu's
              /*
              if (input['component_orig']) {
                input['component'] = input['component_orig']
              } else {
                input['component_orig'] = input['component']
              }
              */
              if (!(input['component_orig'] || input['component_orig'] === true)) {
                if (!input['component']) {
                  input['component_orig'] = true
                } else {
                  input['component_orig'] = input['component']
                }
                if (input['iscomponent'] === true) {
                  input['component'] = input['component']
                } else {
                  if (!input['layout']) {
                    input['component'] = Layout
                  } else {
                    if (input['layout'] === 'default' || input['layout'] === 'Layout') {
                      input['component'] = Layout
                    }
                  }
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
              asyncTestRouterMap.push(input)
              // }
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
            // commit('ADD_PLUGINS_WITHOUT_ROLES', asyncTestRouterMap)
            // commit('ADD_PLUGINS_INNER_MENU_WITHOUT_ROLES', innerMenusHash)
            // const roles = data || window.app.$store.getters.roles
            // const asyncTestRouterMap = state.addPluginsWithoutRoles
            // console.error(state)
            // console.error(asyncTestRouterMap)
            // const innerMenusHash = state.addPluginsInnerWithoutRoles
            const accessedRoutersTmp = filterAsyncRouter(asyncTestRouterMap, roles)
            commit('ADD_PLUGINS', accessedRoutersTmp)
            for (var w in innerMenusHash) {
              // Filter async router Test ... do we need ??
              const accessedInnerRoutersTmp = filterAsyncRouter(innerMenusHash[w], roles)
              commit('ADD_INNER_PLUGINS', { plugin: w, routes: accessedInnerRoutersTmp })
            }

            if (accessedRoutersTmp) {
              window.app.$router.addRoutes(accessedRoutersTmp)
            }
            // window.plugin_loaded--
            store.dispatch('ActivatePluginsLoaded')
            resolve(accessedRoutersTmp)

            // window.app.$store.dispatch('RefreshRoutes', roles).then((res) => {
            //  resolve(res)
            // })
          } catch (ezz) {
            console.error(ezz)
          }
        } else {
          // window.plugin_loaded--
          resolve([])
        }
      })
    },
    LoadPlugins({ commit }, data) {
      // var self = this
      var objToAdd = []
      var last = 0
      var nFct = function(i, ress, reject) {
        try {
          var nbElem = objToAdd.length
          // console.error('CORE: Adding Plugin')
          if (i < nbElem) {
            var js = objToAdd[i]
            if (!js.src) {
              const tmp = document.createElement('script')
              tmp.type = 'application/javascript'
              tmp.innerHTML = js.innerHTML
              document.body.appendChild(tmp)
              nFct(i + 1, ress, reject)
            } else {
              const tmp = document.createElement('script')
              tmp.type = 'application/javascript'
              tmp.onload = function() {
                try {
                  nFct(i + 1, ress, reject)
                } catch (exx) {
                  console.error(exx.stack)
                }
              }
              tmp.onerror = function() {
                nFct(i + 1, ress, reject)
              }

              tmp.src = js.src
              document.body.appendChild(tmp)
            }
          } else {
            // var self = this
            var fctTmpLoad = function(itrL) {
              itrL++
              if (window.plugin_loaded_max_iter-- >= 0) {
                if (window.plugin_loaded < 0) {
                  setTimeout(function() {
                    fctTmpLoad(itrL++)
                    /*
                    store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
                      resolve()
                    })
                    */
                  }, 100)
                  // wait until all loaded..
                  return
                } else {
                  if (window.plugin_loaded === 0 || window.plugin_loaded >= 2) {
                    window.plugin_loaded++
                    setTimeout(function() {
                      fctTmpLoad(itrL++)
                      /*
                      console.error('waiting for plugin latecy load..')
                      store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
                        resolve()
                      })
                      */
                    }, 150)
                    return
                  }
                }
              }
              /* else {
                console.error('CORE: GOT PLUGIN LOAD TIMEOUT')
              }

              console.error('OK LOADING PLUGIN HERE B DONE')
              console.error('in on completed here')
              console.error('ACTIVATING of ')
              */
              store.dispatch('ActivatePlugins', data).then(function(completedLoad) {
                // console.error('CORE: Activate Plugin')
                // console.error(window.plugin_loaded)
                ress(true)
              })
            }
            fctTmpLoad(0)
            /*
            window.plugin_loaded--
            self.dispatch('ActivatePlugins', data).then(function(completedLoad) {
              console.error('CORE: Activate Plugin')
              console.error(window.plugin_loaded)
              setTimeout(function() {
                ress(true)
              }, 100)
            })
            */
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
          if (plugin_url === '') {
            basePluginWithout = ''
          } else {
            if (window.location.href.indexOf('http://localhost') === 0) {
              // On localhost for development we need to use a custom forwarder
              // This allow local development of a plugin
              basePlugin = 'http://localhost:9528' + basePlugin
              basePluginWithout = 'http://localhost:9528' + basePluginWithout
            } else {
              basePlugin = plugin_url + basePlugin
              basePluginWithout = plugin_url + basePluginWithout
            }
          }
          var tmpPluginUrl = basePlugin + v + '/static'
          var tmpPluginWithoutUrl = basePluginWithout
          store.dispatch('AddPlugin', v)
          var tmpPromise = new Promise((rl, reject) => {
            $.ajax({
              // url: tmpPluginUrl + '/manifest',
              url: tmpPluginUrl + '/index.html',
              type: 'get',
              success: function(data) {
                // var hasScripts = 0
                $(data).each(function(l, v) {
                  var tmp = $(v)
                  if (tmp.attr('src') || tmp.attr('href')) {
                    var lnk = tmp.attr('src') || tmp.attr('href')
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
        let accessedRouters
        const { roles } = data
        /*
        console.error('in loading? still?')
        console.error(window.plugin_loaded)
        var self = this
        if (window.plugin_loaded_max_iter-- >= 0) {
          console.error('in loading? still? here iter')
          if (window.plugin_loaded < 0) {
            setTimeout(function() {
              console.error('waiting for plugin latecy load..')
              store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
                resolve()
              })
            }, 100)
            // wait until all loaded..
            return
          } else {
            console.error('in loading? still? loaded more than 0 ?')
            if (window.plugin_loaded == 0 || window.plugin_loaded >= 2) {
              window.plugin_loaded++
              setTimeout(function() {
                console.error('waiting for plugin latecy load..')
                store.dispatch('GenerateRoutes', { roles }).then(() => { // 根据roles权限生成可访问的路由表
                  resolve()
                })
              }, 150)
            }
            return
          }
        } else {
          console.error('CORE: GOT PLUGIN LOAD TIMEOUT')
        }
        console.error('in on completed here')
        console.error('adding of ')
        */
        /*
        console.error('CORE: GENERATE ROUTES HERE')
        console.error(window.asyncTestRouterMapBootstrapTemp)
        console.error(window.asyncTestRouterMapBootstrapTemp.length)
        */
        router.addRoutes(window.asyncTestRouterMapBootstrapTemp)
        var asyncRouterMapTmp = window.asyncTestRouterMapBootstrapTemp.concat(asyncRouterMap).concat([])

        if (roles) {
          if (roles.indexOf('admin') >= 0) {
            accessedRouters = asyncRouterMapTmp
          } else {
            accessedRouters = filterAsyncRouter(asyncRouterMapTmp, roles)
          }
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMapTmp, roles)
        }
        /*
        var tmpRouters = window.app.$store.state.permission.routers
        var accessedRoutersTmp = filterAsyncRouter(tmpRouters, roles)
        var tmpRoutes = accessedRouters.concat(accessedRoutersTmp)
        // router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
        */
        commit('SET_ROUTERS', accessedRouters) // accessedRouters)
        // router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
        resolve()
      })
    }
  }
}

export default permission
