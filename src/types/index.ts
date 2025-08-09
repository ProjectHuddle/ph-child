export interface GeneralSettings {
  ph_child_role_can_comment: string[]
  ph_child_guest_comments_enabled: boolean
  ph_child_admin: boolean
}

export interface ConnectionSettings {
  ph_child_id: number | ''
  ph_child_api_key: string
  ph_child_access_token: string
  ph_child_parent_url: string
  ph_child_signature: string
  ph_child_installed: boolean
}

export interface WhiteLabelSettings {
  ph_child_plugin_name: string
  ph_child_plugin_description: string
  ph_child_plugin_author: string
  ph_child_plugin_author_url: string
  ph_child_plugin_link: string
}

export interface ConnectionStatus {
  connected: boolean
  parent_url?: string
  project_id?: number
  last_verified?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string>
}

export interface TabConfig {
  id: string
  label: string
  visible: boolean
}

export interface SettingsState {
  general: GeneralSettings
  connection: ConnectionSettings
  whiteLabel: WhiteLabelSettings
  connectionStatus: ConnectionStatus
  loading: boolean
  saving: boolean
  errors: Record<string, string>
  activeTab: string
}

export interface UserRole {
  name: string
  label: string
  selected: boolean
}

export interface ManualImportData {
  project_id: number
  api_key: string
  access_token: string
  parent_url: string
  signature: string
}