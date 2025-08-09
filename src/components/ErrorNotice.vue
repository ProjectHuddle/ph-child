<template>
  <Transition name="error-slide" appear>
    <div
      v-if="message"
      class="error-notice flex items-start gap-3 p-3 bg-red-50/80 border border-red-200/60 rounded-lg"
      role="alert"
    >
      <div class="flex-shrink-0">
        <i class="pi pi-exclamation-triangle text-red-500"></i>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-red-800">{{ message }}</p>
      </div>
      <div v-if="dismissible" class="flex-shrink-0">
        <button
          type="button"
          class="inline-flex rounded-md bg-red-50/50 p-1 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-1 transition-colors"
          @click="$emit('dismiss')"
        >
          <span class="sr-only">Dismiss</span>
          <i class="pi pi-times text-xs"></i>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

interface Props {
  message?: string
  dismissible?: boolean
}

defineProps<Props>()
defineEmits<{
  dismiss: []
}>()
</script>

<style scoped>
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease;
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.error-notice {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Shake animation for errors */
.error-notice {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
</style>