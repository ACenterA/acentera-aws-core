<template>
  <div v-if="!item.hidden&&item.children" class="custom-menu-wrapper">
    <template v-if="hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow">
      <a :href="onlyOneChild.path" target="_blank" @click="clickLink(onlyOneChild.path,$event)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item v-if="onlyOneChild.meta" :icon="onlyOneChild.meta.icon" :title="generateTitle(onlyOneChild.meta.title)" />
        </el-menu-item>
      </a>
    </template>
    <template v-if="item.flatChildrens && item.children">
      <template v-for="child in item.children" v-if="!child.hidden">
        <template v-if="child.children">
          <inner-sidebar-item v-if="child.children&&child.children.length>0" :is-nest="true" :item="child" :key="child.path" :base-path="resolvePath(child.path)" class="custom-nest-menu"/>
          <a v-else :href="child.path" :key="child.name" target="_blank" @click="clickLink(child.path,$event)">
            <el-menu-item :index="resolvePath(child.path)">
              <item v-if="child.meta" :icon="child.meta.icon" :title="generateTitle(child.meta.title)" />
            </el-menu-item>
          </a>
        </template>
        <a v-if="!child.children" :href="child.path" :key="child.path" target="_blank" @click="clickLink(child.path,$event)">
          <el-menu-item :index="resolvePath(child.path)" :class="{'submenu-title-noDropdown':!isNest}">
            <item v-if="child.meta" :icon="child.meta.icon" :title="generateTitle(child.meta.title)" />
          </el-menu-item>
        </a>
      </template>
    </template>
    <el-submenu v-if="!item.flatChildrens && !(hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow)" :index="item.name||item.path">
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta.icon" :title="generateTitle(item.meta.title)" />
      </template>

      <template v-for="child in item.children" v-if="item.flatChildrens || !child.hidden">
        <inner-sidebar-item v-if="child.children&&child.children.length>0" :is-nest="true" :item="child" :key="child.path" :base-path="resolvePath(child.path)" class="custom-nest-menu"/>

        <a v-else :href="child.path" :key="child.name" target="_blank" @click="clickLink(child.path,$event)">
          <el-menu-item :index="resolvePath(child.path)">
            <item v-if="child.meta" :icon="child.meta.icon" :title="generateTitle(child.meta.title)" />
          </el-menu-item>
        </a>
      </template>
    </el-submenu>

  </div>
</template>

<script>
import path from 'path'
import { generateTitle } from '@/utils/i18n'
import { validateURL } from '@/utils/validate'
import Item from './Item'

export default {
  name: 'InnerSidebarItem',
  components: { Item },
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      onlyOneChild: null
    }
  },
  methods: {
    hasOneShowingChild(children) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // temp set(will be used if only has one showing child )
          this.onlyOneChild = item
          return true
        }
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    },
    resolvePath(routePath) {
      var tmpPath = path.resolve(this.basePath, routePath)
      for (var k in this.$route.params) {
        var find = ':' + k
        tmpPath = tmpPath.replace(new RegExp(find, 'g'), this.$route.params[k])
      }
      return tmpPath
    },
    isExternalLink(routePath) {
      return validateURL(routePath)
    },
    clickLink(routePath, e) {
      if (!this.isExternalLink(routePath)) {
        e.preventDefault()
        var path = this.resolvePath(routePath)
        console.error(path)
        console.error(this.$router)
        console.error(this)
        console.error(this.$route.params)
        // var pathTmp = path
        /*
        for(var k in this.$route.params) {
          var find = ':' + k
          var re = new RegExp(find, this.$route.params[k])
          path = path.replace(re, '')
        }
        */
        console.error('new path : ' + path)
        this.$router.push(path)
      }
    },
    generateTitle
  }
}
// # .custom-nest-menu .el-submenu-item:hover > #app .sidebar-container .nest-menu .elsubmenu > .el-submenu__title:hover, #app .sidebar-container .elsubmenu .el-submenu-item:hover {
</script>

<style>
.custom-menu-wrapper .el-menu-item:hover, .custom-menu-wrapper .el-submenu .el-menu-item:hover, .custom-menu-wrapper .el-submenu .el-menu-item:hover, .custom-menu-wrapper .el-submenu.is-active .el-submenu__title:hover {
    background-color: white!important;
    font-weight: bold;
}
.custom-menu-wrapper .el-submenu__title:hover {
  background-color: white!important;
  font-weight: bold;
}
.custom-nest-menu .el-submenu__title:hover {
  background-color: white!important;
  font-weight: bold;
}
.custom-nest-menu .el-menu-item > #app .sidebar-container .nest-menu .el-submenu > .el-submenu__title, #app .sidebar-container .el-submenu .el-menu-item {
  background-color: white!important;
}
</style>
