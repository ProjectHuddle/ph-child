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

        if (empty($access_token)) {
            return new WP_Error('rest_invalid_param', __('Access token is required', 'ph-child'), array('status' => 400));
        }

        // Store bearer token
        update_option('ph_child_bearer_token', $access_token);
        
        // Store connection metadata
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

