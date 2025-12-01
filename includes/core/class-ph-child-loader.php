<?php
/**
 * Plugin Loader and Registry
 *
 * @package SureFeedback Child
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main plugin loader class
 * Handles plugin initialization, dependency loading, and service registration
 */
class PH_Child_Loader {
	
	/**
	 * Plugin instance
	 */
	private static $instance = null;

	/**
	 * Loaded services
	 */
	private $services = array();

	/**
	 * Plugin path
	 */
	private $plugin_path;

	/**
	 * Plugin URL
	 */
	private $plugin_url;

	/**
	 * Get singleton instance
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		$this->plugin_path = plugin_dir_path( dirname( dirname( __FILE__ ) ) );
		$this->plugin_url  = plugin_dir_url( dirname( dirname( __FILE__ ) ) );
		
		$this->load_dependencies();
		$this->init_services();
	}

	/**
	 * Load required files
	 */
	private function load_dependencies() {
		require_once $this->plugin_path . 'includes/core/ph-child-functions.php';

		require_once $this->plugin_path . 'includes/api/class-ph-child-rest-api.php';
		require_once $this->plugin_path . 'includes/admin/class-ph-child-admin-api.php';
	}

	/**
	 * Initialize services
	 */
	private function init_services() {
		if ( class_exists( 'PH_Child_REST_API' ) ) {
			$this->services['rest_api'] = new PH_Child_REST_API();
		}

		if ( class_exists( 'PH_Child_Admin_API' ) ) {
			$this->services['admin_api'] = new PH_Child_Admin_API();
		}
	}

	/**
	 * Get plugin path
	 */
	public function get_plugin_path() {
		return $this->plugin_path;
	}

	/**
	 * Get plugin URL
	 */
	public function get_plugin_url() {
		return $this->plugin_url;
	}

	/**
	 * Get service
	 */
	public function get_service( $service_name ) {
		return isset( $this->services[ $service_name ] ) ? $this->services[ $service_name ] : null;
	}
}