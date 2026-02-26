<script setup lang="ts">
import { useRouter, useRoute } from "vue-router"
import { computed } from "vue"

const router = useRouter()
const route = useRoute()

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
  <el-container style="height: 100vh">
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
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <el-header style="text-align: center; font-size: 38px">
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