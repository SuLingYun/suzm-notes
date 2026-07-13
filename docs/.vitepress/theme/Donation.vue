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
</style>
