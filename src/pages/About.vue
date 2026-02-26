<script setup lang="ts">
const githubUrl =
  "https://github.com/Tuning-Luna/hairdressing-member-manger-system"

function openGithub() {
  window.open(githubUrl)
}
</script>

<template>
  <div class="about-page">
    <el-card class="about-card" shadow="hover">
      <!-- 标题 -->
      <div class="header">
        <h1>💈 Hairdressing Member Manager System</h1>
        <p class="subtitle">理发店会员管理系统（Tauri 桌面版）</p>
      </div>

      <el-divider />

      <!-- 项目介绍 -->
      <section>
        <h2>📌 项目简介</h2>
        <p>
          本项目是一个基于 Tauri + Vue3 + TypeScript + SQLite
          开发的理发店会员管理系统，
          支持会员管理、储值卡消费、充值记录、数据导入导出等功能。
        </p>
      </section>

      <!-- 功能说明 -->
      <section>
        <h2>🚀 核心功能</h2>
        <ul>
          <li>✔ 会员新增 / 删除 / 编辑</li>
          <li>✔ 储值卡与会员卡管理</li>
          <li>✔ 自动扣费与余额计算</li>
          <li>✔ CSV 数据导入导出</li>
          <li>✔ 本地 SQLite 数据存储</li>
        </ul>
      </section>

      <!-- 技术栈 -->
      <section>
        <h2>🛠 技术栈</h2>
        <div class="tech-stack">
          <el-tag>Vue 3</el-tag>
          <el-tag type="success">TypeScript</el-tag>
          <el-tag type="warning">Element Plus</el-tag>
          <el-tag type="info">Tauri</el-tag>
          <el-tag type="danger">SQLite</el-tag>
        </div>
      </section>

      <el-divider />

      <!-- GitHub -->
      <div class="github-section">
        <el-button type="primary" @click="openGithub">
          ⭐ 查看 GitHub 项目
        </el-button>
      </div>

      <!-- 作者 -->
      <div class="footer">
        <p>© 2026 Tuning Luna</p>
        <p>Open Source Project</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.about-page {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
}

.about-card {
  width: 100%;
  max-width: 900px;
}

.header {
  text-align: center;
}

.subtitle {
  color: #888;
  margin-top: 5px;
}

section {
  margin-bottom: 25px;
}

section h2 {
  margin-bottom: 10px;
  font-size: 18px;
}

ul {
  padding-left: 18px;
  line-height: 1.8;
}

.tech-stack {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.github-section {
  text-align: center;
  margin-top: 20px;
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #999;
  font-size: 13px;
}
</style>