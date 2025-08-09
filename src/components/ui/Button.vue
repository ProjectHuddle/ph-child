<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :target="target"
    :class="buttonVariants({ variant, size, class: props.class })"
    :disabled="(!href && disabled) || loading"
    v-bind="$attrs"
  >
    <component
      :is="Loader2"
      v-if="loading"
      class="mr-2 h-4 w-4 animate-spin"
    />
    <component
      :is="iconComponent"
      v-else-if="icon && iconPosition === 'left'"
      class="mr-2 h-4 w-4"
    />
    <slot />
    <component
      :is="iconComponent"
      v-if="icon && iconPosition === 'right'"
      class="ml-2 h-4 w-4"
    />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-vue-next'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

interface Props {
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  class?: string
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  href?: string
  target?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
  iconPosition: 'left',
})

const iconComponent = computed(() => {
  if (!props.icon) return null
  // Map PrimeIcons to Lucide icons
  const iconMap: Record<string, any> = {
    'pi pi-save': 'Save',
    'pi pi-check': 'Check',
    'pi pi-times': 'X',
    'pi pi-info-circle': 'Info',
  }
  return iconMap[props.icon] || null
})
</script>