<template>
  <div class="dashboard-editor-container">
    <pan-thumb :image="avatar" style="float: left"> Your roles:<br>
      <span v-for="item in roles" :key="item" class="pan-info-roles"><br>{{ item }}</span>
    </pan-thumb>
    <div class="info-container">
      <span class="display_name">{{ name }}</span>
      <span style="font-size:20px;padding-top:20px;display:inline-block;">Administrator's default Dashboard</span>
    </div>

    <el-row :gutter="32" style="margin-top:200px">
      <el-col :xs="24" :sm="24" :lg="8">
        <div v-if="language == 'en'">
          Welcome to your Serverless administration panel.
        </div>
        <div v-if="language == 'fr'">
          Bienvenue dans votre service d'administration serverless.
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8"/>
      <el-col :xs="24" :sm="24" :lg="8"/>
    </el-row>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PanThumb from '@/components/PanThumb'

export default {
  name: 'DashboardAdmin',
  components: {
    PanThumb
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'language',
      'roles'
    ])
  },
  methods: {
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  // background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
</style>
