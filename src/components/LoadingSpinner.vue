<template>
  <div class="loading-container flex flex-col items-center justify-center gap-3 p-6">
    <div class="relative">
      <div class="loading-spinner"></div>
      <div class="loading-pulse"></div>
    </div>
    <div v-if="message" class="text-center">
      <p class="text-sm text-gray-600 font-medium">{{ message }}</p>
      <div class="loading-dots mt-2">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

defineProps<Props>()
</script>

<style scoped>
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-pulse {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.loading-dots {
  display: flex;
  gap: 3px;
  justify-content: center;
  align-items: center;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}
</style>