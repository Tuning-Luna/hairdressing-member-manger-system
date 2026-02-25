<script setup lang="ts">
import { ref, onMounted } from "vue"
import {
  initDb,
  getMembersWithPagination,
  getMemberCount,
  addMember,
  deleteMember,
  exportMembersASCSV,
  importMembersCSV,
  deleteAllMembers,
} from "../db/useDatabase"

import { ElMessage, ElMessageBox } from "element-plus"

const members = ref<any[]>([])
const total = ref(0)

const currentPage = ref(1)
const pageSize = ref(10)

const newName = ref("")
const newPhone = ref("")
const newLevel = ref("")

// 加载分页数据
async function load() {
  members.value = await getMembersWithPagination(
    currentPage.value,
    pageSize.value
  )
  total.value = await getMemberCount()
}

// 切换页码
async function handlePageChange(page: number) {
  currentPage.value = page
  await load()
}

// 切换每页条数
async function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  await load()
}

// 添加
async function addNew() {
  if (!newName.value || !newPhone.value) {
    ElMessage.warning("姓名和电话不能为空")
    return
  }

  // 去掉首尾空格
  newName.value = newName.value.trim()
  newPhone.value = newPhone.value.trim()

  await addMember(newName.value, newPhone.value, newLevel.value)

  newName.value = ""
  newPhone.value = ""
  newLevel.value = ""

  ElMessage.success("添加成功")

  currentPage.value = 1
  await load()
}

// 删除
async function deleteOne(id: number) {
  try {
    await ElMessageBox.confirm("确定删除该会员吗？", "提示", {
      type: "warning",
    })

    await deleteMember(id)
    ElMessage.success("删除成功")

    await load()
  } catch { }
}

// 删除全部
async function deleteAll() {
  try {
    await ElMessageBox.confirm("确定删除所有会员吗？", "危险操作", {
      type: "error",
    })

    await deleteAllMembers()
    ElMessage.success("全部删除成功")

    currentPage.value = 1
    await load()
  } catch { }
}

// 导出
async function exportCSV() {
  const res = await exportMembersASCSV()
  res ? ElMessage.success("导出成功") : ElMessage.error("导出失败")
}

// 导入
async function importJson() {
  const res = await importMembersCSV()
  if (res) {
    ElMessage.success(
      `导入成功${res.success}条，失败${res.failed}条，重复${res.duplicated}条`
    )
    await load()
  } else {
    ElMessage.error("导入失败")
  }
}

onMounted(async () => {
  await initDb()
  await load()
})
</script>

<template>
  <div class="container">
    <el-card shadow="hover">
      <template #header>

        <!-- 操作 -->
        <div class="card-header">
          <el-button type="danger" @click="deleteAll">
            全部删除
          </el-button>
          <el-button type="success" @click="exportCSV">
            导出 CSV
          </el-button>
          <el-button type="primary" @click="importJson">
            导入 CSV
          </el-button>
        </div>

      </template>

      <!-- 添加表单 -->
      <el-form inline class="form">
        <el-form-item>
          <el-input v-model="newName" placeholder="姓名" clearable />
        </el-form-item>

        <el-form-item>
          <el-input v-model="newPhone" placeholder="电话" clearable />
        </el-form-item>

        <el-form-item>
          <el-input v-model="newLevel" placeholder="等级" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="addNew">
            添加会员
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table :data="members" stripe border style="width: 100%; margin-top: 20px">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="level" label="等级" />

        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              @click="deleteOne(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 🔥 分页 -->
      <div style="margin-top: 20px; text-align: right">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total"
          layout="total, sizes, prev, pager, next, jumper" :page-sizes="[5, 10, 20, 50]"
          @current-change="handlePageChange"
          @size-change="handleSizeChange" />
      </div>


    </el-card>
  </div>
</template>

<style scoped>
.container {
  padding: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
</style>