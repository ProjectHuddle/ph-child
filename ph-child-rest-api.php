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
        add_action('rest_api_init', array($this, 'allow_cors'));
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
                'callback' => array($this, 'options_response'),
                'permission_callback' => '__return_true',
            )
        ));
    }

    /**
     * Verify API access using the plugin's access token
     */
    public function verify_access(WP_REST_Request $request) {
        $token = $request->get_header('X-SureFeedback-Token');
        
        if (empty($token)) {
            return new WP_Error(
                'rest_forbidden', 
                esc_html__('Access token required', 'ph-child'), 
                array('status' => 401)
            );
        }

        $valid_token = get_option('ph_child_access_token', '');
        
        if (!hash_equals($valid_token, $token)) {
            return new WP_Error(
                'rest_forbidden', 
                esc_html__('Invalid access token', 'ph-child'), 
                array('status' => 403)
            );
        }

        return true;
    }

    /**
     * Get all published pages with optional search
     */
  /**
 * Get all published pages including the main page with optional search
 */
/**
 * Get all published pages including the homepage
 */
public function get_pages(WP_REST_Request $request) {
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

    // Get homepage ID and add homepage (static entry)
    $homepage_id = get_option('page_on_front');
    if ($homepage_id) {
        $homepage = get_post($homepage_id);
        $response[] = array(
            'id'    => $homepage_id,
            'title' => esc_html(get_the_title($homepage_id)),
            'url'   => esc_url(get_permalink($homepage_id)),
        );
    } else {
        // Fallback if no static page set
        $response[] = array(
            'id'    => 0,
            'title' => 'Site Homepage',
            'url'   => esc_url(home_url('/')),
        );
    }

    // Add other pages, but skip homepage if already included
    foreach ($pages as $page) {
        if ($page->ID == $homepage_id) {
            continue; // Already added above
        }
        $response[] = array(
            'id'    => $page->ID,
            'title' => esc_html($page->post_title),
            'url'   => esc_url(get_permalink($page->ID)),
        );
    }

    return rest_ensure_response($response);
}

    /**
     * Allow CORS for all origins with token authentication
     */
    public function allow_cors() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', array($this, 'cors_headers'));
    }
    
    /**
     * Add CORS headers that allow all origins
     */
    public static function cors_headers($value) {
        $origin = !empty($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
        
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Content-Type, X-SureFeedback-Token, Authorization, X-WP-Nonce');
        header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');
        header('Access-Control-Max-Age: 600');
        header('Vary: Origin');
        
        if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
        
        return $value;
    }
    
    /**
     * Handle OPTIONS requests for preflight
     */
    public function options_response() {
        $response = new WP_REST_Response();
        $response->header('Access-Control-Allow-Origin', '*');
        $response->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, X-SureFeedback-Token, Authorization');
        return $response;
    }
}

// Initialize the REST API
new PH_Child_REST_API();
