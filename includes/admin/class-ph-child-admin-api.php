<?php
/**
 * Admin API endpoints for Vue.js frontend
 *
 * @package SureFeedback Child
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'PH_Child_Admin_API' ) ) :
	/**
	 * Admin API Class for handling Vue.js frontend requests
	 */
	class PH_Child_Admin_API {
		
		/**
		 * Constructor
		 */
		public function __construct() {
			add_action( 'rest_api_init', array( $this, 'register_admin_routes' ) );
		}

		/**
		 * Register admin REST API routes
		 */
		public function register_admin_routes() {
			register_rest_route(
				'surefeedback/v1',
				'/settings',
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_settings' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
				)
			);

			register_rest_route(
				'surefeedback/v1',
				'/settings/general',
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_general_settings' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
					'args'                => array(
						'ph_child_role_can_comment' => array(
							'type'              => 'array',
							'items'             => array( 'type' => 'string' ),
							'sanitize_callback' => array( $this, 'sanitize_roles' ),
						),
						'ph_child_guest_comments_enabled' => array(
							'type'              => 'boolean',
							'sanitize_callback' => 'rest_sanitize_boolean',
						),
						'ph_child_admin' => array(
							'type'              => 'boolean',
							'sanitize_callback' => 'rest_sanitize_boolean',
						),
					),
				)
			);

			register_rest_route(
				'surefeedback/v1',
				'/settings/connection',
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_connection_settings' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
					'args'                => array(
						'ph_child_id' => array(
							'type'              => array( 'integer', 'string' ),
							'sanitize_callback' => array( $this, 'sanitize_project_id' ),
						),
						'ph_child_api_key' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'ph_child_access_token' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'ph_child_parent_url' => array(
							'type'              => 'string',
							'sanitize_callback' => 'esc_url_raw',
						),
						'ph_child_signature' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				)
			);

			register_rest_route(
				'surefeedback/v1',
				'/settings/white-label',
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'save_white_label_settings' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
					'args'                => array(
						'ph_child_plugin_name' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'ph_child_plugin_description' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_textarea_field',
						),
						'ph_child_plugin_author' => array(
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
						),
						'ph_child_plugin_author_url' => array(
							'type'              => 'string',
							'sanitize_callback' => 'esc_url_raw',
						),
						'ph_child_plugin_link' => array(
							'type'              => 'string',
							'sanitize_callback' => 'esc_url_raw',
						),
					),
				)
			);

			register_rest_route(
				'surefeedback/v1',
				'/settings/manual-import',
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'manual_import' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
					'args'                => array(
						'parent_url' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'esc_url_raw',
						),
						'project_id' => array(
							'type'              => 'integer',
							'required'          => true,
							'sanitize_callback' => 'intval',
						),
						'api_key' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'access_token' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
						'signature' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				)
			);

			register_rest_route(
				'surefeedback/v1',
				'/settings/test-connection',
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'test_connection' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
					'args'                => array(
						'parent_url' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'esc_url_raw',
						),
						'access_token' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				)
			);

			register_rest_route(
				'surefeedback/v1',
				'/plugin-status',
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_plugin_status' ),
					'permission_callback' => array( $this, 'check_admin_permissions' ),
				)
			);
		}

		/**
		 * Check admin permissions
		 */
		public function check_admin_permissions() {
			return current_user_can( 'manage_options' );
		}

		/**
		 * Get all settings
		 */
		public function get_settings( $request ) {
			$general_settings = array(
				'ph_child_role_can_comment'        => get_option( 'ph_child_role_can_comment', array() ),
				'ph_child_guest_comments_enabled'  => (bool) get_option( 'ph_child_guest_comments_enabled', false ),
				'ph_child_admin'                   => (bool) get_option( 'ph_child_admin', false ),
			);

			$connection_settings = array(
				'ph_child_id'           => get_option( 'ph_child_id', '' ),
				'ph_child_api_key'      => get_option( 'ph_child_api_key', '' ),
				'ph_child_access_token' => get_option( 'ph_child_access_token', '' ),
				'ph_child_parent_url'   => get_option( 'ph_child_parent_url', '' ),
				'ph_child_signature'    => get_option( 'ph_child_signature', '' ),
				'ph_child_installed'    => (bool) get_option( 'ph_child_installed', false ),
			);

			$white_label_settings = array(
				'ph_child_plugin_name'        => get_option( 'ph_child_plugin_name', '' ),
				'ph_child_plugin_description' => get_option( 'ph_child_plugin_description', '' ),
				'ph_child_plugin_author'      => get_option( 'ph_child_plugin_author', '' ),
				'ph_child_plugin_author_url'  => get_option( 'ph_child_plugin_author_url', '' ),
				'ph_child_plugin_link'        => get_option( 'ph_child_plugin_link', '' ),
			);

			$connection_status = $this->get_connection_status();
			$available_roles   = $this->get_available_roles();

			return rest_ensure_response(
				array(
					'success' => true,
					'data'    => array(
						'general'          => $general_settings,
						'connection'       => $connection_settings,
						'whiteLabel'       => $white_label_settings,
						'connectionStatus' => $connection_status,
						'availableRoles'   => $available_roles,
					),
				)
			);
		}

		/**
		 * Save general settings
		 */
		public function save_general_settings( $request ) {
			$params = $request->get_params();

			$updated = 0;

			if ( isset( $params['ph_child_role_can_comment'] ) ) {
				update_option( 'ph_child_role_can_comment', $params['ph_child_role_can_comment'] );
				$updated++;
			}

			if ( isset( $params['ph_child_guest_comments_enabled'] ) ) {
				update_option( 'ph_child_guest_comments_enabled', $params['ph_child_guest_comments_enabled'] );
				$updated++;
			}

			if ( isset( $params['ph_child_admin'] ) ) {
				update_option( 'ph_child_admin', $params['ph_child_admin'] );
				$updated++;
			}

			return rest_ensure_response(
				array(
					'success' => true,
					'message' => sprintf( 'Updated %d settings.', $updated ),
				)
			);
		}

		/**
		 * Save connection settings
		 */
		public function save_connection_settings( $request ) {
			$params = $request->get_params();

			$updated = 0;

			foreach ( $params as $key => $value ) {
				if ( strpos( $key, 'ph_child_' ) === 0 ) {
					update_option( $key, $value );
					$updated++;
				}
			}

			$connection_status = $this->get_connection_status();

			return rest_ensure_response(
				array(
					'success' => true,
					'message' => sprintf( 'Updated %d settings.', $updated ),
					'data'    => array(
						'connectionStatus' => $connection_status,
					),
				)
			);
		}

		/**
		 * Save white label settings
		 */
		public function save_white_label_settings( $request ) {
			$params = $request->get_params();

			$updated = 0;

			foreach ( $params as $key => $value ) {
				if ( strpos( $key, 'ph_child_plugin_' ) === 0 ) {
					update_option( $key, $value );
					$updated++;
				}
			}

			return rest_ensure_response(
				array(
					'success' => true,
					'message' => sprintf( 'Updated %d settings.', $updated ),
				)
			);
		}

		/**
		 * Manual import settings
		 */
		public function manual_import( $request ) {
			$params = $request->get_params();

			// Validate required fields
			$required_fields = array( 'parent_url', 'project_id', 'api_key', 'access_token', 'signature' );
			foreach ( $required_fields as $field ) {
				if ( empty( $params[ $field ] ) ) {
					return new WP_Error(
						'missing_field',
						sprintf( 'Missing required field: %s', $field ),
						array( 'status' => 400 )
					);
				}
			}

			// Save connection settings
			update_option( 'ph_child_parent_url', $params['parent_url'] );
			update_option( 'ph_child_id', intval( $params['project_id'] ) );
			update_option( 'ph_child_api_key', $params['api_key'] );
			update_option( 'ph_child_access_token', $params['access_token'] );
			update_option( 'ph_child_signature', $params['signature'] );
			update_option( 'ph_child_installed', true );

			$connection_status = $this->get_connection_status();

			return rest_ensure_response(
				array(
					'success' => true,
					'message' => 'Settings imported successfully.',
					'data'    => array(
						'connectionStatus' => $connection_status,
					),
				)
			);
		}

		/**
		 * Test connection to parent site
		 */
		public function test_connection( $request ) {
			$params     = $request->get_params();
			$parent_url = $params['parent_url'];
			$token      = $params['access_token'];

			// Simple connection test - try to reach the parent URL
			$response = wp_remote_get(
				$parent_url,
				array(
					'timeout'     => 10,
					'headers'     => array(
						'X-SureFeedback-Token' => $token,
					),
					'sslverify'   => true,
				)
			);

			if ( is_wp_error( $response ) ) {
				return new WP_Error(
					'connection_failed',
					sprintf( 'Connection failed: %s', $response->get_error_message() ),
					array( 'status' => 500 )
				);
			}

			$response_code = wp_remote_retrieve_response_code( $response );
			
			$status = array(
				'connected'     => $response_code < 400,
				'response_code' => $response_code,
				'last_verified' => current_time( 'mysql' ),
			);

			return rest_ensure_response(
				array(
					'success' => true,
					'data'    => $status,
				)
			);
		}

		/**
		 * Get connection status
		 */
		private function get_connection_status() {
			$parent_url    = get_option( 'ph_child_parent_url', '' );
			$site_id       = get_option( 'ph_child_id', '' );
			$access_token  = get_option( 'ph_child_access_token', '' );
			$api_key       = get_option( 'ph_child_api_key', '' );
			$signature     = get_option( 'ph_child_signature', '' );
			$is_installed  = (bool) get_option( 'ph_child_installed', false );

			$is_connected = ! empty( $parent_url ) && ! empty( $site_id ) && ! empty( $access_token );

			return array(
				'connected'     => $is_connected,
				'parent_url'    => $parent_url,
				'site_id'       => $site_id,
				'has_api_key'   => ! empty( $api_key ),
				'has_token'     => ! empty( $access_token ),
				'has_signature' => ! empty( $signature ),
				'installed'     => $is_installed,
				'dashboard_url' => $is_connected ? $parent_url . '/wp-admin/post.php?post=' . $site_id . '&action=edit' : '',
			);
		}

		

		/**
		 * Get available WordPress roles
		 */
		private function get_available_roles() {
			global $wp_roles;

			if ( ! isset( $wp_roles ) ) {
				$wp_roles = new WP_Roles();
			}

			$roles = array();
			$selected_roles = get_option( 'ph_child_role_can_comment', array() );

			foreach ( $wp_roles->roles as $role_key => $role_data ) {
				$roles[] = array(
					'name'     => $role_key,
					'label'    => $role_data['name'],
					'selected' => in_array( $role_key, $selected_roles, true ),
				);
			}

			return $roles;
		}

		/**
		 * Sanitize roles array
		 */
		public function sanitize_roles( $roles ) {
			if ( ! is_array( $roles ) ) {
				return array();
			}

			// Ensure the function is available
			if ( ! function_exists( 'get_editable_roles' ) ) {
				require_once ABSPATH . 'wp-admin/includes/user.php';
			}

			$valid_roles = array_keys( get_editable_roles() );
			return array_intersect( $roles, $valid_roles );
		}

		/**
		 * Sanitize project ID
		 */
		public function sanitize_project_id( $value ) {
			if ( is_numeric( $value ) && $value > 0 ) {
				return intval( $value );
			}
			return '';
		}

		/**
		 * Get plugin status for recommendations
		 */
		public function get_plugin_status( $request ) {
			// Include required WordPress files
			if ( ! function_exists( 'get_plugins' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}

			$plugin_list = array(
				'surerank/surerank.php',
				'surecart/surecart.php', 
				'sureforms/sureforms.php',
				'presto-player/presto-player.php',
				'suretriggers/suretriggers.php'
			);

			$status_map = array();
			$installed_plugins = get_plugins();

			foreach ( $plugin_list as $plugin ) {
				if ( ! isset( $installed_plugins[ $plugin ] ) ) {
					$status_map[ $plugin ] = 'Install';
				} elseif ( is_plugin_active( $plugin ) ) {
					$status_map[ $plugin ] = 'Activated';
				} else {
					$status_map[ $plugin ] = 'Installed';
				}
			}

			return rest_ensure_response( $status_map );
		}
	}
endif;