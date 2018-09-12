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
      this.$store.dispatch('HIDE_SIDEBAR', true)
      this.currentRole = 'firstAdminDashboard'
    } else {
      this.$store.dispatch('SHOW_SIDEBAR', true)
      if (!this.roles.includes('admin')) {
        this.currentRole = 'editorDashboard'
      }
    }
  }
}
</script>
