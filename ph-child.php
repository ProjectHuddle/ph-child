<?php
/**
 * Plugin Name: SureFeedback Client Site
 * Plugin URI: http://surefeedback.com
 * Description: Collect note-style feedback from your client’s websites and sync them with your SureFeedback parent project.
 * Author: Brainstorm Force
 * Author URI: https://www.brainstormforce.com
 * Version: 1.2.10
 *
 * Requires at least: 4.7
 * Tested up to: 6.8
 *
 * Text Domain: ph-child
 * Domain Path: languages
 *
 * @package SureFeedback Child
 * @author Brainstorm Force, Andre Gagnon
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Setup Constants before init because we're running plugin on plugins_loaded
 *
 * @since 1.0.0
 */

if ( ! defined( 'PH_CHILD_PLUGIN_DIR' ) ) {
	define( 'PH_CHILD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'PH_CHILD_PLUGIN_URL' ) ) {
	define( 'PH_CHILD_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

if ( ! defined( 'PH_CHILD_PLUGIN_FILE' ) ) {
	define( 'PH_CHILD_PLUGIN_FILE', __FILE__ );
}

		require_once 'includes/core/class-ph-child-loader.php';

		require_once PH_CHILD_PLUGIN_DIR . 'includes/api/dashboard-api.php';


if ( ! class_exists( 'PH_Child' ) ) :
	/**
	 * Main PH_Child Class
	 * Uses singleton design pattern
	 *
	 * @since 1.0.0
	 */
	final class PH_Child {


		/**
		 * Make sure to whitelist our option names
		 *
		 * @var array
		 */
		protected $whitelist_option_names = array();

		/**
		 * Get option descriptions (translated)
		 * 
		 * @return array
		 */
		protected function get_option_descriptions() {
			return array(
				'ph_child_id'           => __( 'Website project ID.', 'ph-child' ),
				'ph_child_api_key'      => __( 'Public API key for the script loader.', 'ph-child' ),
				'ph_child_access_token' => __( 'Access token to verify access to be able to register and leave comments.', 'ph-child' ),
				'ph_child_parent_url'   => __( 'Parent Site URL.', 'ph-child' ),
				'ph_child_signature'    => __( 'Secret signature to verify identity.', 'ph-child' ),
				'ph_child_installed'    => __( 'Is the plugin installed?', 'ph-child' ),
			);
		}

		/**
		 * Get things going
		 */
		public function __construct() {
			if ( defined( 'PH_VERSION' ) ) {
				add_action( 'admin_notices', array( $this, 'parent_plugin_activated_error_notice' ) );
				return;
			}

			$this->whitelist_option_names = array(
				'ph_child_id'           => array(
					'description_key'   => 'ph_child_id',
					'sanitize_callback' => 'intval',
				),
				'ph_child_api_key'      => array(
					'description_key'   => 'ph_child_api_key',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'ph_child_access_token' => array(
					'description_key'   => 'ph_child_access_token',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'ph_child_parent_url'   => array(
					'description_key'   => 'ph_child_parent_url',
					'sanitize_callback' => 'esc_url',
				),
				'ph_child_signature'    => array(
					'description_key'   => 'ph_child_signature',
					'sanitize_callback' => 'sanitize_text_field',
				),
				'ph_child_installed'    => array(
					'description_key'   => 'ph_child_installed',
					'sanitize_callback' => 'boolval',
				),
			);

			add_action( 'admin_init', array( $this, 'options' ) );
			add_action( 'admin_menu', array( $this, 'create_menu' ) );

			add_action( 'admin_init', array( $this, 'ph_custom_inline_script' ) );

			add_action( 'wp_footer', array( $this, 'ph_user_data' ) );

			if ( ! is_admin() ) {
				add_action( 'wp_footer', array( $this, 'script' ) );
			}
			if ( get_option( 'ph_child_admin', false ) ) {
				add_action( 'admin_footer', array( $this, 'script' ) );
			}

			add_filter( 'xmlrpc_blog_options', array( $this, 'whitelist_option' ) );

			add_action( 'admin_init', array( $this, 'maybe_disconnect' ) );

			add_filter( 'removable_query_args', array( $this, 'remove_disconnect_args' ) );

			register_activation_hook( PH_CHILD_PLUGIN_FILE, array( $this, 'register_installation' ) );
			register_deactivation_hook( PH_CHILD_PLUGIN_FILE, array( $this, 'deregister_installation' ) );

			add_action( 'activated_plugin', array( $this, 'redirect_options_page' ) );

			add_filter( 'plugin_action_links_' . plugin_basename( PH_CHILD_PLUGIN_FILE ), array( $this, 'add_settings_link' ) );

			global $pagenow;
			if ( is_admin() && 'plugins.php' === $pagenow ) {
				add_filter( 'gettext', array( $this, 'white_label' ), 20, 3 );
				add_filter( 'plugin_row_meta', array( $this, 'white_label_link' ), 10, 4 );
			}

			add_filter( 'ph_script_should_start_loading', array( $this, 'compatiblity_blacklist' ) );
		}

		/**
		 * Checks compatibility blacklist.
		 *
		 * @param string $load Specifies if script should start loading.
		 *
		 * @return bool|string
		 */
		public function compatiblity_blacklist( $load ) {
			$disabled = apply_filters(
				'ph_disable_for_query_vars',
				array(
					'et_fb',
					'elementor-preview',
					'fl_builder',
					'fl_builder_preview',
					'builder',
					'fb-edit',
				)
			);

			if ( ! empty( $_GET ) && is_array( $_GET ) ) {
				foreach ( $_GET as $arg => $_ ) {
					if ( in_array( $arg, $disabled ) ) {
						return false;
					}
				}
			}

			if ( isset( $_GET['ct_builder'] ) ) {
				return false;
				if ( ! get_option( 'ph_child_admin', false ) ) {
					return false;
				}
				if ( ! isset( $_GET['oxygen_iframe'] ) ) {
					return false;
				}
			}

			return $load;
		}

		/**
		 * Show parent plugin activation notice.
		 *
		 * @return void
		 */
		public function parent_plugin_activated_error_notice() {
			$message = __( 'You have both the client site and SureFeedback core plugins activated. You must only activate the client site on a client site, and SureFeedback on your main site.', 'ph-child' );
			echo '<div class="error"> <p>' . esc_html( $message ) . '</p></div>';
		}

		/**
		 * Show white label link.
		 *
		 * @param string $plugin_meta Specifies Plugin meta data.
		 * @param string $plugin_file Specifies Plugin file.
		 * @param string $plugin_data Specifies Plugin data.
		 * @param string $status Specifies Plugin status.
		 *
		 * @return string
		 */
		public function white_label_link( $plugin_meta, $plugin_file, $plugin_data, $status ) {
			global $pagenow;
			if ( ! is_admin() || 'plugins.php' !== $pagenow ) {
				return $plugin_meta;
			}
			if ( ! isset( $plugin_data['slug'] ) ) {
				return $plugin_meta;
			}
			if ( 'projecthuddle-child-site' === $plugin_data['slug'] ) {
				$link       = get_option( 'ph_child_plugin_link', '' );
				$author     = get_option( 'ph_child_plugin_author', '' );
				$author_url = get_option( 'ph_child_plugin_author_url', '' );
				if ( $link ) {
					$plugin_meta[2] = '<a href="' . esc_url( $link ) . '" target="_blank">' . esc_html__( 'Visit plugin site', 'ph-child' ) . '</a>';
				}

				if ( $author && $author_url ) {
					$plugin_meta[1] = '<a href="' . esc_url( $author_url ) . '" target="_blank">' . esc_html( $author ) . '</a>';
				}
			}
			return $plugin_meta;
		}

		/**
		 * Apply white label.
		 *
		 * @param string $translated_text White label translated text.
		 * @param string $untranslated_text White label untranslated text.
		 * @param string $domain Plugin domain name.
		 *
		 * @return mixed
		 */
		public function white_label( $translated_text, $untranslated_text, $domain ) {
			global $pagenow;
			if ( ! is_admin() || 'plugins.php' !== $pagenow ) {
				return $translated_text;
			}
			if ( 'ph-child' === $domain ) {
				switch ( $untranslated_text ) {
					case 'SureFeedback Client Site':
						$name = get_option( 'ph_child_plugin_name', false );
						if ( $name ) {
							$translated_text = $name;
						}
						break;
					case 'Collect note-style feedback from your client\'s websites and sync them with your SureFeedback parent project.':
						$description = get_option( 'ph_child_plugin_description', false );
						if ( $description ) {
							$translated_text = $description;
						}
						break;
					case 'Brainstorm Force':
						$author = get_option( 'ph_child_plugin_author', false );
						if ( $author ) {
							$translated_text = $author;
						}
						break;
				}
			}

			return $translated_text;
		}

		/**
		 * Add settings link to plugin list table
		 *
		 * @param  array $links Existing links.
		 *
		 * @since 1.0.0
		 * @return array        Modified links
		 */
		public function add_settings_link( $links ) {
			$settings_link = '<a href="' . admin_url( 'options-general.php?page=feedback-connection-options' ) . '">' . __( 'Settings', 'ph-child' ) . '</a>';
			array_push( $links, $settings_link );
			return $links;
		}

		/**
		 * Make sure these are automatically removed after save
		 *
		 * @param array $args Passes disconnect args.
		 *
		 * @return array
		 */
		public function remove_disconnect_args( $args ) {
			array_push( $args, 'ph-child-site-disconnect-nonce' );
			array_push( $args, 'ph-child-site-disconnect' );
			return $args;
		}

		/**
		 * Maybe disconnect from parent site
		 *
		 * @return void
		 */
		public function maybe_disconnect() {
			if ( ! isset( $_GET['ph-child-site-disconnect'] ) ) {
				return;
			}

			if ( ! isset( $_GET['ph-child-site-disconnect-nonce'] ) || ! wp_verify_nonce( $_GET['ph-child-site-disconnect-nonce'], 'ph-child-site-disconnect-nonce' ) ) {
				wp_die( 'That\'s not allowed' );
			}

			foreach ( $this->whitelist_option_names as $name => $items ) {
				delete_option( $name );
			}

			wp_redirect( admin_url( 'options-general.php?page=feedback-connection-options&tab=connection' ) );
		}

		/**
		 * Redirect to options page.
		 *
		 * @param string $plugin Plugin name.
		 *
		 * @return void
		 */
		public function redirect_options_page( $plugin ) {
			if ( plugin_basename( __FILE__ ) == $plugin ) {
				exit( wp_redirect( admin_url( 'options-general.php?page=feedback-connection-options&tab=connection' ) ) );
			}
		}

		/**
		 * Add option for when plugin is active
		 *
		 * @return void
		 */
		public function register_installation() {
			update_option( 'ph_child_installed', true );
		}

		/**
		 * Delete option when deactivated
		 *
		 * @return void
		 */
		public function deregister_installation() {
			delete_option( 'ph_child_installed' );
		}

		/**
		 * Whitelist our option in xmlrpc
		 *
		 * @param array $options whitelabel options.
		 *
		 * @return array
		 */
		public function whitelist_option( $options ) {
			$descriptions = $this->get_option_descriptions();
			foreach ( $this->whitelist_option_names as $name => $item ) {
				$description = isset( $descriptions[ $name ] ) ? $descriptions[ $name ] : '';
				$options[ $name ] = array(
					'desc'     => esc_html( $description ),
					'readonly' => false,
					'option'   => $name,
				);
			}

			return $options;
		}

		/**
		 * Create Menu
		 *
		 * @return void
		 */
		public function create_menu() {
			$plugin_name = get_option( 'ph_child_plugin_name', false );
			$menu_title = $plugin_name ? esc_html( $plugin_name ) : __( 'SureFeedback', 'ph-child' );
			$menu_icon = PH_CHILD_PLUGIN_URL . 'assets/images/settings/surefeedback-icon.svg';

			$connection_type = get_option( 'ph_child_connection_type_preference', 'none' );

			add_menu_page(
				__( 'SureFeedback', 'ph-child' ),
				$menu_title,
				'manage_options',
				'feedback-connection-options',
				array( $this, 'options_page' ),
				$menu_icon,
				30
			);

			add_submenu_page(
				'feedback-connection-options',
				__( 'Connection', 'ph-child' ),
				__( 'Connection', 'ph-child' ),
				'manage_options',
				'feedback-connection-options',
				array( $this, 'options_page' )
			);

			if ( $connection_type === 'plugin' ) {
				add_submenu_page(
					'feedback-connection-options',
					__( 'Settings', 'ph-child' ),
					__( 'Settings', 'ph-child' ),
					'manage_options',
					'feedback-settings',
					array( $this, 'settings_page' )
				);

				add_submenu_page(
					'feedback-connection-options',
					__( 'White Label', 'ph-child' ),
					__( 'White Label', 'ph-child' ),
					'manage_options',
					'feedback-white-label',
					array( $this, 'white_label_page' )
				);
			} else {
				add_submenu_page(
					'feedback-connection-options',
					__( 'Widget Control', 'ph-child' ),
					__( 'Widget Control', 'ph-child' ),
					'manage_options',
					'feedback-widget-control',
					array( $this, 'widget_control_page' )
				);

				add_submenu_page(
					'feedback-connection-options',
					__( 'Settings', 'ph-child' ),
					__( 'Settings', 'ph-child' ),
					'manage_options',
					'feedback-settings',
					array( $this, 'settings_page' )
				);
			}

			add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ), 100 );
		}

		/**
		 * Enqueue admin assets
		 *
		 * @since 1.2.10
		 *
		 * @param string $hook Current admin page hook.
		 */
		public function enqueue_assets( $hook ) {
			$plugin_pages = array(
				'toplevel_page_feedback-connection-options',
				'surefeedback_page_feedback-connection-options',
				'surefeedback_page_feedback-widget-control',
				'surefeedback_page_feedback-settings',
				'surefeedback_page_feedback-white-label',
			);

			if ( ! in_array( $hook, $plugin_pages, true ) ) {
				return;
			}

			$plugin_version = '1.2.10';
			if ( ! function_exists( 'get_plugin_data' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}
			$plugin_data = get_plugin_data( PH_CHILD_PLUGIN_FILE );
			if ( ! empty( $plugin_data['Version'] ) ) {
				$plugin_version = $plugin_data['Version'];
			}

			wp_enqueue_style(
				'ph-child-figtree-font',
				'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap',
				array(),
				null
			);

			$tailwind_css = PH_CHILD_PLUGIN_URL . 'assets/css/tailwind.css';
			if ( file_exists( PH_CHILD_PLUGIN_DIR . 'assets/css/tailwind.css' ) ) {
				wp_enqueue_style(
					'ph-child-tailwind',
					$tailwind_css,
					array(),
					$plugin_version
				);
			}

			$admin_css = PH_CHILD_PLUGIN_URL . 'assets/css/admin.css';
			if ( file_exists( PH_CHILD_PLUGIN_DIR . 'assets/css/admin.css' ) ) {
				wp_enqueue_style(
					'ph-child-admin',
					$admin_css,
					array(),
					$plugin_version
				);
			}

			wp_enqueue_script(
				'ph-child-admin',
				PH_CHILD_PLUGIN_URL . 'assets/js/admin.js',
				array(),
				$plugin_version,
				true
			);

			// Check for SUREFEEDBACK_ constants first (new naming), then PH_CHILD_ (legacy), then default
			if ( defined( 'SUREFEEDBACK_API_BASE_URL' ) ) {
				$api_base_url = SUREFEEDBACK_API_BASE_URL;
				// Append /api/v1 if not already present
				if ( strpos( $api_base_url, '/api/v1' ) === false ) {
					$api_base_url = rtrim( $api_base_url, '/' ) . '/api/v1';
				}
			} elseif ( defined( 'PH_CHILD_API_BASE_URL' ) ) {
				$api_base_url = PH_CHILD_API_BASE_URL;
				// Append /api/v1 if not already present
				if ( strpos( $api_base_url, '/api/v1' ) === false ) {
					$api_base_url = rtrim( $api_base_url, '/' ) . '/api/v1';
				}
			} else {
				$api_base_url = 'https://api.surefeedback.com/api/v1';
			}
			
			if ( defined( 'SUREFEEDBACK_APP_BASE_URL' ) ) {
				$app_base_url = SUREFEEDBACK_APP_BASE_URL;
			} elseif ( defined( 'PH_CHILD_APP_BASE_URL' ) ) {
				$app_base_url = PH_CHILD_APP_BASE_URL;
			} else {
				$app_base_url = 'https://app.surefeedback.com';
			}

			$is_legacy_connection = $this->is_legacy_connection();
			$is_saas_connection   = $this->is_saas_connection();

			$connection_type_preference = get_option( 'ph_child_connection_type_preference', '' );

			$bearer_token = get_option( 'ph_child_bearer_token', '' );
			$is_saas_authenticated = ! empty( $bearer_token );

			$plugin_url = PH_CHILD_PLUGIN_URL;
			$images_path = $plugin_url . 'assets/images/settings/';

			$localized_data = array(
				'ajaxUrl'      => admin_url( 'admin-ajax.php' ),
				'restUrl'      => rest_url( 'ph-child/v1' ),
				'nonce'        => wp_create_nonce( 'wp_rest' ),
				'adminUrl'     => admin_url( 'admin.php' ),
				'siteUrl'      => home_url(),
				'pluginUrl'    => $plugin_url,
				'currentPage'  => $hook,
				'apiBaseUrl'   => $api_base_url,
				'appBaseUrl'   => $app_base_url,
				'projectId'    => get_option( 'ph_child_project_id', '' ),
				'version'      => $plugin_version,
				'connectionTypePreference' => $connection_type_preference,
				'isSaaSAuthenticated' => $is_saas_authenticated,
				'bearerToken'  => $is_saas_authenticated ? $bearer_token : '',
				'surefeedback_icon' => $images_path . 'surefeedback-icon.svg',
				'welcome_background' => $images_path . 'welcome_background.png',
				'welcome' => $images_path . 'welcome.png',
				'thumbs' => $images_path . 'thumbs.svg',
				'rocket' => $images_path . 'rocket.svg',
				'admin' => $images_path . 'admin.svg',
				'docs' => $images_path . 'docs.svg',
				'footer' => $images_path . 'footer.png',
				'connection'   => array(
					'type'      => $is_legacy_connection ? 'legacy' : ( $is_saas_connection ? 'saas' : 'none' ),
					'is_legacy' => $is_legacy_connection,
					'is_saas'   => $is_saas_connection,
					'connection_id' => get_option( 'ph_child_connection_id', '' ),
					'site_data' => array(
						'site_url' => get_option( 'ph_child_parent_url', '' ),
					),
					'site_id'   => get_option( 'ph_child_id', '' ), // Legacy: project ID
					'saas_site_id' => get_option( 'ph_child_site_id', '' ), // SaaS: actual site ID
					'api_key'   => get_option( 'ph_child_api_key', '' ),
					'access_token' => get_option( 'ph_child_access_token', '' ),
					'signature' => get_option( 'ph_child_signature', '' ),
				),
			);

			wp_localize_script(
				'ph-child-admin',
				'sureFeedbackAdmin',
				$localized_data
			);
		}

		/**
		 * Check if connection is legacy (old plugin system)
		 *
		 * @return bool
		 */
		private function is_legacy_connection() {
			$parent_url = get_option( 'ph_child_parent_url', '' );
			$site_id    = get_option( 'ph_child_id', '' );
			$api_key    = get_option( 'ph_child_api_key', '' );

			return ! empty( $parent_url ) && ! empty( $site_id ) && ! empty( $api_key );
		}

		/**
		 * Check if connection is SaaS (new OAuth system)
		 *
		 * @return bool
		 */
		private function is_saas_connection() {
			$bearer_token = get_option( 'ph_child_bearer_token', '' );
			$connection_id = get_option( 'ph_child_connection_id', '' );

			return ! empty( $bearer_token ) || ! empty( $connection_id );
		}

		/**
		 * Add settings section from dashboard.
		 *
		 * @return void
		 */
		public function options() {
			add_settings_section(
				'ph_general_section',
				__( 'General Settings', 'ph-child' ),
				'__return_false',
				'ph_child_general_options'
			);

			add_settings_field(
				'ph_child_enabled_comment_roles',
				__( 'Comments Visibility Access', 'ph-child' ),
				array( $this, 'commenters_checklist' ),
				'ph_child_general_options',
				'ph_general_section',
				false
			);

			register_setting(
				'ph_child_general_options',
				'ph_child_enabled_comment_roles',
				'ph_child_help_link'
			);

			add_settings_field(
				'ph_child_allow_guests',
				__( 'Allow Site Visitors', 'ph-child' ),
				array( $this, 'allow_guests' ),
				'ph_child_general_options',
				'ph_general_section',
				false
			);

			register_setting(
				'ph_child_general_options',
				'ph_child_allow_guests',
				array(
					'type' => 'boolean',
				)
			);

			add_settings_field(
				'ph_child_admin',
				__( 'Dashboard Commenting', 'ph-child' ),
				array( $this, 'allow_admin' ),
				'ph_child_general_options',
				'ph_general_section',
				false
			);

			register_setting(
				'ph_child_general_options',
				'ph_child_admin',
				array(
					'type' => 'boolean',
				)
			);

			add_settings_section(
				'ph_connection_status_section',
				__( 'Connection', 'ph-child' ),
				'__return_false',
				'ph_child_connection_options'
			);

			add_settings_field(
				'ph_connection_status',
				__( 'Connection Status', 'ph-child' ),
				array( $this, 'connection_status' ),
				'ph_child_connection_options',
				'ph_connection_status_section',
				false
			);

			add_settings_field(
				'ph_child_help_link',
				'',
				array( $this, 'help_link' ),
				'ph_child_connection_options',
				'ph_connection_status_section',
				false
			);

			add_settings_field(
				'ph_child_manual_connection',
				__( 'Manual Connection Details', 'ph-child' ),
				array( $this, 'manual_connection' ),
				'ph_child_connection_options',
				'ph_connection_status_section',
				false
			);

			register_setting(
				'ph_child_connection_options',
				'ph_child_manual_connection',
				array(
					'type'              => 'string',
					'sanitize_callback' => array( $this, 'manual_import' ),
				)
			);

			add_settings_section(
				'ph_child_white_label_section',
				__( 'White Label', 'ph-child' ),
				'__return_false',
				'ph_child_white_label_options'
			);

			add_settings_field(
				'ph_child_plugin_name',
				__( 'Plugin Name', 'ph-child' ),
				array( $this, 'plugin_name' ),
				'ph_child_white_label_options',
				'ph_child_white_label_section',
				false
			);

			add_settings_field(
				'ph_child_plugin_description',
				__( 'Plugin Description', 'ph-child' ),
				array( $this, 'plugin_description' ),
				'ph_child_white_label_options',
				'ph_child_white_label_section',
				false
			);

			add_settings_field(
				'ph_child_plugin_author',
				__( 'Plugin Author', 'ph-child' ),
				array( $this, 'plugin_author' ),
				'ph_child_white_label_options',
				'ph_child_white_label_section',
				false
			);

			add_settings_field(
				'ph_child_plugin_author_url',
				__( 'Plugin Author URL', 'ph-child' ),
				array( $this, 'plugin_author_url' ),
				'ph_child_white_label_options',
				'ph_child_white_label_section',
				false
			);

			add_settings_field(
				'ph_child_plugin_link',
				__( 'Plugin Link', 'ph-child' ),
				array( $this, 'plugin_link' ),
				'ph_child_white_label_options',
				'ph_child_white_label_section',
				false
			);

			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_name',
				array(
					'type' => 'string',
				)
			);
			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_description',
				array(
					'type' => 'string',
				)
			);
			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_author',
				array(
					'type' => 'string',
				)
			);

			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_author_url',
				array(
					'type' => 'string',
				)
			);

			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_link',
				array(
					'type' => 'string',
				)
			);
		}

		/**
		 * Return Plugin Name.
		 *
		 * @return void
		 */
		public function plugin_name() {
			?>
				<input type="text" name="ph_child_plugin_name" class="regular-text" value="<?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_name', '' ) ) ); ?>" />
				<?php
		}

		/**
		 * Return Plugin description.
		 *
		 * @return void
		 */
		public function plugin_description() {
			?>
				<textarea name="ph_child_plugin_description" rows="3" class="regular-text"><?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_description', '' ) ) ); ?></textarea>
				<?php
		}

		/**
		 * Return Plugin author.
		 *
		 * @return void
		 */
		public function plugin_author() {
			?>
				<input type="text" name="ph_child_plugin_author" class="regular-text" value="<?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_author', '' ) ) ); ?>" />
				<?php
		}

		/**
		 * Return Plugin author url.
		 *
		 * @return void
		 */
		public function plugin_author_url() {
			?>
				<input type="text" name="ph_child_plugin_author_url" class="regular-text" value="<?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_author_url', '' ) ) ); ?>" />
				<?php
		}

		/**
		 * Return Plugin link.
		 *
		 * @return void
		 */
		public function plugin_link() {
			?>
				<input type="url" name="ph_child_plugin_link" class="regular-text" value="<?php echo esc_attr( esc_url( get_option( 'ph_child_plugin_link', '' ) ) ); ?>" />
				<?php
		}

		/**
		 * Provides manual import functionality.
		 *
		 * @param string $val import content.
		 * @return string
		 */
		public function manual_import( $val ) {
			$settings = json_decode( $val, true );

			if ( ! empty( $settings ) ) {
				foreach ( $settings as $key => $value ) {
					if ( array_key_exists( 'ph_child_' . $key, $this->whitelist_option_names ) ) {
						$sanitize = $this->whitelist_option_names[ 'ph_child_' . $key ]['sanitize_callback'];
						$updated  = update_option( 'ph_child_' . $key, $sanitize( $value ) );
					}
				}
			}

			return $val;
		}

		/**
		 * Check commenters checklist.
		 *
		 * @return void
		 */
		public function commenters_checklist() {
			$disable_roles = (array) get_option( 'ph_child_enabled_comment_roles', array() );
			$roles         = (array) get_editable_roles();

			if ( ! empty( $roles ) ) {
				foreach ( $roles as $slug => $role ) {
					if ( empty( $disable_roles ) ) {
						$checked = true;
					} else {
						$checked = in_array( $slug, $disable_roles );
					}
					?>
						<input type="checkbox" name="ph_child_enabled_comment_roles[<?php echo esc_attr( $slug ); ?>]" value="<?php echo esc_attr( $slug ); ?>" <?php checked( $checked ); ?>> <?php echo esc_html( $role['name'] ); ?><br>
						<?php
				}
				?>
				<br><span class="description">
				<?php
				esc_html_e( 'Allow above user roles to view comments on your site without access token.', 'ph-child' );
				?>
				</span> 
				<?php
			}
		}

		/**
		 * Check if guests are allowed to comment.
		 *
		 * @return void
		 */
		public function allow_guests() {
			?>
				<input type="checkbox" name="ph_child_allow_guests" <?php checked( get_option( 'ph_child_allow_guests', false ), 'on' ); ?>>
				<?php esc_html_e( 'Allow the site visitors to view and add comments on your site without access token.', 'ph-child' ); ?><br>
				<?php
		}

		/**
		 * Check if admin is allowed to comment.
		 *
		 * @return void
		 */
		public function allow_admin() {
			?>
				<input type="checkbox" name="ph_child_admin" <?php checked( get_option( 'ph_child_admin', false ), 'on' ); ?>>
				<?php esc_html_e( 'Allow commenting in your site\'s WordPress dashboard area.', 'ph-child' ); ?><br>
				<?php
		}

		/**
		 * Fetch connection status.
		 *
		 * @return void
		 */
		public function connection_status() {
			?>

				<style>
					.ph-badge {
						color: #7d7d7d;
						background: #e4e4e4;
						display: inline-block;
						padding: 5px;
						line-height: 1;
						border-radius: 3px;
					}

					.ph-badge.ph-connected {
						color: #559a55;
						background: #daecda;
					}

					.ph-badge.ph-not-connected {
						color: #9c8a44;
						background: #f1ebd3;
					}
					a.ph-admin-link {
						margin-left: 10px !important;
					}
					.ph-child-disable-row {
						display: none;
					}
				</style>
				<?php
				$connection              = get_option( 'ph_child_parent_url', false );
				$site_id                 = (int) get_option( 'ph_child_id' );
				$dashboard_url           = $connection . '/wp-admin/post.php?post=' . $site_id . '&action=edit';
				$whitelabeld_plugin_name = get_option( 'ph_child_plugin_name', false );
				if ( $connection ) {
					/* translators: %s: parent site URL */
					echo '<p class="ph-badge ph-connected">' . sprintf( __( 'Connected to %s', 'ph-child' ), esc_url( $connection ) ) . '</p>';
					echo '<p class="submit">';
						echo '<a class="button button-secondary ph-child-reload" href="' . esc_url(
							add_query_arg(
								array(
									'ph-child-site-disconnect' => 1,
									'ph-child-site-disconnect-nonce' => wp_create_nonce( 'ph-child-site-disconnect-nonce' ),
								),
								remove_query_arg( 'settings-updated' )
							)
						) . '">' . esc_html__( 'Disconnect', 'ph-child' ) . '</a>';
					if ( ! $whitelabeld_plugin_name ) {
						echo '<a class="button button-secondary ph-admin-link" target="_blank" href="' . esc_url( $dashboard_url ) . '">' . esc_html__( 'Visit Dashboard Site', 'ph-child' ) . '</a>';
					}
					echo '</p>';
				} else {
					echo '<p class="ph-badge ph-not-connected">';
					esc_html_e( 'Not Connected. Please connect this plugin to your Feedback installation.', 'ph-child' );
					echo '</p>';
					?>
					<style>
					.ph-child-disable-row {
						display: revert !important;
					}
					</style>
					<?php
				}
				?>
				<?php
		}

		/**
		 * Display help link for manual connection.
		 *
		 * @return void
		 */
		public function help_link() {
			$whitelabel_name = get_option( 'ph_child_plugin_name', false );
			if ( ! $whitelabel_name ) {
				?>
				<p class="submit">
					<a class="ph-child-help-link" style="text-decoration: none;" target="_blank" href="https://surefeedback.com/docs/adding-a-clients-wordpress-site#manual">
						<?php esc_html_e( 'Need Help?', 'ph-child' ); ?>
					</a> 
				</p>
				<?php
			}
		}

		/**
		 * Manual connection content.
		 *
		 * @return void
		 */
		public function manual_connection() {
			?>
				<p class="ph-child-manual-connection"><?php esc_html_e( 'If you are having trouble connecting, you can manually connect by pasting the connection details below', 'ph-child' ); ?></p><br>
				<textarea name="ph_child_manual_connection" style="width:500px;height:300px"></textarea>
				<?php
		}

		/**
		 * Add custom inline script.
		 *
		 * @return void
		 */
		public function ph_custom_inline_script() {
			$script_code = '
			jQuery(document).ready(function($) {
				$(".ph-child-manual-connection").closest("tr").addClass("ph-child-disable-row"); 
				$(".ph-child-help-link").closest("tr").addClass("ph-child-disable-row"); 
			});
				 ';
			wp_register_script( 'ph-custom-footer-script', '', array(), '', true );
			wp_enqueue_script( 'ph-custom-footer-script' );
			wp_add_inline_script( 'ph-custom-footer-script', $script_code );
		}

		/**
		 * Add user data to the script.
		 *
		 * @return void
		 */
		public function ph_user_data() {

			$current_user = wp_get_current_user();

			$user_data = array(
				'ID'            => $current_user->ID,
				'user_login'    => $current_user->user_login,
				'user_email'    => $current_user->user_email,
				'display_name'  => $current_user->display_name,
			);

			?>
			<script>
				window.PH_Child = <?php echo json_encode( $user_data ); ?>
			</script>
			<?php
		}

		/**
		 * Feedback page - custom settings page content.
		 * Now loads React admin interface
		 *
		 * @return void
		 */
		public function options_page() {
			$this->enqueue_admin_scripts();

			?>
			<div id="ph-child-app" data-container-type="connection"></div>
			<?php
		}

		/**
		 * Widget Control page callback
		 *
		 * @return void
		 */
		public function widget_control_page() {
			$this->enqueue_admin_scripts();

			?>
			<div id="ph-child-app" data-container-type="widget-control"></div>
			<?php
		}

		/**
		 * Settings page callback
		 *
		 * @return void
		 */
		public function settings_page() {
			$this->enqueue_admin_scripts();

			?>
			<div id="ph-child-app" data-container-type="settings"></div>
			<?php
		}

		/**
		 * White Label page callback
		 *
		 * @return void
		 */
		public function white_label_page() {
			$this->enqueue_admin_scripts();

			?>
			<div id="ph-child-app" data-container-type="white-label"></div>
			<?php
		}

		/**
		 * Enqueue admin scripts and styles for React app
		 * Called from page callbacks to ensure assets are loaded
		 * 
		 * Note: Actual asset enqueuing is handled by enqueue_assets() method
		 * which is hooked to admin_enqueue_scripts
		 *
		 * @return void
		 */
		public function enqueue_admin_scripts() {
		}

		/**
		 * Check if valid cookie is available.
		 *
		 * @return bool
		 */
		public function has_valid_cookie() {
			$token = get_option( 'ph_child_access_token', '' );
			if ( ! $token ) {
				return false;
			}

			$url_token = isset( $_GET['ph_access_token'] ) ? sanitize_text_field( $_GET['ph_access_token'] ) : '';

			if ( ! $url_token ) {
				if ( isset( $_COOKIE['ph_access_token'] ) ) {
					$url_token = $_COOKIE['ph_access_token'];
				}
			}

			return $url_token === $token;
		}

		/**
		 * Outputs the saved website script
		 * Along with and identify method to sync accounts
		 *
		 * @return void
		 */
		/**
		 * Check if widget should be displayed on current page
		 * 
		 * @return bool
		 */
		private function should_display_widget_on_current_page() {
			$page_settings = get_option( 'ph_child_page_widget_settings', array() );

			if ( empty( $page_settings ) ) {
				return true;
			}

			$current_page_id = $this->get_current_page_id();

			if ( ! $current_page_id ) {
				return true;
			}

			if ( isset( $page_settings[ $current_page_id ] ) && $page_settings[ $current_page_id ] === false ) {
				return false;
			}

			return true;
		}
		
		/**
		 * Get current page ID based on WordPress query
		 * 
		 * @return string|null
		 */
		private function get_current_page_id() {
			if ( is_front_page() ) {
				return 'home';
			}
			
			if ( is_home() ) {
				return 'blog';
			}
			
			if ( is_singular() ) {
				$post_type = get_post_type();
				$post_id   = get_the_ID();
				
				if ( $post_type === 'page' ) {
					return 'page_' . $post_id;
				} elseif ( $post_type === 'post' ) {
					return 'post_' . $post_id;
				} else {
					return $post_type . '_' . $post_id;
				}
			}
			
			if ( is_archive() ) {
				return 'archive';
			}
			
			if ( is_search() ) {
				return 'search';
			}
			
			if ( is_404() ) {
				return '404';
			}
			
			return null;
		}

		public function script() {
			static $loaded;

			if ( $loaded ) {
				return;
			}

			if ( ! apply_filters( 'ph_script_should_start_loading', true ) ) {
				return;
			}

			if ( ! $this->should_display_widget_on_current_page() ) {
				echo '<!-- SureFeedback: widget disabled for this page -->';
				return;
			}

			$allowed = false;
			$allowed = ph_child_is_current_user_allowed_to_comment() || $this->has_valid_cookie();

			$current_page_id = $this->get_current_page_id();
			$page_settings = get_option( 'ph_child_page_widget_settings', array() );

			// Check connection type
			$is_saas_connection = $this->is_saas_connection();
			$is_legacy_connection = $this->is_legacy_connection();

			// Get access token
			$access_token = get_option( 'ph_child_access_token', '' );

		// Determine base URL and site ID based on connection type
		if ( $is_saas_connection ) {
			// SaaS Connection: Use new SDK pattern
			$site_id = get_option( 'ph_child_site_id', '' );
			
			// SDK is served from Laravel, not Next.js
			// Get API base URL and remove /api/v1 to get Laravel base URL
			if ( defined( 'SUREFEEDBACK_API_BASE_URL' ) ) {
				$sdk_base_url = SUREFEEDBACK_API_BASE_URL;
			} elseif ( defined( 'PH_CHILD_API_BASE_URL' ) ) {
				$sdk_base_url = PH_CHILD_API_BASE_URL;
			} else {
				$sdk_base_url = 'https://api.surefeedback.com';
			}
			
			// Remove /api/v1 if present to get base Laravel URL
			$sdk_base_url = preg_replace( '#/api/v1/?$#', '', rtrim( $sdk_base_url, '/' ) );
			
			// For app base URL (used for other purposes), use Next.js URL
			if ( defined( 'SUREFEEDBACK_APP_BASE_URL' ) ) {
				$app_base_url = SUREFEEDBACK_APP_BASE_URL;
			} elseif ( defined( 'PH_CHILD_APP_BASE_URL' ) ) {
				$app_base_url = PH_CHILD_APP_BASE_URL;
			} else {
				$app_base_url = 'https://app.surefeedback.com';
			}
			
			if ( ! $site_id ) {
				echo '<!-- SureFeedback: site ID not set for SaaS connection -->';
				return;
			}

			$sdk_url = $sdk_base_url . '/sdk/ws/' . $site_id . '.js';
			// Use SDK base URL (Laravel) for data-base-url, not app base URL (Next.js)
			$base_url = $sdk_base_url;
			} elseif ( $is_legacy_connection ) {
				// Legacy Connection: Use old pattern for backward compatibility
				$parent_url = get_option( 'ph_child_parent_url' );
				$id = get_option( 'ph_child_id' );
				
				if ( ! $parent_url || ! $id ) {
					echo '<!-- SureFeedback: parent url or project id not set -->';
					return;
				}

				$args = array(
					'p'         => (int) $id,
					'ph_apikey' => get_option( 'ph_child_api_key', '' ),
				);

				if ( $allowed ) {
					$args['ph_access_token'] = $access_token;
					$args['ph_signature']    = hash_hmac( 'sha256', 'guest', get_option( 'ph_child_signature', false ) );
					if ( is_user_logged_in() ) {
						$user                  = wp_get_current_user();
						$args['ph_user_name']  = urlencode( $user->display_name );
						$args['ph_user_email'] = sanitize_email( str_replace( '+', '%2B', $user->user_email ) );
						$args['ph_signature']  = hash_hmac( 'sha256', sanitize_email( $user->user_email ), get_option( 'ph_child_signature', false ) );
						$args['ph_query_vars'] = filter_var( get_option( 'ph_child_admin', false ), FILTER_VALIDATE_BOOLEAN );
					}
				}

				$url = add_query_arg( $args, $parent_url );
				$url = preg_replace( '(^https?://)', '', $url );
				$sdk_url = '//' . $url;
				$base_url = $parent_url;
			} else {
				echo '<!-- SureFeedback: no connection configured -->';
				return;
			}

			$loaded = true;
			?>

			<script>
				(function() {
					var shouldDisplayWidget = function() {
						var pageSettings = <?php echo json_encode( $page_settings ); ?>;
						var currentPageId = <?php echo json_encode( $current_page_id ); ?>;

						if (!pageSettings || Object.keys(pageSettings).length === 0) {
							return true;
						}

						if (!currentPageId) {
							return true;
						}

						if (pageSettings[currentPageId] === false) {
							return false;
						}

						return true;
					};

					if (!shouldDisplayWidget()) {
						return;
					}

					<?php if ( $is_saas_connection ) : ?>
					// SaaS Connection: Load new SDK pattern
					var script = document.createElement('script');
					script.src = '<?php echo esc_url_raw( $sdk_url ); ?>';
					script.async = true;
					script.defer = true;
					script.charset = 'UTF-8';
					
					<?php if ( $access_token ) : ?>
					script.setAttribute('data-token', '<?php echo esc_js( $access_token ); ?>');
					<?php endif; ?>
					
					script.setAttribute('data-base-url', '<?php echo esc_js( $base_url ); ?>');
					
					// Also pass token via URL parameter for SDK to pick up
					<?php if ( $access_token ) : ?>
					var urlParams = new URLSearchParams(script.src.split('?')[1] || '');
					urlParams.set('api_token', '<?php echo esc_js( $access_token ); ?>');
					script.src = script.src.split('?')[0] + '?' + urlParams.toString();
					<?php endif; ?>
					
					document.head.appendChild(script);
					<?php else : ?>
					// Legacy Connection: Use old pattern for backward compatibility
					var l = <?php echo $allowed ? 'true' : 'false'; ?>;
					var k = 'ph_access_token';
					var t = (new URLSearchParams(window.location.search)).get(k);
					t && localStorage.setItem(k, t);
					t = localStorage.getItem(k);
					if (!l && !t) return;
					
					var ph = document.createElement('script');
					var s = document.getElementsByTagName('script')[0];
					ph.type = 'text/javascript';
					ph.async = true;
					ph.defer = true;
					ph.charset = 'UTF-8';
					ph.src = '<?php echo esc_url_raw( $sdk_url ); ?>' + '&v=' + (new Date()).getTime();
					ph.src += t ? '&' + k + '=' + t : '';
					s.parentNode.insertBefore(ph, s);
					<?php endif; ?>
				})();
			</script>
			<?php
		}
	}

	PH_Child_Loader::get_instance();

	$plugin = new PH_Child();

	function ph_child_update_connection_status_after_store( $connection_data ) {
		$bearer_token = get_option( 'ph_child_bearer_token', '' );
		if ( empty( $bearer_token ) ) {
			return;
		}

		$plugin_version = '1.2.10';
		$plugin_data = get_file_data( PH_CHILD_PLUGIN_FILE, array( 'Version' => 'Version' ) );
		if ( ! empty( $plugin_data['Version'] ) ) {
			$plugin_version = $plugin_data['Version'];
		}

		$site_id = $connection_data['site_id'] ?? get_option( 'ph_child_site_id', '' );
		if ( empty( $site_id ) ) {
			return;
		}

		// Check for SUREFEEDBACK_ constants first (new naming), then PH_CHILD_ (legacy), then default
		if ( defined( 'SUREFEEDBACK_API_BASE_URL' ) ) {
			$api_base_url = SUREFEEDBACK_API_BASE_URL;
			// Append /api/v1 if not already present
			if ( strpos( $api_base_url, '/api/v1' ) === false ) {
				$api_base_url = rtrim( $api_base_url, '/' ) . '/api/v1';
			}
		} elseif ( defined( 'PH_CHILD_API_BASE_URL' ) ) {
			$api_base_url = PH_CHILD_API_BASE_URL;
			// Append /api/v1 if not already present
			if ( strpos( $api_base_url, '/api/v1' ) === false ) {
				$api_base_url = rtrim( $api_base_url, '/' ) . '/api/v1';
			}
		} else {
			$api_base_url = 'https://api.surefeedback.com/api/v1';
		}
		$url = $api_base_url . '/connections/status';

		wp_remote_request( $url, array(
			'method'  => 'PATCH',
			'headers' => array(
				'Content-Type'  => 'application/json',
				'Authorization' => 'Bearer ' . $bearer_token,
			),
			'body'    => wp_json_encode( array(
				'site_id'       => $site_id,
				'plugin_version' => $plugin_version,
				'sites_count'   => 1,
			) ),
			'timeout' => 10,
		) );
	}
	add_action( 'ph_child_connection_stored', 'ph_child_update_connection_status_after_store', 20, 1 );
endif;
