<template>
  <el-scrollbar :hidden="isHidden" wrap-class="scrollbar-wrapper" class="sidebar-container">
    <hamburger v-if="device == 'mobile' && isSidebarCollapse" :toggle-click="toggleSideBar" :is-hidden="isToolHidden" :is-active="!isToolHidden" class="a2 hamburger-container" style="padding:15px;background-color: rgb(48, 65, 86);font-color:white;color:white"/>
    <hamburger v-if="device == 'desktop'" :toggle-click="toggleMainSideBar" :is-hidden="isToolHidden" :is-active="!isToolHidden" class="a3 hamburger-container" style="padding:15px;background-color: rgb(48, 65, 86);font-color:white;color:white"/>
    <el-menu
      v-if="router_loaded"
      :hidden="isHidden"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      mode="vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <main-sidebar-item v-for="route in permission_routers" :key="route.name" :item="route" :base-path="route.path"/>
    </el-menu>
    <el-menu
      v-else
      :hidden="isHidden"
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      mode="vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    />
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import MainSidebarItem from './MainSidebarItem'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    MainSidebarItem,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'permission_routers',
      'sidebar',
      'device',
      'mainsidebar',
      'router_loaded',
      'isLoading'
    ]),
    isCollapse() {
      return !this.mainsidebar.opened
    },
    isHidden() {
      // return !this.mainsidebar.visible
      return (!this.sidebar.visible && !this.mainsidebar.visible)
    },
    isSidebarCollapse() {
      return !this.sidebar.opened
    },
    isToolHidden() {
      return !this.sidebar.visible
    }
  },
  methods: {
    toggleMainSideBar() {
      this.$store.dispatch('toggleMainSideBar')
    },
    toggleSideBar() {
      this.$store.dispatch('toggleSideBar')
    }
  }
}
</script>
