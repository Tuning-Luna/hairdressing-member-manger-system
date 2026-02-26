<script setup lang="ts">
import { reactive, ref, computed } from "vue"
import { ElMessage } from "element-plus"

import { addMember } from "../db/useDatabase"
import {
  MEMBER_TYPE,
  CreateMemberDTO,
} from "../types/member"

const formRef = ref()

// ======================
// 表单数据
// ======================
const form = reactive<CreateMemberDTO>({
  name: "",
  phone: "",
  type: MEMBER_TYPE.SAVING,
  balance: 0,
})

// 表单校验
const rules = {
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1\d{10}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  type: [{ required: true, message: "请选择会员类型", trigger: "change" }],
}

// 充值套餐
const rechargeOptions = [100, 200, 500, 1000]

function selectRecharge(amount: number) {
  form.balance = amount
}

// 判断当前是否选中
const selectedRecharge = computed(() =>
  rechargeOptions.includes(Number(form.balance))
    ? Number(form.balance)
    : null
)

// 提交
async function handleSubmit() {
  await formRef.value.validate()

  try {
    if (form.type === MEMBER_TYPE.VIP) {
      form.balance = 0
    }

    await addMember({
      ...form,
      balance:
        form.type === MEMBER_TYPE.SAVING
          ? Number(form.balance)
          : 0,
    })

    ElMessage.success("添加成功")

    // 重置表单
    form.name = ""
    form.phone = ""
    form.type = MEMBER_TYPE.SAVING
    form.balance = 0
  } catch (err: any) {
    ElMessage.error(err?.message || "添加失败，请检查手机号是否重复")
  }
}

function normalizeBalance(val: number | undefined) {
  if (val === undefined || val === null) {
    form.balance = 0
    return
  }

  const fixed = Math.floor(Number(val) / 100) * 100
  form.balance = fixed < 0 ? 0 : fixed
}
</script>

<template>
  <div class="page-wrapper">
    <el-card class="form-card" shadow="hover">
      <template #header>
        <span class="title">新增会员</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <!-- 姓名 -->
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <!-- 会员类型 -->
        <el-form-item label="会员类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option :value="MEMBER_TYPE.SAVING" label="储值卡" />
            <el-option :value="MEMBER_TYPE.VIP" label="会员卡" />
          </el-select>
        </el-form-item>

        <!-- 储值卡余额 -->
        <el-form-item v-if="form.type === MEMBER_TYPE.SAVING" label="充值金额">
          <div class="balance-wrapper">
            <!-- 套餐按钮 -->
            <div class="recharge-buttons">
              <div v-for="item in rechargeOptions" :key="item" class="recharge-item"
                :class="{ active: selectedRecharge === item }" @click="selectRecharge(item)">
                ￥{{ item }}
              </div>
            </div>

            <!-- 自定义输入 -->
            <el-input-number v-model="form.balance" :min="0" :step="100" controls-position="right"
              @change="normalizeBalance"
              style="width: 100%; margin-top: 15px" />
          </div>
        </el-form-item>

        <!-- 提交 -->
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleSubmit">
            添加会员
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
/* 页面居中 */
.page-wrapper {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 卡片宽度 */
.form-card {
  width: 460px;
}

/* 标题 */
.title {
  font-size: 16px;
  font-weight: 600;
}

/* 余额区域 */
.balance-wrapper {
  width: 100%;
}

/* 套餐按钮布局 */
.recharge-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 单个套餐 */
.recharge-item {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

/* hover */
.recharge-item:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 选中状态 */
.recharge-item.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}
</style>