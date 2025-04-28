<?php
/**
 * REST API functionality for SureFeedback Client Site
 */

 if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class PH_Child_REST_API {
    /**
     * Initialize REST API routes
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register custom REST API routes
     */
    public function register_routes() {
        register_rest_route( 'surefeedback/v1', '/pages', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_pages' ),
            'permission_callback' => array( $this, 'verify_access' )
        ) );
    }

    /**
     * Verify API access using the plugin's access token
     */
    public function verify_access( WP_REST_Request $request ) {
        $token = $request->get_header( 'X-SureFeedback-Token' );
        
        if ( empty( $token ) ) {
            return new WP_Error( 'rest_forbidden', esc_html__( 'Access token required', 'ph-child' ), array( 'status' => 401 ) );
        }

        $valid_token = get_option( 'ph_child_access_token', '' );
        
        if ( $token !== $valid_token ) {
            return new WP_Error( 'rest_forbidden', esc_html__( 'Invalid access token', 'ph-child' ), array( 'status' => 403 ) );
        }

        return true;
    }

    /**
     * Get all published pages
     */
    public function get_pages( WP_REST_Request $request ) {
        $args = array(
            'post_type'      => 'page',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC'
        );

        $pages = get_posts( $args );
        
        $response = array();
        foreach ( $pages as $page ) {
            $response[] = array(
                'id'        => $page->ID,
                'title'     => $page->post_title,
                'url'       => get_permalink( $page->ID ),
            );
        }

        return rest_ensure_response( $response );
    }
}

// Initialize the REST API
new PH_Child_REST_API();