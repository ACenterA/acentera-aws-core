const getters = {
  sidebar: state => state.app.sidebar,
  language: state => state.app.language,
  size: state => state.app.size,
  device: state => state.app.device,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  lastTokenRefresh: state => state.user.lastTokenRefresh,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  status: state => state.user.status,
  roles: state => state.user.roles_active,
  available_roles: state => state.user.roles,
  setting: state => state.user.setting,
  permission_routers: state => state.permission.routers,
  addRouters: state => state.permission.addRouters,
  errorLogs: state => state.errorLog.logs,
  settings: state => state.settings,
  isCognitoUser: state => {
    try {
      console.error(state)
      if (state.settings) {
        return !!state.settings.cognito.cognito.IDENTITY_POOL_ID
      }
    } catch (e) {
      return false
    }
  }
}
export default getters
