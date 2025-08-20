<template>
  <CheckboxRoot
    v-model:checked="checked"
    :class="cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      props.class
    )"
    v-bind="forwarded"
  >
    <CheckboxIndicator class="flex items-center justify-center text-current">
      <Check class="h-3 w-3" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>

<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'radix-vue'
import type { CheckboxRootEmits, CheckboxRootProps } from 'radix-vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  class?: string
  disabled?: boolean
}

const props = defineProps<Props>()

const emits = defineEmits<CheckboxRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)

const checked = defineModel<boolean>('checked', { default: false })
</script>