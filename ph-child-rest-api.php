<?php
/**
 * REST API functionality for SureFeedback Client Site
 * Allows all origins but requires X-SureFeedback-Token
 */

if (!defined('ABSPATH')) {
    exit;
}

class PH_Child_REST_API {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_filter('rest_pre_serve_request', array($this, 'cors_headers_for_surefeedback'), 15, 4);
    }

    public function register_routes() {
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

        $homepage_id = get_option('page_on_front');
        if ($homepage_id) {
            $homepage = get_post($homepage_id);
            $response[] = array(
                'id'    => $homepage_id,
                'title' => esc_html(get_the_title($homepage_id)),
                'url'   => esc_url(get_permalink($homepage_id)),
            );
        } else {
            $response[] = array(
                'id'    => 0,
                'title' => 'Site Homepage',
                'url'   => esc_url(home_url('/')),
            );
        }

        foreach ($pages as $page) {
            if ($page->ID == $homepage_id) {
                continue;
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
     * Add CORS headers only for SureFeedback API routes
     */
    public function cors_headers_for_surefeedback($served, $result, $request, $server) {
        if (strpos($request->get_route(), '/surefeedback/v1/') !== false) {
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Credentials: true");
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
            header("Access-Control-Allow-Headers: Content-Type, X-SureFeedback-Token, Authorization, X-WP-Nonce");
            header("Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages");
            header("Access-Control-Max-Age: 600");
            header("Vary: Origin");
        }
        return $served;
    }

    /**
     * Handle OPTIONS requests only for SureFeedback routes
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
