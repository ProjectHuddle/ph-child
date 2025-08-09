<template>
  <div class="tab-navigation bg-white border-b border-gray-200/60">
    <nav class="flex" role="tablist">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        :class="[
          'relative px-4 py-2.5 text-sm font-medium transition-all duration-200 border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset',
          activeTab === tab.id
            ? 'text-blue-600 border-blue-500 bg-blue-50/40'
            : 'text-gray-600 border-transparent hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50/60'
        ]"
        :aria-selected="activeTab === tab.id"
        role="tab"
        @click="onTabChange(index)"
      >
        {{ tab.label }}
        <!-- Active indicator -->
        <span
          v-if="activeTab === tab.id"
          class="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full"
          aria-hidden="true"
        />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { TabConfig } from '@/types'

interface Props {
  tabs: TabConfig[]
  activeTab: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'tab-change': [tabId: string]
}>()

function onTabChange(index: number) {
  const tab = props.tabs[index]
  if (tab) {
    emit('tab-change', tab.id)
    window.location.hash = tab.id
  }
}
</script>

<style scoped>
.tab-navigation {
  border-bottom: 1px solid rgb(229 231 235 / 0.6);
}

/* Enhanced button hover effects */
button {
  position: relative;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.03), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover::before {
  transform: translateX(100%);
}

/* Active tab indicator smooth transition */
.active-indicator {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced focus styling */
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  border-radius: 4px;
}
</style>