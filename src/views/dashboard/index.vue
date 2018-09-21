<template>
  <div class="dashboard-container">
    <component :is="currentRole"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import adminDashboard from './admin'
import editorDashboard from './editor'
import guestDashboard from './guest'
import firstAdminDashboard from './firstAdmin'
import loading from './loading'

export default {
  name: 'Dashboard',
  components: { adminDashboard, editorDashboard, firstAdminDashboard, guestDashboard, loading },
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
      this.$store.dispatch('showSidebar', true)
      if (!this.roles.includes('admin')) {
        if (!this.roles.includes('editor')) {
          this.currentRole = 'guestDashboard'
        } else {
          this.currentRole = 'editorDashboard'
        }
      } else {
        this.currentRole = 'adminDashboard'
      }
    }
  }
}
</script>
