<script setup>
import { ref } from 'vue'
import { withBase } from 'vitepress'

const showWeChat = ref(false)
</script>

<template>
  <div class="donation-section">
    <div class="donation-header">
      <span class="donation-icon">❤️</span>
      <span class="donation-title">如果这篇文章对你有帮助，欢迎赞赏支持</span>
    </div>
    <div class="donation-buttons">
      <button class="donation-btn wechat-btn" @click="showWeChat = !showWeChat">
        <span class="btn-icon">💬</span>
        <span class="btn-text">微信赞赏</span>
      </button>
    </div>
    <div class="donation-qrcode" v-if="showWeChat">
      <div class="qrcode-container">
        <img :src="withBase('/wechat-qr.png')" alt="微信赞赏码" class="qrcode-img">
      </div>
      <p class="qrcode-hint">请使用微信扫描上方二维码</p>
    </div>

    <!-- 特别感谢 -->
    <div class="thanks-section">
      <div class="thanks-title">特别感谢</div>
      <div class="thanks-list">
        <a href="https://www.jetbrains.com/" target="_blank" rel="noopener" class="thanks-item">
          <img src="https://resources.jetbrains.com/storage/products/company/brand/logos/jetbrains.svg" alt="JetBrains" class="thanks-logo" loading="lazy">
        </a>
        <a href="https://www.netlify.com/" target="_blank" rel="noopener" class="thanks-item">
          <svg class="thanks-logo netlify-logo" viewBox="0 0 120 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.6 13.2c0-3.6-2.9-6.5-6.5-6.5s-6.5 2.9-6.5 6.5 2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5zm-3.2 0c0-1.8 1.4-3.2 3.2-3.2s3.2 1.4 3.2 3.2-1.4 3.2-3.2 3.2-3.2-1.4-3.2-3.2z" fill="currentColor"/>
            <path d="M38 6.7h3v16.5h-3V6.7z" fill="currentColor"/>
            <path d="M49.5 6.7c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5c1.5 0 2.9-.5 4-1.3v1.1c0 2.5-2 4.5-4.5 4.5h-2v3h2c4.1 0 7.5-3.4 7.5-7.5v-.6c0-3.6-2.9-6.5-6.5-6.5zm-3.3 6.5c0-1.8 1.5-3.2 3.3-3.2s3.2 1.4 3.2 3.2-1.4 3.2-3.2 3.2-3.3-1.4-3.3-3.2z" fill="currentColor"/>
            <path d="M63 6.7c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5-2.9-6.5-6.5-6.5zm-3.2 6.5c0-1.8 1.4-3.2 3.2-3.2s3.2 1.4 3.2 3.2-1.4 3.2-3.2 3.2-3.2-1.4-3.2-3.2z" fill="currentColor"/>
            <path d="M77.4 10.2c-.6-2.3-2.7-3.8-5-3.2-.4.1-.8.3-1.1.5l-.3.2c-1.2.9-1.9 2.3-1.9 3.8v8.8h3v-8.8c0-.8.6-1.5 1.4-1.5s1.5.7 1.5 1.5v8.8h3v-8.8c0-.8.7-1.5 1.5-1.5s1.4.7 1.4 1.5v8.8h3V13c0-1.2-.4-2.3-1.2-3.2l-.3-.6z" fill="currentColor"/>
            <path d="M95.4 13.2c0-3.6-2.9-6.5-6.5-6.5s-6.5 2.9-6.5 6.5 2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5zm-3.2 0c0-1.8 1.4-3.2 3.2-3.2s3.2 1.4 3.2 3.2-1.4 3.2-3.2 3.2-3.2-1.4-3.2-3.2z" fill="currentColor"/>
            <path d="M108.5 6.7c-3.6 0-6.5 2.9-6.5 6.5v10h3V13.2c0-1.8 1.4-3.2 3.2-3.2h3.3v-3.3h-3z" fill="currentColor"/>
          </svg>
        </a>
      </div>
      <div class="thanks-desc">本项目已加入 JetBrains &amp; Netlify 开源项目计划</div>
    </div>

    <!-- 部署信息 -->
    <div class="deploy-info">
      <span class="deploy-text">本网站由 Netlify 部署并提供全球 CDN 边缘网络加速</span>
      <a href="https://www.netlify.com/" target="_blank" rel="noopener" class="deploy-badge">
        <svg class="deploy-badge-icon" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 0L0 15l15 15 15-15L15 0zm0 4.4L25.6 15 15 25.6 4.4 15 15 4.4z" fill="#00C7B7"/>
        </svg>
        <span>Netlify</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.donation-section {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

.donation-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.donation-icon {
  font-size: 20px;
}

.donation-title {
  font-size: 16px;
  color: var(--vp-c-text-2);
}

.donation-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.donation-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.wechat-btn {
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  color: white;
}

.wechat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
}

.donation-qrcode {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.qrcode-container {
  display: inline-block;
  padding: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.qrcode-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  display: block;
}

.qrcode-hint {
  margin-top: 12px;
  font-size: 14px;
  color: var(--vp-c-text-3);
}

/* 特别感谢 */
.thanks-section {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.thanks-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
}

.thanks-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-bottom: 12px;
}

.thanks-item {
  display: flex;
  align-items: center;
  transition: opacity 0.2s ease;
}

.thanks-item:hover {
  opacity: 0.8;
}

.thanks-logo {
  height: 28px;
  width: auto;
  color: var(--vp-c-text-2);
}

.netlify-logo {
  height: 22px;
  color: #00C7B7;
}

.thanks-desc {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* 部署信息 */
.deploy-info {
  margin-top: 32px;
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.deploy-text {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.deploy-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #00C7B7;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.deploy-badge:hover {
  opacity: 0.8;
}

.deploy-badge-icon {
  width: 16px;
  height: 16px;
}
</style>
