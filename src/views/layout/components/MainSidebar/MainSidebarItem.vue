<template>
  <div v-if="((!item.innerMenu && !item.hidden&&item.children) || !item.hidden&&item.iscomponent)" class="menu-wrapper">

    <template v-if="item.iscomponent === true">
      <a href="javascript:void(0)" style="cursor: default;">
        <keep-alive>
          <component :is="item.component"/>
        </keep-alive>
      </a>
    </template>
    <template v-if="item.flatChildrens || hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow">
      <a :href="onlyOneChild.path" target="_blank" @click="clickLink(onlyOneChild.path,$event)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
          <item v-if="onlyOneChild.meta" :icon="onlyOneChild.meta.icon" :title="generateTitle(onlyOneChild.meta.title)" />
        </el-menu-item>
      </a>
    </template>
    <el-submenu v-if="!(item.iscomponent === true) && !(item.flatChildrens || hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow)" :index="item.name||item.path">
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta.icon" :title="generateTitle(item.meta.title)" />
      </template>

      <template v-for="child in item.children" v-if="!child.hidden && !child.innerMenu">
        <sidebar-item v-if="child.children&&child.children.length>0" :is-nest="true" :item="child" :key="child.path" :base-path="resolvePath(child.path)" class="nest-menu"/>

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
import { mapGetters } from 'vuex'

export default {
  name: 'SidebarItem',
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
  computed: {
    ...mapGetters([
      'isLoading'
    ])
  },
  methods: {
    hasOneShowingChild(children) {
      const showingChildren = children.filter(item => {
        if (item.innerMenu) {
          return false
        }
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
      return path.resolve(this.basePath, routePath)
    },
    isExternalLink(routePath) {
      return validateURL(routePath)
    },
    clickLink(routePath, e) {
      if (!this.isExternalLink(routePath)) {
        e.preventDefault()
        const path = this.resolvePath(routePath)
        this.$router.push(path)
      }
    },
    generateTitle
  }
}
</script>
