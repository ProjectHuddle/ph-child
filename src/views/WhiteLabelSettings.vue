<template>
  <div class="white-label-settings space-y-6">
    <!-- Header -->
    <div class="pb-3 border-b border-gray-200/60">
      <h2 class="text-base font-semibold text-gray-900 mb-0.5">White Label Settings</h2>
      <p class="text-xs text-gray-600">{{ __('Customize plugin branding for your agency', 'ph-child') }}</p>
    </div>

    <!-- Branding Form -->
    <div class="bg-white border border-gray-200/60 rounded-md overflow-hidden">
      <div class="px-3 py-2 bg-gray-50/50 border-b border-gray-200/60">
        <h4 class="text-xs font-medium text-gray-900">Plugin Branding</h4>
      </div>
      <div class="p-3 space-y-3">
        <!-- Plugin Name -->
        <div class="form-group">
          <label for="ph_child_plugin_name" class="block text-xs font-medium text-gray-700 mb-1.5">
            {{ __('Plugin Name', 'ph-child') }}
          </label>
          <Input 
            id="ph_child_plugin_name" 
            v-model="settingsStore.state.whiteLabel.ph_child_plugin_name" 
            :disabled="settingsStore.state.saving" 
            :placeholder="__('SureFeedback Client Site', 'ph-child')" 
            class="w-full text-sm"
          />
          <p class="mt-1 text-xs text-gray-500 leading-tight">
            {{ __('Name displayed in plugins list and admin menu', 'ph-child') }}
          </p>
        </div>

        <!-- Plugin Description -->
        <div class="form-group">
          <label for="ph_child_plugin_description" class="block text-xs font-medium text-gray-700 mb-1.5">
            {{ __('Plugin Description', 'ph-child') }}
          </label>
          <Textarea 
            id="ph_child_plugin_description" 
            v-model="settingsStore.state.whiteLabel.ph_child_plugin_description" 
            rows="2" 
            :disabled="settingsStore.state.saving" 
            :placeholder="__('Collect feedback from client websites and sync with SureFeedback parent project', 'ph-child')" 
            class="w-full resize-none text-sm"
          />
          <p class="mt-1 text-xs text-gray-500 leading-tight">
            {{ __('Description shown in plugins list', 'ph-child') }}
          </p>
        </div>

        <!-- Author Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Plugin Author -->
          <div class="form-group">
            <label for="ph_child_plugin_author" class="block text-sm font-medium text-gray-700 mb-2">
              {{ __('Plugin Author', 'ph-child') }}
            </label>
            <Input 
              id="ph_child_plugin_author" 
              v-model="settingsStore.state.whiteLabel.ph_child_plugin_author" 
              :disabled="settingsStore.state.saving" 
              :placeholder="__('Your Agency Name', 'ph-child')" 
              class="w-full"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ __('The author name that appears in the plugins list.', 'ph-child') }}
            </p>
          </div>

          <!-- Author URL -->
          <div class="form-group">
            <label for="ph_child_plugin_author_url" class="block text-sm font-medium text-gray-700 mb-2">
              {{ __('Author URL', 'ph-child') }}
            </label>
            <Input 
              id="ph_child_plugin_author_url" 
              type="url" 
              v-model="settingsStore.state.whiteLabel.ph_child_plugin_author_url" 
              :disabled="settingsStore.state.saving" 
              :placeholder="__('https://youragency.com', 'ph-child')" 
              class="w-full"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ __('The URL that the author name links to.', 'ph-child') }}
            </p>
          </div>
        </div>

        <!-- Plugin URL -->
        <div class="form-group">
          <label for="ph_child_plugin_link" class="block text-sm font-medium text-gray-700 mb-2">
            {{ __('Plugin URL', 'ph-child') }}
          </label>
          <Input 
            id="ph_child_plugin_link" 
            type="url" 
            v-model="settingsStore.state.whiteLabel.ph_child_plugin_link" 
            :disabled="settingsStore.state.saving" 
            :placeholder="__('https://youragency.com/plugin', 'ph-child')" 
            class="w-full"
          />
          <p class="mt-1 text-xs text-gray-500">
            {{ __('The URL for the "Visit plugin site" link in the plugins list.', 'ph-child') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Live Preview -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div class="flex items-center gap-2">
          <i class="pi pi-eye text-blue-600"></i>
          <h4 class="text-base font-medium text-gray-900">{{ __('Live Preview', 'ph-child') }}</h4>
        </div>
        <p class="text-sm text-gray-600 mt-1">See how your plugin will appear in the WordPress plugins list</p>
      </div>
      <div class="p-6">
        <div class="plugin-preview-card bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-6 shadow-inner">
          <!-- Plugin Title -->
          <div class="plugin-title mb-3">
            <h5 class="text-lg font-semibold text-gray-900 transition-all duration-300">
              {{ displayName || __('SureFeedback Client Site', 'ph-child') }}
            </h5>
            <div class="text-xs text-gray-500 mt-1">Version 1.0.0 | Active</div>
          </div>

          <!-- Plugin Description -->
          <div class="plugin-description mb-4">
            <p class="text-sm text-gray-700 leading-relaxed transition-all duration-300">
              {{ displayDescription || __('Collect note-style feedback from your client\'s websites and sync them with your SureFeedback parent project.', 'ph-child') }}
            </p>
          </div>

          <!-- Plugin Meta -->
          <div class="plugin-meta flex items-center gap-4 text-sm text-gray-600">
            <span class="flex items-center gap-1">
              <i class="pi pi-user text-xs"></i>
              {{ __('By', 'ph-child') }}
              <span v-if="displayAuthorUrl" class="plugin-author">
                <a :href="displayAuthorUrl" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  {{ displayAuthor || __('Your Agency', 'ph-child') }}
                </a>
              </span>
              <span v-else class="plugin-author font-medium text-gray-700">
                {{ displayAuthor || __('Brainstorm Force', 'ph-child') }}
              </span>
            </span>
            
            <span class="w-1 h-1 bg-gray-400 rounded-full"></span>
            
            <span v-if="displayPluginUrl" class="plugin-link">
              <a :href="displayPluginUrl" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1">
                <i class="pi pi-external-link text-xs"></i>
                {{ __('Visit plugin site', 'ph-child') }}
              </a>
            </span>
            <span v-else class="plugin-link">
              <a href="http://surefeedback.com" target="_blank" class="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1">
                <i class="pi pi-external-link text-xs"></i>
                {{ __('Visit plugin site', 'ph-child') }}
              </a>
            </span>
          </div>
        </div>
        
        <!-- Preview Note -->
        <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p class="text-sm text-blue-700 flex items-center gap-2">
            <i class="pi pi-info-circle"></i>
            This preview updates in real-time as you type in the fields above.
          </p>
        </div>
      </div>
    </div>

    <ErrorNotice
      :message="settingsStore.state.errors.whiteLabel"
      :dismissible="true"
      @dismiss="settingsStore.clearErrors"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import ErrorNotice from '@/components/ErrorNotice.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'

const settingsStore = useSettingsStore()

// Computed values for preview
const displayName = computed(() => 
  settingsStore.state.whiteLabel.ph_child_plugin_name?.trim()
)

const displayDescription = computed(() => 
  settingsStore.state.whiteLabel.ph_child_plugin_description?.trim()
)

const displayAuthor = computed(() => 
  settingsStore.state.whiteLabel.ph_child_plugin_author?.trim()
)

const displayAuthorUrl = computed(() => 
  settingsStore.state.whiteLabel.ph_child_plugin_author_url?.trim()
)

const displayPluginUrl = computed(() => 
  settingsStore.state.whiteLabel.ph_child_plugin_link?.trim()
)

// WordPress translation function fallback
function __(text: string, domain: string = 'ph-child'): string {
  const translations: Record<string, string> = {
    'Customize the plugin branding to match your agency or company.': 'Customize the plugin branding to match your agency or company.',
    'Plugin Name': 'Plugin Name',
    'SureFeedback Client Site': 'SureFeedback Client Site',
    'The name that appears in the plugins list and admin menu.': 'The name that appears in the plugins list and admin menu.',
    'Plugin Description': 'Plugin Description',
    'Collect note-style feedback from your client\'s websites and sync them with your SureFeedback parent project.': 'Collect note-style feedback from your client\'s websites and sync them with your SureFeedback parent project.',
    'The description that appears in the plugins list.': 'The description that appears in the plugins list.',
    'Plugin Author': 'Plugin Author',
    'Your Agency Name': 'Your Agency Name',
    'The author name that appears in the plugins list.': 'The author name that appears in the plugins list.',
    'Author URL': 'Author URL',
    'https://youragency.com': 'https://youragency.com',
    'The URL that the author name links to.': 'The URL that the author name links to.',
    'Plugin URL': 'Plugin URL',
    'https://youragency.com/plugin': 'https://youragency.com/plugin',
    'The URL for the "Visit plugin site" link in the plugins list.': 'The URL for the "Visit plugin site" link in the plugins list.',
    'Live Preview': 'Live Preview',
    'By': 'By',
    'Your Agency': 'Your Agency',
    'Brainstorm Force': 'Brainstorm Force',
    'Visit plugin site': 'Visit plugin site'
  }
  
  return translations[text] || text
}
</script>

<style scoped>
.white-label-settings {
  max-width: none;
}

/* Form styling */
.form-group {
  transition: all 0.2s ease;
}

.form-group label {
  transition: color 0.2s ease;
}

.form-group:focus-within label {
  color: #3b82f6;
}

/* Input and textarea styling */
.form-group input:focus,
.form-group textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

/* Responsive grid */
@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

/* Preview card styling */
.plugin-preview-card {
  position: relative;
  transition: all 0.3s ease;
}

.plugin-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Live preview animations */
.plugin-title h5,
.plugin-description p {
  transition: all 0.3s ease;
}

/* Meta links styling */
.plugin-meta a {
  text-decoration: none;
  position: relative;
}

.plugin-meta a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -1px;
  left: 0;
  background-color: currentColor;
  transition: width 0.3s ease;
}

.plugin-meta a:hover::after {
  width: 100%;
}

/* Card animations */
.bg-white {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Preview update animation */
@keyframes highlightUpdate {
  0% { background-color: rgba(59, 130, 246, 0.1); }
  100% { background-color: transparent; }
}

.plugin-title.updated,
.plugin-description.updated {
  animation: highlightUpdate 0.6s ease-out;
}

/* Gradient text effect for preview header */
.bg-gradient-to-r {
  background: linear-gradient(90deg, #eff6ff 0%, #eef2ff 100%);
}

/* Icon styling */
.pi {
  transition: all 0.2s ease;
}

.pi:hover {
  transform: scale(1.1);
}

/* Enhanced shadow for preview */
.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* Smooth transitions for all elements */
* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
</style>