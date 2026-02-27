<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { computed } from "vue"
import { useTheme } from "./utils/useTheme"

const router = useRouter()
const route = useRoute()

// 主题（三态）
const { mode } = useTheme()

// 当前选中的菜单
const activeMenu = computed(() => route.path)

// 菜单数据
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

// 点击菜单跳转
const handleSelect = (index: string) => {
  router.push(index)
}
</script>

<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        @select="handleSelect">
        <el-menu-item
          v-for="item in menus"
          :key="item.path"
          :index="item.path">
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header class="app-header">
        <div class="header-title">
          Tauri + Vue3 后台系统
        </div>

        <!-- 三态主题切换 -->
        <el-radio-group v-model="mode" size="small">
          <el-tooltip content="白天模式" placement="bottom">
            <el-radio-button label="light">☀️</el-radio-button>
          </el-tooltip>

          <el-tooltip content="黑夜模式" placement="bottom">
            <el-radio-button label="dark">🌙</el-radio-button>
          </el-tooltip>

          <el-tooltip content="跟随系统" placement="bottom">
            <el-radio-button label="system">🖥</el-radio-button>
          </el-tooltip>
        </el-radio-group>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
.layout {
  height: 100vh;
}

/* 侧边栏 */
.el-menu-vertical {
  height: 100%;
  border-right: none;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 22px;
  border-bottom: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.header-title {
  font-weight: bold;
  color: var(--el-text-color-primary);
}

/* 主内容区 */
.main {
  background-color: var(--el-bg-color-page);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 全局平滑过渡 */
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>