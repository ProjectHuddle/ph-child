<template>
  <TabsRoot
    :default-value="defaultValue"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :class="cn('w-full', props.class)"
  >
    <TabsList
      :class="cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        listClass
      )"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        :class="cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
          triggerClass
        )"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    
    <slot />
  </TabsRoot>
</template>

<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from 'radix-vue'
import { cn } from '@/lib/utils'

interface Tab {
  value: string
  label: string
}

interface Props {
  class?: string
  listClass?: string
  triggerClass?: string
  tabs: Tab[]
  defaultValue?: string
  modelValue?: string
}

const props = defineProps<Props>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>