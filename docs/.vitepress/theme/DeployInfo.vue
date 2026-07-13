<template>
  <div class="deploy-info">
    <span class="deploy-text">本网站由 Netlify 部署并提供全球 CDN 边缘网络加速</span>
    <a href="https://www.netlify.com/" target="_blank" rel="noopener" class="deploy-badge">
      <svg class="deploy-badge-icon" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0L0 15l15 15 15-15L15 0zm0 4.4L25.6 15 15 25.6 4.4 15 15 4.4z" fill="#00C7B7"/>
      </svg>
      <span>Netlify</span>
    </a>
  </div>
</template>

<style scoped>
.deploy-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
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
