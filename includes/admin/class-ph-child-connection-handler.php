<?php
/**
 * Connection Handler.
 * 
 * Handles SureFeedback SaaS connection authentication and callback
 * 
 * @package SureFeedback Child
 * @since 1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * PH_Child_Connection_Handler Class
 * 
 * Handles connection authentication with SureFeedback SaaS platform
 * 
 * @since 1.0.0
 */
class PH_Child_Connection_Handler {

	/**
	 * Constructor
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'handle_connection_callback' ) );
		add_action( 'wp_ajax_sf_disconnect', array( $this, 'handle_disconnect' ) );
	}

	/**
	 * Handle SureFeedback connection callback
	 * 
	 * Processes the return from SureFeedback SaaS after authentication
	 * 
	 * @return void
	 */
	public function handle_connection_callback() {
		// Check if this is a SureFeedback connection callback
		if ( ! isset( $_GET['surefeedback-connect-nonce'] ) || ! isset( $_GET['connection-status'] ) ) {
			return;
		}

		// Verify nonce
		$nonce = sanitize_text_field( wp_unslash( $_GET['surefeedback-connect-nonce'] ) );
		if ( false === wp_verify_nonce( $nonce, 'surefeedback-connect' ) ) {
			return;
		}

		// Check user permissions
		if ( false === current_user_can( 'administrator' ) ) {
			return;
		}

		// Get connection parameters
		$connection_status = (bool) sanitize_text_field( wp_unslash( $_GET['connection-status'] ) );
		$access_key = isset( $_GET['surefeedback-access-key'] ) ? sanitize_text_field( wp_unslash( $_GET['surefeedback-access-key'] ) ) : false;
		$connected_email = isset( $_GET['connected_email'] ) ? sanitize_email( wp_unslash( $_GET['connected_email'] ) ) : '';
		$project_id = isset( $_GET['project_id'] ) ? intval( $_GET['project_id'] ) : 0;
		$api_key = isset( $_GET['api_key'] ) ? sanitize_text_field( wp_unslash( $_GET['api_key'] ) ) : '';
		$parent_url = isset( $_GET['parent_url'] ) ? esc_url( wp_unslash( $_GET['parent_url'] ) ) : '';

		// Handle connection denial
		if ( false === $connection_status ) {
			$access_key = 'connection-denied';
		}

		// Save connection data
		if ( $access_key ) {
			update_option( 'ph_child_access_token', $access_key );
		}

		if ( $connected_email ) {
			update_option( 'ph_child_connected_email', $connected_email );
		}

		if ( $project_id > 0 ) {
			update_option( 'ph_child_id', $project_id );
		}

		if ( $api_key ) {
			update_option( 'ph_child_api_key', $api_key );
		}

		if ( $parent_url ) {
			update_option( 'ph_child_parent_url', $parent_url );
		}

		// Mark as installed and connected
		if ( $connection_status && $access_key !== 'connection-denied' ) {
			update_option( 'ph_child_installed', true );
			update_option( 'ph_child_connected', true );
		} else {
			update_option( 'ph_child_connected', false );
		}

		// Redirect to admin page
		$redirect_url = admin_url( 'admin.php?page=surefeedback' );
		if ( $connection_status && $access_key !== 'connection-denied' ) {
			$redirect_url = add_query_arg( 'connection', 'success', $redirect_url );
		} else {
			$redirect_url = add_query_arg( 'connection', 'denied', $redirect_url );
		}

		wp_safe_redirect( $redirect_url );
		exit;
	}

	/**
	 * Handle disconnect request via AJAX
	 * 
	 * @return void
	 */
	public function handle_disconnect() {
		// Verify nonce
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'ph-child-site-disconnect-nonce' ) ) {
			wp_send_json_error( 'Invalid nonce' );
		}

		// Check user permissions
		if ( ! current_user_can( 'administrator' ) ) {
			wp_send_json_error( 'Insufficient permissions' );
		}

		// Clear connection data
		delete_option( 'ph_child_access_token' );
		delete_option( 'ph_child_connected' );
		delete_option( 'ph_child_connected_email' );
		delete_option( 'ph_child_id' );
		delete_option( 'ph_child_api_key' );
		delete_option( 'ph_child_parent_url' );

		wp_send_json_success( 'Disconnected successfully' );
	}

	/**
	 * Get connection status
	 * 
	 * @return bool True if connected, false otherwise
	 */
	public static function is_connected() {
		$access_token = get_option( 'ph_child_access_token', '' );
		$connected = get_option( 'ph_child_connected', false );
		
		return $connected && ! empty( $access_token ) && 'connection-denied' !== $access_token;
	}

	/**
	 * Get connection data for frontend
	 * 
	 * @return array Connection data
	 */
	public static function get_connection_data() {
		return array(
			'connectUrl'    => self::get_connect_url(),
			'connectNonce'  => wp_create_nonce( 'surefeedback-connect' ),
			'siteUrl'       => site_url(),
			'siteTitle'     => get_bloginfo( 'name' ),
			'sourceType'    => 'surefeedback-plugin',
			'accessKey'     => get_option( 'ph_child_access_token', '' ),
			'connected'     => self::is_connected(),
			'disconnect_nonce' => wp_create_nonce( 'ph-child-site-disconnect-nonce' ),
		);
	}

	/**
	 * Get SureFeedback SaaS connection URL
	 * 
	 * @return string Connection URL
	 */
	private static function get_connect_url() {
		// Use environment-specific URL
		if ( defined( 'SUREFEEDBACK_CONNECT_URL' ) ) {
			return SUREFEEDBACK_CONNECT_URL;
		}
		
		// For local development - you may need to adjust this URL
		// to match your actual SureFeedback Laravel instance
		$local_development_url = 'http://127.0.0.1:8001/connect-sf/connect';
		
		// Check if we're in a local environment
		$is_local = in_array( $_SERVER['SERVER_NAME'], array( 'localhost', '127.0.0.1' ) ) 
		           || strpos( $_SERVER['SERVER_NAME'], '.local' ) !== false;
		
		if ( $is_local ) {
			return $local_development_url;
		}
		
		// Production SureFeedback SaaS URL
		return 'https://app.surefeedback.com/connect-sf/connect';
	}
}

// Initialize the connection handler
new PH_Child_Connection_Handler();