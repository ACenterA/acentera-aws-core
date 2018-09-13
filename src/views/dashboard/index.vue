<template>
  <div class="dashboard-container">
    <component :is="currentRole"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'
import firstAdminDashboard from './firstAdmin'
import loading from './loading'

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard, firstAdminDashboard, loading },
  data() {
    return {
      currentRole: 'loading'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  created() {
    if (this.roles.includes('FirstAdmin')) {
      this.$store.dispatch('hideSidebar', true)
      this.currentRole = 'firstAdminDashboard'
    } else {
      console.error('CALLING SHOW SIDEBAR')
      this.$store.dispatch('showSidebar', true)
      if (!this.roles.includes('admin')) {
        this.currentRole = 'editorDashboard'
      } else {
        this.currentRole = 'adminDashboard'
      }
    }
  }
}
</script>
