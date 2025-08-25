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
	 * Plugins List
	 *
	 * @var get_bsf_plugins_list
	 */
	private static $get_bsf_plugins_list = null;

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

        register_rest_route(
			'surefeedback/v1',
			'/plugins',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_plugins_list' ],
				'permission_callback' => array($this, 'verify_access'),
			]
		);
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
            if (strpos($route, '/surefeedback/') !== 0) return $served;
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

    /**
	 * Callback function to return plugins list.
	 *
	 * @param WP_REST_Request $request Request object.
	 * @return WP_REST_Response
	 */
	public function get_plugins_list( $request ) {
		// Fetch branding settings.
		$plugins_list = get_bsf_plugins_list();

		if ( ! is_array( $plugins_list ) ) {
			return new WP_REST_Response( [ 'message' => __( 'Plugins list not found', 'ph-child' ) ], 404 );
		}

		return new WP_REST_Response( $plugins_list, 200 );
	}

    /**
	 * Provide General settings array().
	 *
	 * @since 2.2.1
	 * @return array()
	 */
	public static function get_bsf_plugins_list() {

		if ( ! isset( self::$get_bsf_plugins_list ) ) {
			self::$get_bsf_plugins_list = get_bsf_plugins();
		}
		return self::$get_bsf_plugins_list;
	}
}

// Initialize the REST API
new PH_Child_REST_API();
