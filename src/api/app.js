import request from '@/utils/request'

export function getSiteSettings() {
  return request({
    url: '/app/settings',
    method: 'get'
  }, {
    cache: true,
    maxAge: 15 * 60 * 1000
  })
}

export function getSiteConfiguration(token) {
  return request({
    url: '/app/configuration',
    method: 'get'
  })
}
