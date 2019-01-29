<template>
  <div style="z-index:900;background-color:white">
    <hamburger :toggle-click="toggleSideBar" :is-hidden="isMainActive || isHidden" :is-active="!isMainActive" class="a1 hamburger-container"/>
    <br>
    <el-scrollbar :hidden="isHidden" wrap-class="scrollbar-wrapper" class="custom-wrapper">
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
        <inner-sidebar-item v-for="route in getPluginSideMenu" :key="route.name" :item="route" :base-path="route.path"/>
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
      tempActive: true,
      lastActivePlugin: 'none'
    }
  },
  computed: {
    ...mapGetters([
      'plugin_permission_routers',
      'sidebar',
      'isLoading',
      'activePlugin',
      'mainsidebar',
      'device'
    ]),
    isMainActive() {
      return this.mainsidebar.opened && this.mainsidebar.visible
    },
    isCollapse() {
      return !this.sidebar.opened
    },
    isHidden() {
      return !this.sidebar.visible
    },
    getPluginSideMenu() {
      // if (this.isLoading)
      console.error('did it change here ?' + this.activePlugin)
      // if (this.lastActivePlugin !== this.activePlugin) {
      // this.lastActivePlugin = this.activePlugin
      console.error('test a333a')
      console.error('GETE PLUGIN SIDE MENU USING PLUGIN OF ' + this.activePlugin)
      console.error(this.plugin_permission_routers[this.activePlugin])
      if (this.plugin_permission_routers[this.activePlugin]) {
        console.error('OK HERE DIDSPACH SHOW?')
        console.error('test a333bbb')
        this.$store.dispatch('showInnerSidebarForce')
        return this.plugin_permission_routers[this.activePlugin]
      } else {
        console.error('OK HERE DIDSPACH HIDE?')
        console.error('test a333ccc')
        this.$store.dispatch('hideInnerSidebarForce')
      }
      // }
    }
  },
  methods: {
    toggleSideBar() {
      if (this.device === 'mobile') {
        this.toggleMainSideBar()
      } else {
        if (this.sidebar.opened) {
          this.toggleMainSideBar()
        } else {
          this.$store.dispatch('toggleSideBar')
        }
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
