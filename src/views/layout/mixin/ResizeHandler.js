import store from '@/store'

const { body } = document
const WIDTH = 1024
const RATIO = 3

export default {
  watch: {
    $route(route) {
      if (this.device === 'mobile' && this.sidebar.opened) {
        store.dispatch('closeSideBar', { withoutAnimation: false })
      }
    }
  },
  beforeMount() {
    window.addEventListener('resize', this.resizeHandler)
  },
  mounted() {
    const isMobile = this.isMobile()
    if (isMobile) {
      store.dispatch('toggleDevice', 'mobile')
      console.error('called close sidebar here 1')
      store.dispatch('closeSideBar', { withoutAnimation: true })
      store.dispatch('closeMainSideBar', { withoutAnimation: true })
    }
  },
  methods: {
    isMobile() {
      const rect = body.getBoundingClientRect()
      if (rect.width > 800) {
        return false
      }
      return rect.width - RATIO < WIDTH
    },
    resizeHandler() {
      if (!document.hidden) {
        const isMobile = this.isMobile()
        store.dispatch('toggleDevice', isMobile ? 'mobile' : 'desktop')

        if (isMobile) {
          console.error('called close sidebar here 2')
          store.dispatch('closeSideBar', { withoutAnimation: true })
          store.dispatch('closeMainSideBar', { withoutAnimation: true })
        }
      }
    }
  }
}
