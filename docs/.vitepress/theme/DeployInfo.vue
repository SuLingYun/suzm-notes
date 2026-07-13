<template>
  <div class="deploy-info">
    <span class="deploy-text">本站由</span>
    <a href="https://www.netlify.com/" target="_blank" rel="noopener" class="deploy-badge">
      <svg class="deploy-badge-icon" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0L0 15l15 15 15-15L15 0zm0 4.4L25.6 15 15 25.6 4.4 15 15 4.4z" fill="#00C7B7"/>
      </svg>
      <span>Netlify</span>
    </a>
    <span class="deploy-text">部署</span>
  </div>
</template>

<style scoped>
.deploy-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 0;
  font-size: 14px;
}

.deploy-text {
  color: var(--vp-c-text-3);
}

.deploy-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #00C7B7;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s ease;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0, 199, 183, 0.1);
}

.deploy-badge:hover {
  opacity: 0.8;
}

.deploy-badge-icon {
  width: 18px;
  height: 18px;
}
</style>