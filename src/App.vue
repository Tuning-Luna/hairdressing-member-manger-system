<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { computed } from "vue"

const router = useRouter()
const route = useRoute()

// 当前选中的菜单
const activeMenu = computed(() => route.path)

// 点击菜单跳转
const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<template>
  <el-container style="height: 100vh">
    <!-- 侧边栏 -->
    <el-aside width="200px">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        @select="handleSelect">
        <el-menu-item index="/">
          <span>首页</span>
        </el-menu-item>

        <el-menu-item index="/about">
          <span>关于</span>
        </el-menu-item>

        <el-menu-item index="/member-list">
          <span>会员列表</span>
        </el-menu-item>

        <el-menu-item index="/consume">
          <span>划卡消费</span>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header style="text-align: center;  font-size: 38px">
        Tauri + Vue3 后台系统
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.el-menu-vertical {
  height: 100%;
}
</style>