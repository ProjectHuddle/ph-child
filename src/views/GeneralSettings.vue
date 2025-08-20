<template>
  <div class="general-settings space-y-4">
    <!-- Header -->
    <div class="pb-3 border-b border-gray-200/60">
      <h2 class="text-base font-semibold text-gray-900 mb-0.5">General Settings</h2>
      <p class="text-xs text-gray-600">Configure user permissions and commenting features</p>
    </div>

    <!-- User Roles Section -->
    <div class="space-y-3">
      <div class="bg-gray-50/50 rounded-md p-4 border border-gray-200/60">
        <div class="mb-3">
          <h3 class="text-sm font-medium text-gray-900 mb-0.5">User Permissions</h3>
          <p class="text-xs text-gray-600">{{ __('Select which roles can leave comments', 'ph-child') }}</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          <div
            v-for="role in availableRoles"
            :key="role.name"
            class="role-card flex items-center space-x-2 p-2.5 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
            @click="toggleRole(role.name)"
          >
            <Checkbox 
              :id="`role-${role.name}`" 
              :checked="settingsStore.state.general.ph_child_role_can_comment.includes(role.name)" 
              @update:checked="(val:boolean)=>handleRoleChange(role.name, val)" 
              class="role-checkbox pointer-events-none"
            />
            <label :for="`role-${role.name}`" class="text-xs font-medium text-gray-700 cursor-pointer flex-1 pointer-events-none leading-tight">
              {{ role.label }}
            </label>
          </div>
        </div>
        
        <div class="mt-3 p-2.5 bg-blue-50/50 rounded border border-blue-200/50">
          <p class="text-xs text-blue-700 flex items-start gap-1.5">
            <i class="pi pi-info-circle text-blue-600 mt-0.5 flex-shrink-0 text-xs"></i>
            <span>{{ __('Selected user roles will be able to leave comments on this site', 'ph-child') }}</span>
          </p>
        </div>
      </div>

      <!-- Feature Toggles -->
      <div class="space-y-2">
        <!-- Guest Comments -->
        <div class="setting-card bg-white border border-gray-200/60 rounded-md p-3 hover:shadow-sm transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-3">
              <div class="flex items-center gap-2 mb-0.5">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ __('Guest Comments', 'ph-child') }}
                </h4>
                <span class="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                  {{ settingsStore.state.general.ph_child_guest_comments_enabled ? 'ON' : 'OFF' }}
                </span>
              </div>
              <p class="text-xs text-gray-600 leading-tight">
                {{ __('Allow non-logged in visitors to view and add comments', 'ph-child') }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <Switch 
                v-model:checked="settingsStore.state.general.ph_child_guest_comments_enabled"
                @click="toggleGuestComments"
              />
            </div>
          </div>
        </div>

        <!-- Admin Comments -->
        <div class="setting-card bg-white border border-gray-200/60 rounded-md p-3 hover:shadow-sm transition-shadow duration-200">
          <div class="flex items-center justify-between">
            <div class="flex-1 pr-3">
              <div class="flex items-center gap-2 mb-0.5">
                <h4 class="text-sm font-medium text-gray-900">
                  {{ __('Admin Area Comments', 'ph-child') }}
                </h4>
                <span class="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                  {{ settingsStore.state.general.ph_child_admin ? 'ON' : 'OFF' }}
                </span>
              </div>
              <p class="text-xs text-gray-600 leading-tight">
                {{ __('Enable commenting on WordPress admin pages', 'ph-child') }}
              </p>
            </div>
            <div class="flex-shrink-0">
              <Switch 
                v-model:checked="settingsStore.state.general.ph_child_admin"
                @click="toggleAdminComments"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Notice -->
    <ErrorNotice
      :message="settingsStore.state.errors.general"
      :dismissible="true"
      @dismiss="settingsStore.clearErrors"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import ErrorNotice from '@/components/ErrorNotice.vue'
import Switch from '@/components/ui/Switch.vue'
import Checkbox from '@/components/ui/Checkbox.vue'

const settingsStore = useSettingsStore()

const availableRoles = computed(() => settingsStore.availableRoles)

function handleRoleChange(roleName: string, selected: boolean) {
  settingsStore.updateRoleSelection(roleName, selected)
}

function toggleRole(roleName: string) {
  const currentSelection = settingsStore.state.general.ph_child_role_can_comment.includes(roleName)
  handleRoleChange(roleName, !currentSelection)
}

function toggleGuestComments() {
  settingsStore.state.general.ph_child_guest_comments_enabled = !settingsStore.state.general.ph_child_guest_comments_enabled
}

function toggleAdminComments() {
  settingsStore.state.general.ph_child_admin = !settingsStore.state.general.ph_child_admin
}

// WordPress translation function fallback
function __(text: string, domain: string = 'ph-child'): string {
  // This would normally use wp.i18n.__ but fallback to English
  const translations: Record<string, string> = {
    'Which roles can leave comments?': 'Which roles can leave comments?',
    'Select which user roles should be able to leave comments on this site.': 'Select which user roles should be able to leave comments on this site.',
    'Allow Site Visitors to view and add comments': 'Allow Site Visitors to view and add comments',
    'Check this to allow non-logged in users (guests) to leave comments and view the comment interface.': 'Check this to allow non-logged in users (guests) to leave comments and view the comment interface.',
    'Enable commenting on admin': 'Enable commenting on admin',
    'Check this to enable commenting on the WordPress admin pages.': 'Check this to enable commenting on the WordPress admin pages.',
    'Guest Comments': 'Guest Comments',
    'Admin Area Comments': 'Admin Area Comments'
  }
  
  return translations[text] || text
}

onMounted(() => {
  if (settingsStore.availableRoles.length === 0) {
    settingsStore.loadSettings()
  }
})
</script>

<style scoped>
.general-settings {
  max-width: none;
}

/* Role card styling */
.role-card {
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.role-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.role-card:has(.role-checkbox:checked) {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

/* Setting card styling */
.setting-card {
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.setting-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Custom Toggle Switch Styling */
.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  width: 44px;
  height: 24px;
  background-color: #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.toggle-label:hover {
  background-color: #9ca3af;
}

.toggle-label.toggle-active {
  background-color: #3b82f6;
}

.toggle-label.toggle-active:hover {
  background-color: #2563eb;
}

.toggle-slider {
  position: absolute;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.toggle-active .toggle-slider {
  transform: translateX(20px);
}

/* Focus states for accessibility */
.toggle-input:focus + .toggle-label {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Smooth animations */
.role-card,
.setting-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Focus states */
.role-card:focus-within {
  outline: 2px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
  border-color: #3b82f6;
}

/* Info highlight */
.bg-blue-50 {
  background-color: rgba(239, 246, 255, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.2);
}
</style>