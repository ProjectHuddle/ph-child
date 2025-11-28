<?php
/**
 * Dashboard API functionality for SureFeedback
 * Provides statistics and plugin management endpoints
 */

if (!defined('ABSPATH')) {
    exit;
}

// Include WordPress plugin installer functions
if (!function_exists('request_filesystem_credentials')) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
}
if (!function_exists('get_plugins')) {
    require_once ABSPATH . 'wp-admin/includes/plugin.php';
}
if (!class_exists('WP_Upgrader')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
}
if (!class_exists('Plugin_Upgrader')) {
    require_once ABSPATH . 'wp-admin/includes/class-plugin-upgrader.php';
}
if (!class_exists('Automatic_Upgrader_Skin')) {
    require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader-skins.php';
}

class PH_Child_Dashboard_API {
    /**
     * Initialize Dashboard API routes
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_dashboard_routes'));
    }

    /**
     * Register dashboard-specific REST API routes
     */
    public function register_dashboard_routes() {
        // Plugin status endpoint
        register_rest_route('ph-child/v1', '/plugins/status', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_plugin_statuses'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Plugin actions endpoint
        register_rest_route('ph-child/v1', '/plugins/action', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'handle_plugin_action'),
                'permission_callback' => array($this, 'verify_admin_access'),
                'args' => array(
                    'plugin' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'action' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                        'enum' => array('activate', 'deactivate', 'install'),
                    ),
                ),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

    }

    /**
     * Verify admin access
     */
    public function verify_admin_access($request) {
        if (!current_user_can('manage_options')) {
            return new WP_Error('rest_forbidden', __('Insufficient permissions', 'ph-child'), array('status' => 403));
        }
        
        $nonce = $request->get_header('X-WP-Nonce');
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error('rest_forbidden', __('Invalid nonce', 'ph-child'), array('status' => 403));
        }
        
