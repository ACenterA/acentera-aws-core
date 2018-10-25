<template>
  <el-scrollbar :hidden="isHidden" wrap-class="scrollbar-wrapper" class="sidebar-container" style="z-index:10">
    <hamburger :toggle-click="toggleMainSideBar" :is-hidden="isToolHidden" :is-active="!isToolHidden" class="hamburger-container" style="padding:15px;background-color: rgb(48, 65, 86);font-color:white;color:white"/>
    <el-menu
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
      'mainsidebar'
    ]),
    isCollapse() {
      return !this.mainsidebar.opened
    },
    isHidden() {
      return !this.mainsidebar.visible
    },
    isToolHidden() {
      return !this.sidebar.visible
    }
  },
  methods: {
    toggleMainSideBar() {
      this.$store.dispatch('toggleMainSideBar')
    }
  }
}
</script>
