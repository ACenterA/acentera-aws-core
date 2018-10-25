<template>
  <div style="z-index:1">
    <hamburger :toggle-click="toggleMainSideBar" :is-hidden="isMainActive" :is-active="!isMainActive" class="hamburger-container" style="padding:15px"/>
    <el-scrollbar :hidden="isHidden" wrap-class="scrollbar-wrapper custom-wrapper">
      <el-menu
        :hidden="isHidden"
        :show-timeout="200"
        :default-active="$route.path"
        :collapse="isCollapse"
        mode="vertical"
        background-color="#ffffff"
        class="el-menu-vertical-demo"
        text-color="#000000"
        active-text-color="#409EFF">
        <inner-sidebar-item v-for="route in getPluginSideMenu()" :key="route.name" :item="route" :base-path="route.path"/>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import InnerSidebarItem from './InnerSidebarItem'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    InnerSidebarItem,
    Hamburger
  },
  data() {
    return {
      tempActive: true
    }
  },
  computed: {
    ...mapGetters([
      'plugin_permission_routers',
      'sidebar',
      'activePlugin',
      'mainsidebar'
    ]),
    isMainActive() {
      return this.mainsidebar.opened && this.mainsidebar.visible
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    isHidden() {
      return !this.sidebar.visible
    }
  },
  methods: {
    getPluginSideMenu() {
      console.error('test a333a')
      if (this.plugin_permission_routers[this.activePlugin]) {
        console.error('test a333bbb')
        return this.plugin_permission_routers[this.activePlugin]
      } else {
        console.error('test a333ccc')
        this.$store.dispatch('hideInnerSidebarForce')
      }
    },
    toggleMainSideBar() {
      this.$store.dispatch('toggleMainSideBarForce')
    }
  }
}
</script>
<style>
  .el-menu-vertical-demo {
    background-color: white !important;
  }
</style>
