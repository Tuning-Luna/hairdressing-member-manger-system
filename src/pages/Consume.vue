<script setup lang="ts">
import { onMounted, ref, computed } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"

import { MEMBER_TYPE, type Member } from "../types/member"
import { db, consume, initDb } from "../db/useDatabase"

const keyword = ref("")
const member = ref<Member | null>(null)

const price = computed(() => {
  if (!member.value) return 0
  return member.value.type === MEMBER_TYPE.SAVING ? 30 : 20
})

async function handleSearch() {
  if (!db) {
    ElMessage.error("数据库未初始化")
    return
  }

  if (!keyword.value.trim()) {
    ElMessage.warning("请输入手机号")
    return
  }

  const result = await db.select<Member[]>(
    "SELECT * FROM members WHERE phone = ? LIMIT 1",
    [keyword.value.trim()]
  )

  if (result.length === 0) {
    member.value = null
    ElMessage.error("未找到该会员")
    return
  }

  member.value = result[0]
}

async function handleConsume() {
  if (!member.value) return

  try {
    await ElMessageBox.confirm(
      `确认扣除 ${price.value} 元？`,
      "确认消费",
      { type: "warning" }
    )

    await consume(member.value.id)

    ElMessage.success(`扣除 ${price.value} 元成功`)

    await handleSearch() // 刷新余额
  } catch (err: any) {
    if (err !== "cancel") {
      ElMessage.error(err.message || "消费失败")
    }
  }
}

onMounted(async () => {
  await initDb()
})
</script>

<template>
  <div class="consume-wrapper">
    <el-card class="consume-card" shadow="always">
      <template #header>
        <div class="header-title">会员消费</div>
      </template>

      <div class="search-box">
        <el-input v-model="keyword" placeholder="请输入手机号" clearable style="width: 300px" @keyup.enter="handleSearch" />

        <el-button type="primary" @click="handleSearch">
          查询
        </el-button>
      </div>

      <div v-if="member" class="member-card">
        <el-card shadow="hover">
          <h2>{{ member.name }}</h2>
          <p>手机号：{{ member.phone }}</p>

          <p>
            类型：
            <el-tag v-if="member.type === MEMBER_TYPE.SAVING">
              储值卡（30/次）
            </el-tag>
            <el-tag type="success" v-else>
              会员卡（20/次）
            </el-tag>
          </p>

          <!-- 两种都显示余额 -->
          <p>
            当前余额：
            <strong style="color: #f56c6c">
              ￥{{ member.balance.toFixed(2) }}
            </strong>
          </p>

          <el-button type="danger" size="large" @click="handleConsume">
            消费一次（{{ price }}元）
          </el-button>
        </el-card>
      </div>

      <el-empty v-else description="请输入手机号查询会员" />
    </el-card>
  </div>
</template>



<style scoped>
.consume-wrapper {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.consume-card {
  width: 500px;
  border-radius: 12px;
}

.header-title {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
}

.search-box {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.member-card {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.member-card .el-card {
  width: 100%;
  text-align: center;
  border-radius: 12px;
}
</style>