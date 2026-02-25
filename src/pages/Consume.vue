<script setup lang="ts">
import { ref } from "vue"
import { searchMembersByPhone } from "../db/useDatabase"
import { ElMessage } from "element-plus"

const keyword = ref("")
const members = ref<any[]>([])
const loading = ref(false)

async function handleSearch() {
  if (!keyword.value.trim()) {
    ElMessage.warning("请输入手机号")
    return
  }

  loading.value = true

  const result = await searchMembersByPhone(keyword.value.trim())
  members.value = result

  loading.value = false

  if (!members.value.length) {
    ElMessage.warning("未找到会员")
  }
}

function handleReset() {
  keyword.value = ""
  members.value = []
}
</script>

<template>
  <div class="container">
    <el-card shadow="hover">
      <template #header>
        <span>划卡消费</span>
      </template>

      <!-- 查询区域 -->
      <div class="search-box">
        <el-input v-model="keyword" placeholder="请输入手机号" clearable @keyup.enter="handleSearch" style="width: 300px" />

        <el-button type="primary" @click="handleSearch">
          查询
        </el-button>

        <el-button @click="handleReset">
          清空
        </el-button>
      </div>

      <!-- 会员卡片区域 -->
      <div v-loading="loading" class="card-container">
        <template v-if="members.length">
          <el-card
            v-for="item in members"
            :key="item.id"
            class="member-card"
            shadow="hover">
            <div class="member-info">
              <div class="name">{{ item.name }}</div>
              <div class="phone">{{ item.phone }}</div>
              <el-tag type="success" size="large">
                {{ item.level || "普通会员" }}
              </el-tag>
            </div>
          </el-card>
        </template>

        <el-empty v-else description="请输入手机号查询会员" style="margin-top: 40px" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  padding: 40px;
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 两列布局 */
.card-container {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* 单个卡片 */
.member-card {
  padding: 25px;
  text-align: center;
  transition: all 0.2s ease;
}

.member-card:hover {
  transform: translateY(-3px);
}

.member-info .name {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 8px;
}

.member-info .phone {
  font-size: 16px;
  margin-bottom: 10px;
  color: #666;
}
</style>