<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&(mainsidebar.opened||sidebar.opened)" class="drawer-bg" @click="handleClickOutside"/>
    <main-sidebar :class="mainSideBarClass" class="main sidebar-container"/>
    <sidebar class="inner sidebar-container"/>

    <div :class="mainContainerClassObj" class="main-container">
      <navbar/>
      <!--<tags-view/>-->
      <app-main/>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Navbar, Sidebar, MainSidebar, AppMain, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    MainSidebar,
    AppMain,
    TagsView
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapGetters([
      'isLoading'
    ]),
    isInnerSide() {
      return this.$store.state.app.innerSidebar
    },
    sidebar() {
      return this.$store.state.app.sidebar
    },
    mainsidebar() {
      return this.$store.state.app.mainsidebar
    },
    device() {
      return this.$store.state.app.device
    },
    mainSideBarClass() {
      return {
        sidebarHighIndex: this.mainsidebar.visible,
        sidebarLowIndex: !(this.mainsidebar.visible)
      }
    },
    classObj() {
      return {
        hiddenSidebar: !this.mainsidebar.visible,
        hideSidebar: !this.mainsidebar.opened && !this.sidebar.visible,
        openSidebar: this.mainsidebar.opened || this.sidebar.opened,
        hiddenInnerSidebar: this.$store.state.app.innerSidebar && !this.sidebar.visible,
        hideInnerSidebar: this.$store.state.app.innerSidebar === true && !this.sidebar.opened && !this.mainsidebar.visible,
        openInnerSidebar: this.$store.state.app.innerSidebar === true && this.sidebar.opened,
        withoutAnimation: this.mainsidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    mainContainerClassObj() {
      return {
        hiddenSidebar: !this.mainsidebar.visible && !this.sidebar.visible,
        hideSidebar: (!this.mainsidebar.opened && this.mainsidebar.visible) || (!this.sidebar.opened && this.sidebar.visible),
        hiddenInnerSidebar: this.$store.state.app.innerSidebar === true && !this.sidebar.visible,
        hideInnerSidebar: this.$store.state.app.innerSidebar === true && !this.sidebar.opened,
        argaa: this.$store.state.app.innerSideBar === true
      }
    }
  },
  methods: {
    handleClickOutside() {
      // if (this.mainsidebar.opened) {
      this.$store.dispatch('closeMainSideBar', { withoutAnimation: false })
      this.$store.dispatch('closeSideBar', { withoutAnimation: false })
      // } else {
      //  this.$store.dispatch('closeSideBar', { withoutAnimation: false })
      // }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar{
      position: fixed;
      top: 0;
    }
  }
  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 800;
  }
</style>
