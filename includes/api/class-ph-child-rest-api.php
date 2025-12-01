<?php
/**
 * REST API functionality for SureFeedback Client Site
 * Allows all origins but requires X-SureFeedback-Token
 */

if (!defined('ABSPATH')) {
    exit;
}

class PH_Child_REST_API {
    /**
     * Initialize REST API routes
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('rest_api_init', array($this, 'add_cors_headers'));
    }

    /**
     * Register custom REST API routes
     */
    public function register_routes() {
        // GET pages endpoint
        register_rest_route('surefeedback/v1', '/pages', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_pages'),
                'permission_callback' => array($this, 'verify_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null', // Let WP handle schema
                'permission_callback' => '__return_true',
            )
        ));

        // Store bearer token endpoint (for SaaS connections)
        register_rest_route('ph-child/v1', '/connection/store-token', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'store_connection_token'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Reset connection endpoint (clears SaaS connection tokens)
        register_rest_route('ph-child/v1', '/connection/reset', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'reset_connection'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Verify connection endpoint
        register_rest_route('ph-child/v1', '/connection/verify', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'verify_connection'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Save connection type preference endpoint
        register_rest_route('ph-child/v1', '/connection/type', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_connection_type'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_connection_type'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Get bearer token endpoint (for SaaS connections)
        register_rest_route('ph-child/v1', '/connection/token', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_connection_token'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Get connection status endpoint (proxies to external API)
        register_rest_route('ph-child/v1', '/connection/status', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_saas_connection_status'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Settings endpoints - register under ph-child/v1 namespace
        $this->register_settings_routes();

        // Page settings endpoints (Widget Control)
        $this->register_page_settings_routes();
    }

    /**
     * Register settings routes under ph-child/v1 namespace
     */
    private function register_settings_routes() {
        // Get all settings
        register_rest_route('ph-child/v1', '/settings', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_settings'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Save general settings
        register_rest_route('ph-child/v1', '/settings/general', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_general_settings'),
                'permission_callback' => array($this, 'verify_admin_access'),
                'args' => array(
                    'ph_child_role_can_comment' => array(
                        'type' => 'array',
                        'items' => array('type' => 'string'),
                        'sanitize_callback' => array($this, 'sanitize_roles'),
                    ),
                    'ph_child_guest_comments_enabled' => array(
                        'type' => 'boolean',
                        'sanitize_callback' => 'rest_sanitize_boolean',
                    ),
                    'ph_child_admin' => array(
                        'type' => 'boolean',
                        'sanitize_callback' => 'rest_sanitize_boolean',
                    ),
                ),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Save connection settings
        register_rest_route('ph-child/v1', '/settings/connection', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_connection_settings'),
                'permission_callback' => array($this, 'verify_admin_access'),
                'args' => array(
                    'ph_child_id' => array(
                        'type' => array('integer', 'string'),
                        'sanitize_callback' => array($this, 'sanitize_project_id'),
                    ),
                    'ph_child_api_key' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'ph_child_access_token' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'ph_child_parent_url' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'esc_url_raw',
                    ),
                    'ph_child_signature' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Save white label settings
        register_rest_route('ph-child/v1', '/settings/white-label', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'save_white_label_settings'),
                'permission_callback' => array($this, 'verify_admin_access'),
                'args' => array(
                    'ph_child_plugin_name' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'ph_child_plugin_description' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_textarea_field',
                    ),
                    'ph_child_plugin_author' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'ph_child_plugin_author_url' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'esc_url_raw',
                    ),
                    'ph_child_plugin_link' => array(
                        'type' => 'string',
                        'sanitize_callback' => 'esc_url_raw',
                    ),
                ),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Manual import settings
        register_rest_route('ph-child/v1', '/settings/manual-import', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'manual_import'),
                'permission_callback' => array($this, 'verify_admin_access'),
                'args' => array(
                    'parent_url' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'esc_url_raw',
                    ),
                    'project_id' => array(
                        'type' => 'integer',
                        'required' => true,
                        'sanitize_callback' => 'intval',
                    ),
                    'api_key' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'access_token' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'signature' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Migrate to SaaS
        register_rest_route('ph-child/v1', '/settings/migrate-to-saas', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'migrate_to_saas'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Test connection
        register_rest_route('ph-child/v1', '/settings/test-connection', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'test_connection'),
                'permission_callback' => array($this, 'verify_admin_access'),
                'args' => array(
                    'parent_url' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'esc_url_raw',
                    ),
                    'access_token' => array(
                        'type' => 'string',
                        'required' => true,
                        'sanitize_callback' => 'sanitize_text_field',
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
     * Get all settings
     */
    public function get_settings($request) {
        $general_settings = array(
            'ph_child_role_can_comment' => get_option('ph_child_role_can_comment', array()),
            'ph_child_guest_comments_enabled' => (bool) get_option('ph_child_guest_comments_enabled', false),
            'ph_child_admin' => (bool) get_option('ph_child_admin', false),
        );

        $connection_settings = array(
            'ph_child_id' => get_option('ph_child_id', ''),
            'ph_child_api_key' => get_option('ph_child_api_key', ''),
            'ph_child_access_token' => get_option('ph_child_access_token', ''),
            'ph_child_parent_url' => get_option('ph_child_parent_url', ''),
            'ph_child_signature' => get_option('ph_child_signature', ''),
            'ph_child_installed' => (bool) get_option('ph_child_installed', false),
        );

        $white_label_settings = array(
            'ph_child_plugin_name' => get_option('ph_child_plugin_name', ''),
            'ph_child_plugin_description' => get_option('ph_child_plugin_description', ''),
            'ph_child_plugin_author' => get_option('ph_child_plugin_author', ''),
            'ph_child_plugin_author_url' => get_option('ph_child_plugin_author_url', ''),
            'ph_child_plugin_link' => get_option('ph_child_plugin_link', ''),
        );

        $connection_status = $this->get_connection_status();
        $available_roles = $this->get_available_roles();

        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'general' => $general_settings,
                'connection' => $connection_settings,
                'whiteLabel' => $white_label_settings,
                'connectionStatus' => $connection_status,
                'availableRoles' => $available_roles,
            ),
        ));
    }

    /**
     * Save general settings
     */
    public function save_general_settings($request) {
        $params = $request->get_params();

        $updated = 0;

        if (isset($params['ph_child_role_can_comment'])) {
            update_option('ph_child_role_can_comment', $params['ph_child_role_can_comment']);
            $updated++;
        }

        if (isset($params['ph_child_guest_comments_enabled'])) {
            update_option('ph_child_guest_comments_enabled', $params['ph_child_guest_comments_enabled']);
            $updated++;
        }

        if (isset($params['ph_child_admin'])) {
            update_option('ph_child_admin', $params['ph_child_admin']);
            $updated++;
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => sprintf('Updated %d settings.', $updated),
        ));
    }

    /**
     * Save connection settings
     */
    public function save_connection_settings($request) {
        $params = $request->get_params();

        $updated = 0;

        foreach ($params as $key => $value) {
            if (strpos($key, 'ph_child_') === 0) {
                update_option($key, $value);
                $updated++;
            }
        }

        $connection_status = $this->get_connection_status();

        return rest_ensure_response(array(
            'success' => true,
            'message' => sprintf('Updated %d settings.', $updated),
            'data' => array(
                'connectionStatus' => $connection_status,
            ),
        ));
    }

    /**
     * Save white label settings
     */
    public function save_white_label_settings($request) {
        $params = $request->get_params();

        $updated = 0;

        foreach ($params as $key => $value) {
            if (strpos($key, 'ph_child_plugin_') === 0) {
                update_option($key, $value);
                $updated++;
            }
        }

        return rest_ensure_response(array(
            'success' => true,
            'message' => sprintf('Updated %d settings.', $updated),
        ));
    }

    /**
     * Manual import settings
     */
    public function manual_import($request) {
        $params = $request->get_params();

        // Validate required fields
        $required_fields = array('parent_url', 'project_id', 'api_key', 'access_token', 'signature');
        foreach ($required_fields as $field) {
            if (empty($params[$field])) {
                return new WP_Error(
                    'missing_field',
                    sprintf('Missing required field: %s', $field),
                    array('status' => 400)
                );
            }
        }

        // Save connection settings
        update_option('ph_child_parent_url', $params['parent_url']);
        update_option('ph_child_id', intval($params['project_id']));
        update_option('ph_child_api_key', $params['api_key']);
        update_option('ph_child_access_token', $params['access_token']);
        update_option('ph_child_signature', $params['signature']);
        update_option('ph_child_installed', true);

        $connection_status = $this->get_connection_status();

        return rest_ensure_response(array(
            'success' => true,
            'message' => 'Settings imported successfully.',
            'data' => array(
                'connectionStatus' => $connection_status,
            ),
        ));
    }

    /**
     * Test connection to parent site
     */
    public function test_connection($request) {
        $params = $request->get_params();
        $parent_url = $params['parent_url'];
        $token = $params['access_token'];

        // Simple connection test - try to reach the parent URL
        $response = wp_remote_get(
            $parent_url,
            array(
                'timeout' => 10,
                'headers' => array(
                    'X-SureFeedback-Token' => $token,
                ),
                'sslverify' => true,
            )
        );

        if (is_wp_error($response)) {
            return new WP_Error(
                'connection_failed',
                sprintf('Connection failed: %s', $response->get_error_message()),
                array('status' => 500)
            );
        }

        $response_code = wp_remote_retrieve_response_code($response);
        
        $status = array(
            'connected' => $response_code < 400,
            'response_code' => $response_code,
            'last_verified' => current_time('mysql'),
        );

        return rest_ensure_response(array(
            'success' => true,
            'data' => $status,
        ));
    }

    /**
     * Migrate from legacy connection to SaaS connection
     * 
     * Saves current legacy connection data and updates connection type preference
     */
    public function migrate_to_saas($request) {
        // Get current legacy connection data
        $legacy_data = array(
            'parent_url' => get_option('ph_child_parent_url', ''),
            'project_id' => get_option('ph_child_id', ''),
            'api_key' => get_option('ph_child_api_key', ''),
            'access_token' => get_option('ph_child_access_token', ''),
            'signature' => get_option('ph_child_signature', ''),
            'installed' => get_option('ph_child_installed', false),
            'migrated_at' => current_time('mysql'),
        );

        // Save legacy data to database (as backup)
        update_option('ph_child_legacy_migration_data', $legacy_data);

        // Delete old connection type preference
        delete_option('ph_child_connection_type_preference');
        delete_option('ph_child_connection_type_preference_time');

        // Set new SaaS preference
        update_option('ph_child_connection_type_preference', 'saas');
        update_option('ph_child_connection_type_preference_time', current_time('mysql'));

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Migration completed successfully. Your legacy connection data has been saved.', 'ph-child'),
            'data' => array(
                'legacy_data_saved' => true,
                'migrated_at' => $legacy_data['migrated_at'],
            ),
        ));
    }

    /**
     * Get connection status
     */
    private function get_connection_status() {
        $parent_url = get_option('ph_child_parent_url', '');
        $site_id = get_option('ph_child_id', '');
        $access_token = get_option('ph_child_access_token', '');
        $api_key = get_option('ph_child_api_key', '');
        $signature = get_option('ph_child_signature', '');
        $is_installed = (bool) get_option('ph_child_installed', false);

        $is_connected = !empty($parent_url) && !empty($site_id) && !empty($access_token);

        return array(
            'connected' => $is_connected,
            'parent_url' => $parent_url,
            'site_id' => $site_id,
            'has_api_key' => !empty($api_key),
            'has_token' => !empty($access_token),
            'has_signature' => !empty($signature),
            'installed' => $is_installed,
            'dashboard_url' => $is_connected ? $parent_url . '/wp-admin/post.php?post=' . $site_id . '&action=edit' : '',
        );
    }

    /**
     * Get available WordPress roles
     */
    private function get_available_roles() {
        global $wp_roles;

        if (!isset($wp_roles)) {
            $wp_roles = new WP_Roles();
        }

        $roles = array();
        $selected_roles = get_option('ph_child_role_can_comment', array());

        foreach ($wp_roles->roles as $role_key => $role_data) {
            $roles[] = array(
                'name' => $role_key,
                'label' => $role_data['name'],
                'selected' => in_array($role_key, $selected_roles, true),
            );
        }

        return $roles;
    }

    /**
     * Sanitize roles array
     */
    public function sanitize_roles($roles) {
        if (!is_array($roles)) {
            return array();
        }

        // Ensure the function is available
        if (!function_exists('get_editable_roles')) {
            require_once ABSPATH . 'wp-admin/includes/user.php';
        }

        $valid_roles = array_keys(get_editable_roles());
        return array_intersect($roles, $valid_roles);
    }

    /**
     * Sanitize project ID
     */
    public function sanitize_project_id($value) {
        if (is_numeric($value) && $value > 0) {
            return intval($value);
        }
        return '';
    }

    public function verify_access($request) {
        $token = $request->get_header('X-SureFeedback-Token');
        $valid_token = get_option('ph_child_access_token', '');
        if (empty($token)) {
            return new WP_Error('rest_forbidden', __('Access token required', 'ph-child'), array('status' => 401));
        }
        if (!hash_equals($valid_token, $token)) {
            return new WP_Error('rest_forbidden', __('Invalid access token', 'ph-child'), array('status' => 403));
        }
        return true;
    }

    /**
     * Verify admin access for storing connection tokens
     */
    public function verify_admin_access($request) {
        // Check if user is logged in and has admin capabilities
        if (!current_user_can('manage_options')) {
            return new WP_Error('rest_forbidden', __('Insufficient permissions', 'ph-child'), array('status' => 403));
        }
        
        // Verify nonce
        $nonce = $request->get_header('X-WP-Nonce');
        if (!wp_verify_nonce($nonce, 'wp_rest')) {
            return new WP_Error('rest_forbidden', __('Invalid nonce', 'ph-child'), array('status' => 403));
        }
        
        return true;
    }

    /**
     * Store connection token (for SaaS connections)
     */
    public function store_connection_token($request) {
        $params = $request->get_json_params();
        
        $access_token = isset($params['access_token']) ? sanitize_text_field($params['access_token']) : '';
        $connection_id = isset($params['connection_id']) ? sanitize_text_field($params['connection_id']) : '';
        $organization_id = isset($params['organization_id']) ? sanitize_text_field($params['organization_id']) : '';
        $project_id = isset($params['project_id']) ? sanitize_text_field($params['project_id']) : '';
        $site_id = isset($params['site_id']) ? sanitize_text_field($params['site_id']) : '';
        $site_url = isset($params['site_url']) ? esc_url_raw($params['site_url']) : '';
        $site_api_url = isset($params['site_api_url']) ? esc_url_raw($params['site_api_url']) : '';
        $script_token = isset($params['script_token']) ? sanitize_text_field($params['script_token']) : '';

        if (empty($access_token)) {
            return new WP_Error('rest_invalid_param', __('Access token is required', 'ph-child'), array('status' => 400));
        }

        update_option('ph_child_bearer_token', $access_token);
        
        if ($connection_id) {
            update_option('ph_child_connection_id', $connection_id);
        }
        if ($organization_id) {
            update_option('ph_child_organization_id', $organization_id);
        }
        if ($project_id) {
            update_option('ph_child_project_id', $project_id);
        }
        if ($site_id) {
            update_option('ph_child_site_id', $site_id);
        }
        if ($site_url) {
            update_option('ph_child_site_url', $site_url);
        }
        if ($site_api_url) {
            update_option('ph_child_site_api_url', $site_api_url);
        }
        if ($script_token) {
            update_option('ph_child_script_token', $script_token);
        }

        update_option('ph_child_connection_type_preference', 'saas');
        update_option('ph_child_connection_type_preference_time', current_time('mysql'));

        do_action('ph_child_connection_stored', array(
            'connection_id' => $connection_id,
            'organization_id' => $organization_id,
            'project_id' => $project_id,
            'site_id' => $site_id,
            'site_url' => $site_url,
            'site_api_url' => $site_api_url,
            'script_token' => $script_token,
        ));

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Connection token stored successfully', 'ph-child'),
        ));
    }

    /**
     * Reset connection (clear SaaS connection tokens)
     */
    public function reset_connection($request) {
        // Clear SaaS connection tokens
        delete_option('ph_child_bearer_token');
        delete_option('ph_child_connection_id');
        delete_option('ph_child_organization_id');
        delete_option('ph_child_project_id');
        delete_option('ph_child_site_id');
        delete_option('ph_child_site_url');
        delete_option('ph_child_site_api_url');
        delete_option('ph_child_script_token');

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Connection reset successfully', 'ph-child'),
        ));
    }

    /**
     * Verify connection
     */
    public function verify_connection($request) {
        // Check if legacy connection exists
        $parent_url = get_option('ph_child_parent_url', '');
        $site_id = get_option('ph_child_id', '');
        $api_key = get_option('ph_child_api_key', '');
        
        // Check if SaaS connection exists
        $bearer_token = get_option('ph_child_bearer_token', '');
        $connection_id = get_option('ph_child_connection_id', '');

        if (!empty($parent_url) && !empty($site_id) && !empty($api_key)) {
            // Legacy connection exists
            return rest_ensure_response(array(
                'success' => true,
                'status' => 'verified',
                'message' => __('Legacy connection verified', 'ph-child'),
                'type' => 'legacy',
            ));
        }

        if (!empty($bearer_token) || !empty($connection_id)) {
            // SaaS connection exists
            return rest_ensure_response(array(
                'success' => true,
                'status' => 'verified',
                'message' => __('SaaS connection verified', 'ph-child'),
                'type' => 'saas',
            ));
        }

        return rest_ensure_response(array(
            'success' => false,
            'status' => 'not_connected',
            'message' => __('No connection found', 'ph-child'),
        ));
    }

    /**
     * Save connection type preference
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function save_connection_type($request) {
        $params = $request->get_json_params();
        
        $connection_type = isset($params['type']) ? sanitize_text_field($params['type']) : '';
        
        // Validate connection type
        if (!in_array($connection_type, array('plugin', 'saas'))) {
            return new WP_Error('rest_invalid_param', __('Invalid connection type. Must be "plugin" or "saas"', 'ph-child'), array('status' => 400));
        }

        // Save the connection type preference
        update_option('ph_child_connection_type_preference', $connection_type);
        
        // Also update a timestamp for when the preference was set
        update_option('ph_child_connection_type_preference_time', current_time('mysql'));

        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Connection type preference saved successfully', 'ph-child'),
            'data' => array(
                'type' => $connection_type,
                'saved_at' => current_time('mysql'),
            ),
        ));
    }

    /**
     * Get connection type preference
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response
     */
    public function get_connection_type($request) {
        $preference = get_option('ph_child_connection_type_preference', '');
        $saved_at = get_option('ph_child_connection_type_preference_time', '');

        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'type' => $preference,
                'saved_at' => $saved_at,
            ),
        ));
    }

    /**
     * Get connection token (for SaaS connections)
     */
    public function get_connection_token($request) {
        $bearer_token = get_option('ph_child_bearer_token', '');
        
        if (empty($bearer_token)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => __('No bearer token found', 'ph-child'),
            ));
        }

        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'token' => $bearer_token,
            ),
        ));
    }

    /**
     * Get SaaS connection status (proxies to external API)
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_saas_connection_status($request) {
        // Get bearer token from WordPress options
        $bearer_token = get_option('ph_child_bearer_token', '');
        
        if (empty($bearer_token)) {
            return rest_ensure_response(array(
                'success' => false,
                'message' => __('Not connected to SaaS platform', 'ph-child'),
                'data' => null,
            ));
        }

        // Get API base URL (same pattern as main plugin file)
        if ( defined( 'SUREFEEDBACK_API_BASE_URL' ) ) {
            $api_base_url = SUREFEEDBACK_API_BASE_URL;
            if ( strpos( $api_base_url, '/api/v1' ) === false ) {
                $api_base_url = rtrim( $api_base_url, '/' ) . '/api/v1';
            }
        } elseif ( defined( 'PH_CHILD_API_BASE_URL' ) ) {
            $api_base_url = PH_CHILD_API_BASE_URL;
            if ( strpos( $api_base_url, '/api/v1' ) === false ) {
                $api_base_url = rtrim( $api_base_url, '/' ) . '/api/v1';
            }
        } else {
            $api_base_url = 'https://api.surefeedback.com/api/v1';
        }

        // Make request to external API from PHP (server-side)
        $response = wp_remote_get(
            $api_base_url . '/connections/status',
            array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $bearer_token,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ),
                'timeout' => 30,
            )
        );

        if (is_wp_error($response)) {
            return new WP_Error(
                'connection_status_failed',
                __('Failed to fetch connection status from SaaS platform', 'ph-child'),
                array('status' => 500)
            );
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        $response_data = json_decode($response_body, true);

        if ($response_code !== 200) {
            return new WP_Error(
                'connection_status_error',
                __('SaaS platform returned an error', 'ph-child'),
                array(
                    'status' => $response_code,
                    'data' => $response_data,
                )
            );
        }

        return rest_ensure_response(array(
            'success' => true,
            'data' => $response_data['data'] ?? $response_data,
        ));
    }

    public function get_pages($request) {
        $search_query = sanitize_text_field($request->get_param('search'));
        $args = array(
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
            's'              => $search_query,
        );
        $pages = get_posts($args);
        $response = array();
        $homepage_id = get_option('page_on_front');
        if ($homepage_id) {
            $response[] = array(
                'id'    => $homepage_id,
                'title' => get_the_title($homepage_id),
                'url'   => get_permalink($homepage_id),
            );
        } else {
            $response[] = array(
                'id'    => 0,
                'title' => 'Site Homepage',
                'url'   => home_url('/'),
            );
        }
        foreach ($pages as $page) {
            if ($page->ID == $homepage_id) continue;
            $response[] = array(
                'id'    => $page->ID,
                'title' => $page->post_title,
                'url'   => get_permalink($page->ID),
            );
        }
        return rest_ensure_response($response);
    }

    /**
     * Register page settings routes (Widget Control)
     */
    private function register_page_settings_routes() {
        // Get all pages with widget status
        register_rest_route('ph-child/v1', '/page-settings', array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_page_settings'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Update page settings
        register_rest_route('ph-child/v1', '/page-settings', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'update_page_settings'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Enable widget for specific page
        register_rest_route('ph-child/v1', '/page-settings/enable', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'enable_page_widget'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Disable widget for specific page
        register_rest_route('ph-child/v1', '/page-settings/disable', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'disable_page_widget'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Enable widget for all pages
        register_rest_route('ph-child/v1', '/page-settings/enable-all', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'enable_all_pages_widget'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));

        // Disable widget for all pages
        register_rest_route('ph-child/v1', '/page-settings/disable-all', array(
            array(
                'methods' => 'POST',
                'callback' => array($this, 'disable_all_pages_widget'),
                'permission_callback' => array($this, 'verify_admin_access'),
            ),
            array(
                'methods' => 'OPTIONS',
                'callback' => '__return_null',
                'permission_callback' => '__return_true',
            ),
        ));
    }

    /**
     * Get all pages with widget status
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_page_settings($request) {
        try {
            $pages = $this->get_all_pages_with_status();
            $settings = $this->get_page_widget_settings();

            return rest_ensure_response(array(
                'success' => true,
                'pages' => $pages,
                'settings' => $settings,
                'total' => count($pages),
            ));
        } catch (\Exception $e) {
            return new WP_Error(
                'page_settings_failed',
                __('Failed to fetch pages', 'ph-child'),
                array('status' => 500, 'error' => $e->getMessage())
            );
        }
    }

    /**
     * Update page settings
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function update_page_settings($request) {
        $params = $request->get_json_params();
        $settings = isset($params['settings']) ? $params['settings'] : array();

        if (!is_array($settings)) {
            return new WP_Error(
                'invalid_settings',
                __('Invalid settings format', 'ph-child'),
                array('status' => 400)
            );
        }

        $updated = $this->update_page_widget_settings($settings);

        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Page settings updated successfully', 'ph-child'),
                'settings' => $this->get_page_widget_settings(),
            ));
        }

        return new WP_Error(
            'update_failed',
            __('Failed to update page settings', 'ph-child'),
            array('status' => 500)
        );
    }

    /**
     * Enable widget for specific page
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function enable_page_widget($request) {
        $params = $request->get_json_params();
        $page_id = isset($params['page_id']) ? sanitize_text_field($params['page_id']) : '';

        if (empty($page_id)) {
            return new WP_Error(
                'missing_page_id',
                __('Page ID is required', 'ph-child'),
                array('status' => 400)
            );
        }

        $updated = $this->enable_widget_for_page($page_id);

        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Widget enabled for page', 'ph-child'),
                'page_id' => $page_id,
            ));
        }

        return new WP_Error(
            'enable_failed',
            __('Failed to enable widget', 'ph-child'),
            array('status' => 500)
        );
    }

    /**
     * Disable widget for specific page
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function disable_page_widget($request) {
        $params = $request->get_json_params();
        $page_id = isset($params['page_id']) ? sanitize_text_field($params['page_id']) : '';

        if (empty($page_id)) {
            return new WP_Error(
                'missing_page_id',
                __('Page ID is required', 'ph-child'),
                array('status' => 400)
            );
        }

        $updated = $this->disable_widget_for_page($page_id);

        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Widget disabled for page', 'ph-child'),
                'page_id' => $page_id,
            ));
        }

        return new WP_Error(
            'disable_failed',
            __('Failed to disable widget', 'ph-child'),
            array('status' => 500)
        );
    }

    /**
     * Enable widget for all pages
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function enable_all_pages_widget($request) {
        $updated = $this->enable_widget_for_all_pages();

        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Widget enabled for all pages', 'ph-child'),
            ));
        }

        return new WP_Error(
            'enable_all_failed',
            __('Failed to enable widget for all pages', 'ph-child'),
            array('status' => 500)
        );
    }

    /**
     * Disable widget for all pages
     * 
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function disable_all_pages_widget($request) {
        $updated = $this->disable_widget_for_all_pages();

        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Widget disabled for all pages', 'ph-child'),
            ));
        }

        return new WP_Error(
            'disable_all_failed',
            __('Failed to disable widget for all pages', 'ph-child'),
            array('status' => 500)
        );
    }

    /**
     * Get all pages with widget status
     * 
     * @return array
     */
    private function get_all_pages_with_status() {
        $pages = $this->get_all_pages();
        $page_settings = $this->get_page_widget_settings();

        foreach ($pages as &$page) {
            $page['widget_enabled'] = $this->is_widget_enabled_for_page($page['id'], $page_settings);
        }

        return $pages;
    }

    /**
     * Get all WordPress pages, posts, and special pages
     * 
     * @return array
     */
    private function get_all_pages() {
        $pages = array();

        // Get homepage
        $homepage_id = get_option('page_on_front');
        if ($homepage_id) {
            $pages[] = array(
                'id' => 'home',
                'title' => __('Homepage', 'ph-child'),
                'type' => 'home',
                'url' => home_url('/'),
            );
        }

        // Get blog page
        $blog_page_id = get_option('page_for_posts');
        if ($blog_page_id) {
            $pages[] = array(
                'id' => 'blog',
                'title' => __('Blog Page', 'ph-child'),
                'type' => 'blog',
                'url' => get_permalink($blog_page_id),
            );
        }

        // Get all published pages (exclude drafts, pending, private, etc.)
        $wp_pages = get_pages(array(
            'post_status' => 'publish', // Only published pages
            'number' => 1000,
            'sort_column' => 'post_title',
            'sort_order' => 'ASC',
        ));

        foreach ($wp_pages as $wp_page) {
            $pages[] = array(
                'id' => 'page_' . $wp_page->ID,
                'title' => $wp_page->post_title ?: __('(No Title)', 'ph-child'),
                'type' => 'page',
                'url' => get_permalink($wp_page->ID),
                'post_id' => $wp_page->ID,
            );
        }

        // Get all published posts (exclude drafts, pending, private, etc.)
        $wp_posts = get_posts(array(
            'post_status' => 'publish', // Only published posts
            'posts_per_page' => 100,
            'orderby' => 'title',
            'order' => 'ASC',
        ));

        foreach ($wp_posts as $wp_post) {
            $pages[] = array(
                'id' => 'post_' . $wp_post->ID,
                'title' => $wp_post->post_title ?: __('(No Title)', 'ph-child'),
                'type' => 'post',
                'url' => get_permalink($wp_post->ID),
                'post_id' => $wp_post->ID,
            );
        }

        // Get all custom post types
        $post_types = get_post_types(array(
            'public' => true,
            '_builtin' => false,
        ), 'objects');

        foreach ($post_types as $post_type) {
            $cpt_posts = get_posts(array(
                'post_type' => $post_type->name,
                'post_status' => 'publish', // Only published custom post types (exclude drafts)
                'posts_per_page' => 50,
                'orderby' => 'title',
                'order' => 'ASC',
            ));

            foreach ($cpt_posts as $cpt_post) {
                $pages[] = array(
                    'id' => $post_type->name . '_' . $cpt_post->ID,
                    'title' => $cpt_post->post_title ?: __('(No Title)', 'ph-child'),
                    'type' => $post_type->name,
                    'type_label' => $post_type->label,
                    'url' => get_permalink($cpt_post->ID),
                    'post_id' => $cpt_post->ID,
                );
            }
        }

        // Get archive pages
        $pages[] = array(
            'id' => 'archive',
            'title' => __('All Archives', 'ph-child'),
            'type' => 'archive',
            'url' => '',
        );

        // Get search page
        $pages[] = array(
            'id' => 'search',
            'title' => __('Search Results', 'ph-child'),
            'type' => 'search',
            'url' => '',
        );

        // Get 404 page
        $pages[] = array(
            'id' => '404',
            'title' => __('404 Page', 'ph-child'),
            'type' => '404',
            'url' => '',
        );

        return $pages;
    }

    /**
     * Get page widget settings
     * 
     * @return array
     */
    private function get_page_widget_settings() {
        return (array) get_option('ph_child_page_widget_settings', array());
    }

    /**
     * Check if widget is enabled for a specific page
     * 
     * @param string $page_id
     * @param array|null $settings
     * @return bool
     */
    private function is_widget_enabled_for_page($page_id, $settings = null) {
        if ($settings === null) {
            $settings = $this->get_page_widget_settings();
        }

        // If no settings exist, widget is enabled by default for all pages
        if (empty($settings)) {
            return true;
        }

        // Check if page is explicitly disabled
        if (isset($settings[$page_id]) && $settings[$page_id] === false) {
            return false;
        }

        // Default to enabled
        return true;
    }

    /**
     * Update page widget settings
     * 
     * @param array $settings
     * @return bool
     */
    private function update_page_widget_settings($settings) {
        $sanitized_settings = array();

        foreach ($settings as $page_id => $enabled) {
            $sanitized_page_id = sanitize_text_field($page_id);
            $sanitized_settings[$sanitized_page_id] = (bool) $enabled;
        }

        return update_option('ph_child_page_widget_settings', $sanitized_settings);
    }

    /**
     * Enable widget for specific page
     * 
     * @param string $page_id
     * @return bool
     */
    private function enable_widget_for_page($page_id) {
        $settings = $this->get_page_widget_settings();
        $settings[sanitize_text_field($page_id)] = true;
        return $this->update_page_widget_settings($settings);
    }

    /**
     * Disable widget for specific page
     * 
     * @param string $page_id
     * @return bool
     */
    private function disable_widget_for_page($page_id) {
        $settings = $this->get_page_widget_settings();
        $settings[sanitize_text_field($page_id)] = false;
        return $this->update_page_widget_settings($settings);
    }

    /**
     * Enable widget for all pages
     * 
     * @return bool
     */
    private function enable_widget_for_all_pages() {
        // Clear all settings to enable widget for all pages (default behavior)
        return update_option('ph_child_page_widget_settings', array());
    }

    /**
     * Disable widget for all pages
     * 
     * @return bool
     */
    private function disable_widget_for_all_pages() {
        $pages = $this->get_all_pages();
        $settings = array();

        foreach ($pages as $page) {
            $settings[$page['id']] = false;
        }

        return $this->update_page_widget_settings($settings);
    }

    // Only add CORS headers for our own endpoints
    public function add_cors_headers() {
        add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
            $route = $request->get_route();
            if (strpos($route, '/surefeedback/') !== 0 && strpos($route, '/ph-child/') !== 0) return $served;
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: Content-Type, X-SureFeedback-Token, Authorization, X-WP-Nonce');
            header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');
            header('Access-Control-Max-Age: 600');
            header('Vary: Origin');
            return $served;
        }, 10, 4);
    }
}

// Initialize the REST API
new PH_Child_REST_API();