        return true;
    }

    /**
     * Get plugin statuses
     */
    public function get_plugin_statuses($request) {
        $plugin_mappings = array(
            'suremail' => 'suremail/suremail.php',
            'ottokit' => 'ottokit/ottokit.php',
            'ultimate_addons' => 'ultimate-elementor/ultimate-elementor.php',
            'starter_templates' => 'astra-sites/astra-sites.php',
        );

        $statuses = array();
        foreach ($plugin_mappings as $key => $plugin_file) {
            $plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;
            
            // Check if plugin file exists first
            if (file_exists($plugin_path)) {
                if (is_plugin_active($plugin_file)) {
                    $statuses[$key] = 'activated';
                } else {
                    $statuses[$key] = 'installed';
                }
            } else {
                $statuses[$key] = 'install';
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'data' => $statuses,
        ));
    }

    /**
     * Handle plugin actions (install, activate, deactivate)
     */
    public function handle_plugin_action($request) {
        $params = $request->get_params();
        $plugin = $params['plugin'];
        $action = $params['action'];

        // Define plugin mappings with slug for installation
        $plugin_mappings = array(
            'suremail' => array(
                'file' => 'suremail/suremail.php',
                'slug' => 'suremail'
            ),
            'ottokit' => array(
                'file' => 'ottokit/ottokit.php',
                'slug' => 'ottokit'
            ),
            'ultimate_addons' => array(
                'file' => 'ultimate-elementor/ultimate-elementor.php',
                'slug' => 'ultimate-elementor'
            ),
            'starter_templates' => array(
                'file' => 'astra-sites/astra-sites.php',
                'slug' => 'astra-sites'
            ),
        );

        if (!isset($plugin_mappings[$plugin])) {
            return new WP_Error('invalid_plugin', __('Invalid plugin specified', 'ph-child'), array('status' => 400));
        }

        $plugin_data = $plugin_mappings[$plugin];
        $plugin_file = $plugin_data['file'];
        $plugin_slug = $plugin_data['slug'];
        $plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;
        
        $result = array('success' => false, 'message' => '', 'new_status' => '');

        // Check if plugin file exists
        $plugin_exists = file_exists($plugin_path);
        $is_active = $plugin_exists && is_plugin_active($plugin_file);

        switch ($action) {
            case 'activate':
                if (!$plugin_exists) {
                    $result['message'] = sprintf(__('%s plugin is not installed. Please install it first.', 'ph-child'), ucfirst($plugin));
                    $result['new_status'] = 'install';
                    break;
                }
                
                if ($is_active) {
                    $result['success'] = true;
                    $result['message'] = sprintf(__('%s is already active', 'ph-child'), ucfirst($plugin));
                    $result['new_status'] = 'activated';
                } else {
                    $activate_result = activate_plugin($plugin_file);
                    if (is_wp_error($activate_result)) {
                        $result['message'] = $activate_result->get_error_message();
                        $result['new_status'] = 'installed';
                    } else {
                        $result['success'] = true;
                        $result['message'] = sprintf(__('%s activated successfully', 'ph-child'), ucfirst($plugin));
                        $result['new_status'] = 'activated';
                    }
                }
                break;

            case 'deactivate':
                if (!$plugin_exists) {
                    $result['message'] = sprintf(__('%s plugin is not installed.', 'ph-child'), ucfirst($plugin));
                    $result['new_status'] = 'install';
                    break;
                }
                
                if ($is_active) {
                    deactivate_plugins($plugin_file);
                    $result['success'] = true;
                    $result['message'] = sprintf(__('%s deactivated successfully', 'ph-child'), ucfirst($plugin));
                    $result['new_status'] = 'installed';
                } else {
                    $result['success'] = true;
                    $result['message'] = sprintf(__('%s is already inactive', 'ph-child'), ucfirst($plugin));
                    $result['new_status'] = 'installed';
                }
                break;

            case 'install':
                // Check if already installed
                if ($plugin_exists) {
                    if ($is_active) {
                        $result['success'] = true;
                        $result['message'] = sprintf(__('%s is already installed and activated', 'ph-child'), ucfirst($plugin));
                        $result['new_status'] = 'activated';
                    } else {
                        // Try to activate if installed but not active
                        $activate_result = activate_plugin($plugin_file);
                        if (is_wp_error($activate_result)) {
                            $result['message'] = sprintf(__('%s is installed but activation failed: %s', 'ph-child'), ucfirst($plugin), $activate_result->get_error_message());
                            $result['new_status'] = 'installed';
                        } else {
                            $result['success'] = true;
                            $result['message'] = sprintf(__('%s installed and activated successfully', 'ph-child'), ucfirst($plugin));
                            $result['new_status'] = 'activated';
                        }
                    }
                } else {
                    // Install the plugin from WordPress repository
                    $install_result = $this->install_plugin_from_repo($plugin_slug, $plugin_file);
                    
                    if ($install_result['success']) {
                        // Use the actual plugin file path returned from installation
                        $actual_plugin_file = isset($install_result['plugin_file']) ? $install_result['plugin_file'] : $plugin_file;
                        
                        // Try to activate after installation
                        $activate_result = activate_plugin($actual_plugin_file);
                        if (is_wp_error($activate_result)) {
                            $result['success'] = true;
                            $result['message'] = sprintf(__('%s installed successfully. Please activate it manually.', 'ph-child'), ucfirst($plugin));
                            $result['new_status'] = 'installed';
                        } else {
                            $result['success'] = true;
                            $result['message'] = sprintf(__('%s installed and activated successfully', 'ph-child'), ucfirst($plugin));
                            $result['new_status'] = 'activated';
                        }
                    } else {
                        $result['message'] = $install_result['message'];
                        $result['new_status'] = 'install';
                    }
                }
                break;

            default:
                return new WP_Error('invalid_action', __('Invalid action specified', 'ph-child'), array('status' => 400));
        }

        return rest_ensure_response($result);
    }

    /**
     * Install plugin from WordPress repository
     * 
     * @param string $plugin_slug Plugin slug (e.g., 'suremail')
     * @param string $plugin_file Plugin file path (e.g., 'suremail/suremail.php')
     * @return array Result array with 'success' and 'message'
     */
    private function install_plugin_from_repo($plugin_slug, $plugin_file) {
        $result = array('success' => false, 'message' => '');
        
        // Check if plugin is already installed
        if (file_exists(WP_PLUGIN_DIR . '/' . $plugin_file)) {
            $result['success'] = true;
            $result['message'] = __('Plugin is already installed', 'ph-child');
            return $result;
        }
        
        // Get filesystem credentials
        $url = wp_nonce_url(
            admin_url('update.php?action=install-plugin&plugin=' . $plugin_slug),
            'install-plugin_' . $plugin_slug
        );
        
        // Suppress output during credentials request
        ob_start();
        $creds = request_filesystem_credentials($url, '', false, false, null);
        ob_end_clean();
        
        // If we don't have credentials, try to use direct filesystem access
        if (false === $creds) {
            // Try direct filesystem access (for cases where FTP credentials aren't needed)
            $creds = array(
                'hostname' => '',
                'username' => '',
                'password' => '',
                'public_key' => '',
                'private_key' => '',
                'connection_type' => 'direct'
            );
        }
        
        // Initialize the filesystem
        if (!WP_Filesystem($creds)) {
            $result['message'] = __('Filesystem access is required to install plugins. Please ensure your WordPress installation has write permissions to the plugins directory, or install the plugin manually from the WordPress admin.', 'ph-child');
            return $result;
        }
        
        // Get the WordPress filesystem global
        global $wp_filesystem;
        
        if (!$wp_filesystem) {
            $result['message'] = __('Filesystem initialization failed. Please check your filesystem permissions.', 'ph-child');
            return $result;
        }
        
        // Create plugin upgrader with skin (silent mode) - same as WordPress core
        $skin = new Automatic_Upgrader_Skin();
        $upgrader = new Plugin_Upgrader($skin);
        
        // Install the plugin from WordPress.org
        // Use the WordPress.org API to get the download URL
        $api_url = 'https://api.wordpress.org/plugins/info/1.0/' . $plugin_slug . '.json';
        $api_response = wp_remote_get($api_url);
        
        if (is_wp_error($api_response)) {
            // Fallback to direct download URL
            $download_url = 'https://downloads.wordpress.org/plugin/' . $plugin_slug . '.latest-stable.zip';
        } else {
            $api_data = json_decode(wp_remote_retrieve_body($api_response), true);
            if (isset($api_data['download_link'])) {
                $download_url = $api_data['download_link'];
            } else {
                // Fallback to direct download URL
                $download_url = 'https://downloads.wordpress.org/plugin/' . $plugin_slug . '.latest-stable.zip';
            }
        }
        
        // Suppress output during installation
        ob_start();
        $install_result = $upgrader->install($download_url);
        $output = ob_get_clean();
        
        if (is_wp_error($install_result)) {
            $error_message = $install_result->get_error_message();
            $result['message'] = sprintf(
                __('Plugin installation failed: %s. Please install manually from the WordPress plugins page.', 'ph-child'),
                $error_message
            );
            return $result;
        }
        
        if (false === $install_result) {
            $result['message'] = __('Plugin installation failed. The plugin may not be available in the WordPress repository, or there may be a filesystem permission issue. Please install manually from the WordPress plugins page.', 'ph-child');
            return $result;
        }
        
        // Clear plugin cache to ensure new plugin is detected (same as WordPress core)
        wp_cache_delete('plugins', 'plugins');
        delete_site_transient('update_plugins');
        
        // Refresh the plugin list
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        
        // Get the installed plugin path from upgrader result first (most reliable)
        $installed_plugin_path = null;
        $main_file = basename($plugin_file);
        
        // Check upgrader result first (this tells us exactly where it was installed)
        if (isset($upgrader->result) && is_array($upgrader->result) && isset($upgrader->result['destination_name'])) {
            $installed_dir = $upgrader->result['destination_name'];
            $potential_path = $installed_dir . '/' . $main_file;
            if (file_exists(WP_PLUGIN_DIR . '/' . $potential_path)) {
                $installed_plugin_path = $potential_path;
            }
        }
        
        // If not found in upgrader result, use get_plugins() (same method as WordPress core)
        if (!$installed_plugin_path) {
            // Force refresh of plugin list
            wp_cache_flush();
            $all_plugins = get_plugins();
            
            // First check if the expected path exists
            if (isset($all_plugins[$plugin_file])) {
                $installed_plugin_path = $plugin_file;
            } else {
                // Find the plugin by main file name
                foreach ($all_plugins as $plugin_path => $plugin_data) {
                    if (basename($plugin_path) === $main_file) {
                        $installed_plugin_path = $plugin_path;
                        break;
                    }
                }
            }
        }
        
        if (!$installed_plugin_path) {
            $result['message'] = sprintf(
                __('Plugin was downloaded but could not be located. Please refresh the plugins page and check if %s appears there.', 'ph-child'),
                ucfirst($plugin_slug)
            );
            return $result;
        }
        
        // Update the plugin file path for activation
        $result['success'] = true;
        $result['message'] = __('Plugin installed successfully', 'ph-child');
        $result['plugin_file'] = $installed_plugin_path; // Return the actual file path
        return $result;
    }

}

// Initialize the Dashboard API
new PH_Child_Dashboard_API();
