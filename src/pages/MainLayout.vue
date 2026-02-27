<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { computed } from "vue"
import { useTheme } from "../utils/useTheme"

const router = useRouter()
const route = useRoute()

const { mode } = useTheme()

const activeMenu = computed(() => route.path)

interface MenuItem {
  label: string
  path: string
}

const menus: MenuItem[] = [
  { label: "首页", path: "/" },
  { label: "划卡消费", path: "/consume" },
  { label: "添加会员", path: "/add-member" },
  { label: "会员列表", path: "/member-list" },
  { label: "关于", path: "/about" },
]

const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside width="200px">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        @select="handleSelect">
        <el-menu-item
          v-for="item in menus"
          :key="item.path"
          :index="item.path">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主区域 -->
    <el-container>
      <el-header class="app-header">
        <div class="header-title">
          Tauri + Vue3 后台系统
        </div>

        <el-radio-group v-model="mode" size="small">
          <el-radio-button label="light">☀️</el-radio-button>
          <el-radio-button label="dark">🌙</el-radio-button>
          <el-radio-button label="system">🖥</el-radio-button>
        </el-radio-group>
      </el-header>

      <el-main class="main">
        <!-- 子路由出口 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
.layout {
  height: 100vh;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
}

.header-title {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.main {
  background-color: var(--el-bg-color-page);
}
</style>