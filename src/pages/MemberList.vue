<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ElMessageBox, ElMessage } from "element-plus"

import {
  getMembersWithPagination,
  getMemberCount,
  searchMembersByPhone,
  searchMemberCount,
  deleteMember,
  deleteAllMembers,
  initDb,
} from "../db/useDatabase"

import { importMembersCSV, exportMembersAsCSV } from "../utils/csv"


import { Member, MEMBER_TYPE } from "../types/member"

const tableData = ref<Member[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = 10

const searchKeyword = ref("")
const multipleSelection = ref<Member[]>([])

// 加载数据
async function loadData() {
  const keyword = searchKeyword.value.trim()

  if (keyword) {
    tableData.value = await searchMembersByPhone(
      keyword,
      currentPage.value,
      pageSize
    )
    total.value = await searchMemberCount(keyword)
  } else {
    tableData.value = await getMembersWithPagination(
      currentPage.value,
      pageSize
    )
    total.value = await getMemberCount()
  }
}

// 搜索
async function handleSearch() {
  currentPage.value = 1
  await loadData()
}

// 复选框选择
function handleSelectionChange(val: Member[]) {
  multipleSelection.value = val
}

// 删除单个
async function handleDelete(id: number) {
  await ElMessageBox.confirm("确认删除该会员？", "提示", {
    type: "warning",
  })

  await deleteMember(id)
  ElMessage.success("删除成功")
  loadData()
}

// 批量删除
async function handleBatchDelete() {
  await ElMessageBox.confirm("确认批量删除选中会员？", "提示", {
    type: "warning",
  })

  for (const item of multipleSelection.value) {
    await deleteMember(item.id)
  }

  ElMessage.success("批量删除成功")
  loadData()
}

// 全部删除
async function handleDeleteAll() {
  await ElMessageBox.confirm("确认删除所有会员？", "严重警告", {
    type: "error",
  })

  await deleteAllMembers()
  ElMessage.success("全部删除成功")
  loadData()
}

async function handleReset() {
  searchKeyword.value = ""
  currentPage.value = 1
  await loadData()
}

// 导入
async function handleImport() {
  const result = await importMembersCSV()

  ElMessage.success(
    `导入完成：成功 ${result.success} 条，失败 ${result.failed} 条，重复 ${result.duplicated} 条`
  )

  loadData()
}

// 导出
async function handleExport() {
  const ok = await exportMembersAsCSV()
  if (ok) ElMessage.success("导出成功")
}

onMounted(async () => {
  await initDb()
  await loadData()
})
</script>


<template>
  <div class="member-container">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchKeyword"
        placeholder="输入手机号搜索"
        clearable
        style="width: 220px"
        @clear="handleSearch">
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
        <el-button @click="handleReset">重置</el-button>
      </el-input>

      <div class="right-buttons">
        <el-button type="success" @click="handleImport">导入CSV</el-button>
        <el-button type="primary" @click="handleExport">导出CSV</el-button>
        <el-button type="danger" :disabled="!multipleSelection.length" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button type="danger" @click="handleDeleteAll">
          全部删除
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />

      <el-table-column prop="id" label="ID" width="80" />

      <el-table-column prop="name" label="姓名" />

      <el-table-column prop="phone" label="手机号" />

      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag :type="row.type === MEMBER_TYPE.SAVING ? 'warning' : 'success'">
            {{ row.type === MEMBER_TYPE.SAVING ? "储值卡" : "会员卡" }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="balance" label="余额" />

      <el-table-column prop="created_at" label="创建时间" />

      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination background layout="prev, pager, next, total" :total="total" :page-size="pageSize"
        v-model:current-page="currentPage" @current-change="loadData" />
    </div>
  </div>
</template>



<style scoped>
.member-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.right-buttons>* {
  margin-left: 10px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>