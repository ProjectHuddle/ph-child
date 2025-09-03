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
		add_action( 'admin_post_surefeedback_script_submit', array( $this, 'handle_script_submission' ) );
		add_action( 'admin_post_surefeedback_connection_callback', array( $this, 'handle_surefeedback_callback' ) );
		add_action( 'admin_post_nopriv_surefeedback_connection_callback', array( $this, 'handle_surefeedback_callback' ) );
		
		// Add SureFeedback widget to frontend when connected
		if ( self::is_connected() ) {
			add_action( 'wp_footer', array( $this, 'add_surefeedback_widget' ) );
		}
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
		$script_token = isset( $_GET['script_token'] ) ? sanitize_text_field( wp_unslash( $_GET['script_token'] ) ) : '';

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

		if ( $script_token ) {
			update_option( 'ph_child_script_token', $script_token );
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
		delete_option( 'ph_child_script_token' );

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
		$callback_url = add_query_arg(
			array(
				'action' => 'surefeedback_connection_callback',
				'nonce'  => wp_create_nonce( 'surefeedback-callback' ),
			),
			admin_url( 'admin-post.php' )
		);

		$connect_url = add_query_arg(
			array(
				'source'        => 'wordpress',
				'site_url'      => urlencode( site_url() ),
				'site_name'     => urlencode( get_bloginfo( 'name' ) ),
				'callback_url'  => urlencode( $callback_url ),
				'admin_email'   => urlencode( get_option( 'admin_email' ) ),
			),
			self::get_connect_url()
		);

		return array(
			'connectUrl'    => $connect_url,
			'connectNonce'  => wp_create_nonce( 'surefeedback-connect' ),
			'siteUrl'       => site_url(),
			'siteTitle'     => get_bloginfo( 'name' ),
			'sourceType'    => 'surefeedback-plugin',
			'accessKey'     => get_option( 'ph_child_access_token', '' ),
			'connected'     => self::is_connected(),
			'disconnect_nonce' => wp_create_nonce( 'ph-child-site-disconnect-nonce' ),
			'scriptToken'   => get_option( 'ph_child_script_token', '' ),
			'setupInstructions' => self::get_setup_instructions(),
			'callbackUrl'   => $callback_url,
		);
	}

	/**
	 * Get setup instructions for manual connection
	 * 
	 * @return array Setup instructions
	 */
	public static function get_setup_instructions() {
		return array(
			'step1' => 'Login to your SureFeedback account at app.surefeedback.com/dashboard',
			'step2' => 'Add a new site or project for: ' . site_url(),
			'step3' => 'Copy the integration script provided by SureFeedback',
			'step4' => 'Return here and paste the script to complete the integration',
		);
	}

	/**
	 * Add SureFeedback widget to frontend
	 * 
	 * @return void
	 */
	public function add_surefeedback_widget() {
		// Only load on frontend, not in admin or page builders
		if ( is_admin() || ( isset( $_GET['elementor-preview'] ) ) || ( isset( $_GET['et_fb'] ) ) ) {
			return;
		}
		
		// Get the actual SureFeedback script from options
		$surefeedback_script = get_option( 'ph_child_surefeedback_script', '' );
		
		if ( ! empty( $surefeedback_script ) ) {
			// Output the actual SureFeedback script
			echo "\n<!-- SureFeedback Integration Script -->\n";
			echo wp_kses( $surefeedback_script, array(
				'script' => array(
					'src' => array(),
					'type' => array(),
					'async' => array(),
					'defer' => array(),
					'id' => array(),
					'data-*' => array(),
				),
				'div' => array(
					'id' => array(),
					'class' => array(),
					'data-*' => array(),
				),
			) );
			echo "\n<!-- End SureFeedback Integration Script -->\n";
		} else {
			// Fallback: Show setup reminder
			if ( current_user_can( 'administrator' ) ) {
				?>
				<div style="position:fixed;bottom:20px;right:20px;z-index:9999;background:#f0f0f0;border:1px solid #ccc;padding:10px;border-radius:5px;font-size:12px;max-width:300px;">
					<strong>SureFeedback Setup Required</strong><br>
					Please complete the SureFeedback integration in your WordPress admin.
				</div>
				<?php
			}
		}
	}

	/**
	 * Handle SureFeedback connection callback
	 * 
	 * @return void
	 */
	public function handle_surefeedback_callback() {
		// Verify nonce
		if ( ! isset( $_REQUEST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_REQUEST['nonce'] ) ), 'surefeedback-callback' ) ) {
			wp_die( 'Security check failed.' );
		}

		// Get connection data from SureFeedback
		$connection_data = array(
			'site_id'       => isset( $_REQUEST['site_id'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['site_id'] ) ) : '',
			'api_key'       => isset( $_REQUEST['api_key'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['api_key'] ) ) : '',
			'script_token'  => isset( $_REQUEST['script_token'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['script_token'] ) ) : '',
			'script_url'    => isset( $_REQUEST['script_url'] ) ? esc_url( wp_unslash( $_REQUEST['script_url'] ) ) : '',
			'widget_script' => isset( $_REQUEST['widget_script'] ) ? wp_unslash( $_REQUEST['widget_script'] ) : '',
			'project_name'  => isset( $_REQUEST['project_name'] ) ? sanitize_text_field( wp_unslash( $_REQUEST['project_name'] ) ) : '',
		);

		// Save connection data
		if ( ! empty( $connection_data['site_id'] ) ) {
			update_option( 'ph_child_id', $connection_data['site_id'] );
		}

		if ( ! empty( $connection_data['api_key'] ) ) {
			update_option( 'ph_child_api_key', $connection_data['api_key'] );
		}

		if ( ! empty( $connection_data['script_token'] ) ) {
			update_option( 'ph_child_script_token', $connection_data['script_token'] );
		}

		if ( ! empty( $connection_data['widget_script'] ) ) {
			update_option( 'ph_child_surefeedback_script', $connection_data['widget_script'] );
		}

		// Generate the SureFeedback script automatically if we have the necessary data
		if ( ! empty( $connection_data['script_token'] ) || ! empty( $connection_data['script_url'] ) ) {
			$this->generate_surefeedback_script( $connection_data );
		}

		// Mark as connected
		update_option( 'ph_child_connected', true );
		update_option( 'ph_child_access_token', 'surefeedback-connected-' . time() );

		// Redirect back to WordPress admin with success
		wp_redirect( add_query_arg( 'surefeedback-connected', '1', admin_url( 'admin.php?page=surefeedback' ) ) );
		exit;
	}

	/**
	 * Generate SureFeedback script automatically
	 * 
	 * @param array $connection_data Connection data from SureFeedback
	 * @return void
	 */
	private function generate_surefeedback_script( $connection_data ) {
		$script_parts = array();

		if ( ! empty( $connection_data['widget_script'] ) ) {
			// Use the provided script directly
			$script_parts[] = $connection_data['widget_script'];
		} elseif ( ! empty( $connection_data['script_url'] ) ) {
			// Generate script tag for external script
			$script_parts[] = '<script src="' . esc_url( $connection_data['script_url'] ) . '" async></script>';
		} elseif ( ! empty( $connection_data['script_token'] ) ) {
			// Generate inline script with token
			$script_parts[] = '<script>';
			$script_parts[] = '(function() {';
			$script_parts[] = '  window.SureFeedback = window.SureFeedback || {};';
			$script_parts[] = '  window.SureFeedback.config = {';
			$script_parts[] = '    token: "' . esc_js( $connection_data['script_token'] ) . '",';
			$script_parts[] = '    siteId: "' . esc_js( $connection_data['site_id'] ) . '",';
			$script_parts[] = '    apiKey: "' . esc_js( $connection_data['api_key'] ) . '"';
			$script_parts[] = '  };';
			$script_parts[] = '  var script = document.createElement("script");';
			$script_parts[] = '  script.src = "https://app.surefeedback.com/widget.js";';
			$script_parts[] = '  script.async = true;';
			$script_parts[] = '  document.head.appendChild(script);';
			$script_parts[] = '})();';
			$script_parts[] = '</script>';
		}

		if ( ! empty( $script_parts ) ) {
			$final_script = implode( "\n", $script_parts );
			update_option( 'ph_child_surefeedback_script', $final_script );

			// Optionally, also add to theme functions.php
			$this->add_script_to_functions_php( $final_script );
		}
	}

	/**
	 * Add SureFeedback script to theme's functions.php
	 * 
	 * @param string $script The script to add
	 * @return bool Success or failure
	 */
	private function add_script_to_functions_php( $script ) {
		$theme_functions = get_template_directory() . '/functions.php';
		
		if ( ! file_exists( $theme_functions ) || ! is_writable( $theme_functions ) ) {
			return false;
		}

		$functions_content = file_get_contents( $theme_functions );
		
		// Check if our script is already there
		if ( strpos( $functions_content, 'SureFeedback Integration' ) !== false ) {
			return true; // Already added
		}

		// Create the PHP function to add
		$php_function = "\n\n// SureFeedback Integration - Auto-added by plugin\n";
		$php_function .= "if ( ! function_exists( 'add_surefeedback_widget_to_theme' ) ) {\n";
		$php_function .= "    function add_surefeedback_widget_to_theme() {\n";
		$php_function .= "        if ( is_admin() ) return;\n";
		$php_function .= "        echo '" . addslashes( $script ) . "';\n";
		$php_function .= "    }\n";
		$php_function .= "    add_action( 'wp_footer', 'add_surefeedback_widget_to_theme' );\n";
		$php_function .= "}\n";

		// Add to functions.php
		$updated_content = rtrim( $functions_content, " \t\n\r\0\x0B" );
		if ( substr( $updated_content, -2 ) === '?>' ) {
			// Insert before closing PHP tag
			$updated_content = substr( $updated_content, 0, -2 ) . $php_function . "\n?>";
		} else {
			// Just append
			$updated_content .= $php_function;
		}

		return file_put_contents( $theme_functions, $updated_content ) !== false;
	}

	/**
	 * Handle script submission from admin
	 * 
	 * @return void
	 */
	public function handle_script_submission() {
		// Check if this is a script submission
		if ( ! isset( $_POST['surefeedback_script'] ) || ! isset( $_POST['surefeedback_script_nonce'] ) ) {
			wp_die( 'Missing required fields.' );
		}

		// Verify nonce (using the same nonce as connection)
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['surefeedback_script_nonce'] ) ), 'surefeedback-connect' ) ) {
			wp_die( 'Security check failed.' );
		}

		// Check user permissions
		if ( ! current_user_can( 'administrator' ) ) {
			wp_die( 'Insufficient permissions.' );
		}

		// Get and sanitize the script
		$script = wp_unslash( $_POST['surefeedback_script'] );
		
		// Basic validation - ensure it looks like a script
		if ( strpos( $script, '<script' ) === false && strpos( $script, 'surefeedback' ) === false ) {
			wp_redirect( add_query_arg( 'surefeedback-error', 'invalid-script', admin_url( 'admin.php?page=surefeedback#connect' ) ) );
			exit;
		}

		// Save the script
		update_option( 'ph_child_surefeedback_script', $script );
		update_option( 'ph_child_connected', true );
		update_option( 'ph_child_access_token', 'surefeedback-script-' . time() );

		// Also try to add to functions.php
		$this->add_script_to_functions_php( $script );

		// Redirect with success
		wp_redirect( add_query_arg( 'surefeedback-success', '1', admin_url( 'admin.php?page=surefeedback#connect' ) ) );
		exit;
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
		
		// Use the SureFeedback dashboard with WordPress plugin detection
		return 'https://app.surefeedback.com/dashboard';
	}
}

// Initialize the connection handler
new PH_Child_Connection_Handler();