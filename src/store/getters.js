const getters = {
  sidebar: state => state.app.sidebar,
  mainsidebar: state => state.app.mainsidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  credentials: state => state.user.credentials,
  lastTokenRefresh: state => state.user.lastTokenRefresh,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  status: state => state.user.status,
  roles: state => state.user.roles_active,
  available_roles: state => state.user.roles,
  setting: state => state.user.setting,
  permission_routers: state => state.permission.routers,
  plugin_permission_routers: state => state.permission.plugin_routers,
  activePlugin: state => state.app.activePlugin,
  addRouters: state => state.permission.addRouters,
  errorLogs: state => state.errorLog.logs,
  settings: state => state.settings,
  version: state => state.settings.version || '0.00',
  customclass: state => state.app.customClass,
  apollo: state => state.settings.apollo,
  graphql: state => state.settings.graphql,
  isCognitoUser: state => {
    try {
      if (state.settings) {
        if (state.settings.aws && state.settings.aws.cognito && state.settings.aws.cognito.IDENTITY_POOL_ID && state.settings.aws.cognito.IDENTITY_POOL_ID !== '') {
          return !!state.settings.aws.cognito.IDENTITY_POOL_ID
        } else {
          return !!state.settings.cognito.cognito.IDENTITY_POOL_ID
        }
      }
    } catch (e) {
      return false
    }
  }
}
export default getters
