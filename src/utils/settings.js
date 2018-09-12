import Cookies from 'js-cookie'
import store from '@/store'

const SettingsKey = 'Settings'

export function getVersion() {
  return store.state.settings.version
}

export function getSettingsToken() {
  var data = Cookies.get(SettingsKey)
  if (data) {
    var settingData = JSON.parse(data)
    return settingData
  }
}

export function setSettingsToken(token) {
  return Cookies.set(SettingsKey, JSON.stringify(token))
}
