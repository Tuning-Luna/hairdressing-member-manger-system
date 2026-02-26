<script setup lang="ts">
import { ref } from "vue"
import { invoke } from "@tauri-apps/api/core"
import { ElMessage } from "element-plus"

const greetMsg = ref("")
const name = ref("")
const loading = ref(false)

async function greet() {
  if (!name.value.trim()) {
    ElMessage.warning("请输入名字")
    return
  }

  loading.value = true
  try {
    greetMsg.value = await invoke("greet", { name: name.value })
  } catch (err) {
    ElMessage.error("调用失败")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <el-card class="card" shadow="hover">
      <template #header>
        <span>Tauri + Vue 示例</span>
      </template>

      <div class="content">
        <h2 class="title">Welcome 👋</h2>

        <el-input v-model="name" placeholder="请输入你的名字" clearable @keyup.enter="greet" size="large" />

        <el-button type="primary" size="large" :loading="loading" @click="greet">
          打招呼
        </el-button>

        <el-alert v-if="greetMsg" :title="greetMsg" type="success" show-icon style="margin-top: 20px" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.card {
  width: 400px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.title {
  text-align: center;
  margin: 0;
}
</style>