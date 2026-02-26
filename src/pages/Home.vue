<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ElMessage } from "element-plus"

const currentTime = ref("")
const loading = ref(false)

import { MEMBER_TYPE } from "../types/member"
import {
  getMemberCount,
  getMemberTypeCount,
  getTotalBalance,
  getTodayNewMembers,
  initDb,
} from "../db/useDatabase"

const totalMembers = ref(0)
const savingCount = ref(0)
const normalCount = ref(0)
const totalBalance = ref(0)
const todayNew = ref(0)

async function loadStats() {
  loading.value = true
  try {
    totalMembers.value = await getMemberCount()
    savingCount.value = await getMemberTypeCount(MEMBER_TYPE.SAVING)
    normalCount.value = await getMemberTypeCount(MEMBER_TYPE.VIP)
    totalBalance.value = await getTotalBalance()
    todayNew.value = await getTodayNewMembers()
  } catch (e) {
    ElMessage.error("加载统计数据失败")
  } finally {
    loading.value = false
  }
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString()
}

onMounted(async () => {
  updateTime()
  await initDb()
  await loadStats()
  setInterval(updateTime, 1000)
})
</script>

<template>
  <div class="home-container">
    <div class="header">
      <h1>会员管理系统</h1>
      <p class="time">当前时间：{{ currentTime }}</p>
    </div>

    <div class="welcome">
      <el-alert
        title="欢迎使用桌面会员管理系统"
        type="success"
        show-icon />
    </div>

    <div class="cards">

      <el-card shadow="hover" class="stat-card">
        <div class="stat-title">会员总数</div>
        <div class="stat-value">{{ totalMembers }}</div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-title">储值卡会员</div>
        <div class="stat-value warning">{{ savingCount }}</div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-title">普通会员</div>
        <div class="stat-value primary">{{ normalCount }}</div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-title">会员总余额</div>
        <div class="stat-value success">¥ {{ totalBalance.toFixed(2) }}</div>
      </el-card>

      <el-card shadow="hover" class="stat-card">
        <div class="stat-title">今日新增</div>
        <div class="stat-value danger">{{ todayNew }}</div>
      </el-card>

    </div>


  </div>
</template>

<style scoped>
.home-container {
  padding: 30px;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
}

.time {
  color: #888;
  margin-top: 8px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.primary {
  color: #409eff;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.danger {
  color: #f56c6c;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 20px;
}

.stat-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

.success {
  color: #67c23a;
}

.welcome {
  margin-top: 20px;
  margin-bottom: 30px;
}
</style>