<?php
/**
 * Plugin Name: Project Huddle Client Site
 * Plugin URI: http://projecthuddle.io
 * Description: Connect a website to Project Huddle
 * Author: Brainstorm Force
 * Author URI: https://www.brainstormforce.com
 * Version: 1.0.29
 *
 * Requires at least: 4.7
 * Tested up to: 5.8
 *
 * Text Domain: ph-child
 * Domain Path: languages
 *
 * @package ProjectHuddle Child
 * @author Brainstorm Force
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Setup Constants before init because we're running plugin on plugins_loaded
 *
 * @since 1.0.0
 */

// Plugin Folder Path.
if ( ! defined( 'PH_CHILD_PLUGIN_DIR' ) ) {
	define( 'PH_CHILD_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

// Plugin Folder URL.
if ( ! defined( 'PH_CHILD_PLUGIN_URL' ) ) {
	define( 'PH_CHILD_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

// Plugin Root File.
if ( ! defined( 'PH_CHILD_PLUGIN_FILE' ) ) {
	define( 'PH_CHILD_PLUGIN_FILE', __FILE__ );
}

// include child functions.
require_once 'ph-child-functions.php';

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
		protected $whitelist_option_names = [];

		/**
		 * Get things going
		 */
		public function __construct() {
			if ( defined( 'PH_VERSION' ) ) {
				add_action( 'admin_notices', [ $this, 'parent_plugin_activated_error_notice' ] );
				return;
			}

			$this->whitelist_option_names = [
				'ph_child_id'           => [
					'description'       => __( 'Website project ID.', 'project-huddle' ),
					'sanitize_callback' => 'intval',
				],
				'ph_child_api_key'      => [
					'description'       => __( 'Public API key for the script loader.', 'project-huddle' ),
					'sanitize_callback' => 'sanitize_text_field',
				],
				'ph_child_access_token' => [
					'description'       => __( 'Access token to verify access to be able to register and leave comments.', 'project-huddle' ),
					'sanitize_callback' => 'sanitize_text_field',
				],
				'ph_child_parent_url'   => [
					'description'       => __( 'Parent Site URL.', 'project-huddle' ),
					'sanitize_callback' => 'esc_url',
				],
				'ph_child_signature'    => [
					'description'       => __( 'Secret signature to verify identity.', 'project-huddle' ),
					'sanitize_callback' => 'sanitize_text_field',
				],
				'ph_child_installed'    => [
					'description'       => __( 'Is the plugin installed?', 'project-huddle' ),
					'sanitize_callback' => 'boolval',
				],
			];

			// options and menu.
			add_action( 'admin_init', [ $this, 'options' ] );
			add_action( 'admin_menu', [ $this, 'create_menu' ] );

			// show script on front end and maybe admin.
			if ( ! is_admin() ) {
				add_action( 'wp_footer', [ $this, 'script' ] );
			}
			if ( get_option( 'ph_child_admin', false ) ) {
				add_action( 'admin_footer', [ $this, 'script' ] );
			}

			// whitelist our blog options.
			add_filter( 'xmlrpc_blog_options', [ $this, 'whitelist_option' ] );

			// maybe disconnect from parent site.
			add_action( 'admin_init', [ $this, 'maybe_disconnect' ] );

			// remove disconnect args after successful disconnect.
			add_filter( 'removable_query_args', [ $this, 'remove_disconnect_args' ] );

			// update registration option in database for parent site reference.
			register_activation_hook( PH_CHILD_PLUGIN_FILE, [ $this, 'register_installation' ] );
			register_deactivation_hook( PH_CHILD_PLUGIN_FILE, [ $this, 'deregister_installation' ] );

			// redirect to the options page after activating.
			add_action( 'activated_plugin', [ $this, 'redirect_options_page' ] );

			// Add settings link to plugins page.
			add_filter( 'plugin_action_links_' . plugin_basename( PH_CHILD_PLUGIN_FILE ), [ $this, 'add_settings_link' ] );

			// white label text only on plugins page.
			global $pagenow;
			if ( is_admin() && 'plugins.php' === $pagenow ) {
				add_filter( 'gettext', [ $this, 'white_label' ], 20, 3 );
				add_filter( 'plugin_row_meta', [ $this, 'white_label_link' ], 10, 4 );
			}

			add_filter( 'ph_script_should_start_loading', [ $this, 'compatiblity_blacklist' ] );
		}

		/**
		 * Checks compatibility blacklist.
		 *
		 * @param string $load Specifies if script should start loading.
		 */
		public function compatiblity_blacklist( $load ) {
			$disabled = apply_filters(
				'ph_disable_for_query_vars',
				[
					// divi.
					'et_fb',
					// elementor.
					'elementor-preview',
					// beaver builder.
					'fl_builder',
					'fl_builder_preview',
					// fusion.
					'builder',
					'fb-edit',
				]
			);

			// disable these.
			if ( ! empty( $_GET ) && is_array( $_GET ) ) {
				foreach ( $_GET as $arg => $_ ) {
					if ( in_array( $arg, $disabled ) ) {
						return false;
					}
				}
			}

			// oxygen is... "special".
			if ( isset( $_GET['ct_builder'] ) ) {
				return false; // TODO: remove once we can get pageX, pageY inside iframe.
				// bail if admin commenting is disabled.
				if ( ! get_option( 'ph_child_admin', false ) ) {
					return false;
				}
				// bail if not in the iframe.
				if ( ! isset( $_GET['oxygen_iframe'] ) ) {
					return false;
				}
			}

			return $load;
		}

		/**
		 * Soow parent plugin activation notice.
		 */
		public function parent_plugin_activated_error_notice() {
			$message = __( 'You have both the client site and ProjectHuddle core plugins activated. You must only activate the client site on a client site, and ProjectHuddle on your main site.', 'project-huddle' );
			echo '<div class="error"> <p>' . esc_html( $message ) . '</p></div>';
		}

		/**
		 * Show white label link.
		 *
		 * @param string $plugin_meta Specifies Plugin meta data.
		 * @param string $plugin_file Specifies Plugin file.
		 * @param string $plugin_data Specifies Plugin data.
		 * @param string $status Specifies Plugin status.
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
				$link = get_option( 'ph_child_plugin_link', '' );
				if ( $link ) {
					$plugin_meta[2] = '<a href="' . esc_url( $link ) . '" target="_blank">' . esc_html__( 'Visit plugin site', 'ph-child' ) . '</a>';
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
		 */
		public function white_label( $translated_text, $untranslated_text, $domain ) {
			global $pagenow;
			if ( ! is_admin() || 'plugins.php' !== $pagenow ) {
				return $translated_text;
			}
			// make the changes to the text.
			switch ( $untranslated_text ) {
				case 'ProjectHuddle Client Site':
					$name = get_option( 'ph_child_plugin_name', false );
					if ( $name ) {
						$translated_text = $name;
					}
					break;
				case 'Connect a website to ProjectHuddle':
					$description = get_option( 'ph_child_plugin_description', false );
					if ( $description ) {
						$translated_text = $description;
					}
					break;
				case 'ProjectHuddle':
					$author = get_option( 'ph_child_plugin_author', false );
					if ( $author ) {
						$translated_text = $author;
					}
					break;
					// add more items.
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

			// nonce check.
			if ( ! isset( $_GET['ph-child-site-disconnect-nonce'] ) || ! wp_verify_nonce( $_GET['ph-child-site-disconnect-nonce'], 'ph-child-site-disconnect-nonce' ) ) {
				wp_die( 'That\'s not allowed' );
			}

			foreach ( $this->whitelist_option_names as $name => $items ) {
				delete_option( $name );
			}
		}

		/**
		 * Redirect to options page.
		 *
		 * @param string $plugin Plugin name.
		 */
		public function redirect_options_page( $plugin ) {
			if ( plugin_basename( __FILE__ ) == $plugin ) {
				exit( wp_redirect( admin_url( 'options-general.php?page=feedback-connection-options' ) ) );
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
		 */
		public function whitelist_option( $options ) {
			foreach ( $this->whitelist_option_names as $name => $item ) {
				$options[ $name ] = [
					'desc'     => esc_html( $item['description'] ),
					'readonly' => false,
					'option'   => $name,
				];
			}

			return $options;
		}

		/**
		 * Create Menu
		 *
		 * @return void
		 */
		public function create_menu() {
			add_options_page(
				__( 'Feedback Connection', 'ph-child' ),
				__( 'Feedback', 'ph-child' ),
				'manage_options',
				'feedback-connection-options',
				[ $this, 'options_page' ]
			);
		}

		/**
		 * Add settings section from dashboard.
		 */
		public function options() {
			add_settings_section(
				'ph_general_section', // ID.
				__( 'General Settings', 'ph-child' ), // title.
				'__return_false', // description.
				'ph_child_general_options' // Page on which to add this section of options.
			);

			add_settings_field(
				'ph_child_enabled_comment_roles',
				__( 'Who should comment?', 'ph-child' ),
				[ $this, 'commenters_checklist' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_general_options',    // The page on which this option will be displayed.
				'ph_general_section',         // The name of the section to which this field belongs.
				false
			);

			// Finally, we register the fields with WordPress.
			register_setting(
				'ph_child_general_options',
				'ph_child_enabled_comment_roles'
			);

			add_settings_field(
				'ph_child_allow_guests',
				__( 'Allow Guests', 'ph-child' ),
				[ $this, 'allow_guests' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_general_options',    // The page on which this option will be displayed.
				'ph_general_section',         // The name of the section to which this field belongs.
				false
			);

			// regsister setting.
			register_setting(
				'ph_child_general_options',
				'ph_child_allow_guests',
				[
					'type' => 'boolean',
				]
			);

			add_settings_field(
				'ph_child_admin',
				__( 'Admin Commenting', 'ph-child' ),
				[ $this, 'allow_admin' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_general_options',    // The page on which this option will be displayed.
				'ph_general_section',         // The name of the section to which this field belongs.
				false
			);

			// regsister setting.
			register_setting(
				'ph_child_general_options',
				'ph_child_admin',
				[
					'type' => 'boolean',
				]
			);

			add_settings_section(
				'ph_connection_status_section', // ID.
				__( 'Connection', 'ph-child' ), // title.
				'__return_false', // description.
				'ph_child_connection_options' // Page on which to add this section of options.
			);

			add_settings_field(
				'ph_connection_status',
				__( 'Connection Status', 'ph-child' ),
				[ $this, 'connection_status' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_connection_options',    // The page on which this option will be displayed.
				'ph_connection_status_section',         // The name of the section to which this field belongs.
				false
			);

			add_settings_field(
				'ph_child_manual_connection',
				__( 'Manual Connection Details', 'ph-child' ),
				[ $this, 'manual_connection' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_connection_options',    // The page on which this option will be displayed.
				'ph_connection_status_section',         // The name of the section to which this field belongs.
				false
			);

			// regsister setting.
			register_setting(
				'ph_child_connection_options',
				'ph_child_manual_connection',
				[
					'type'              => 'string',
					'sanitize_callback' => [ $this, 'manual_import' ],
				]
			);

			add_settings_section(
				'ph_child_white_label_section', // ID.
				__( 'White Label', 'ph-child' ), // title.
				'__return_false', // description.
				'ph_child_white_label_options' // Page on which to add this section of options.
			);

			add_settings_field(
				'ph_child_plugin_name',
				__( 'Plugin Name', 'ph-child' ),
				[ $this, 'plugin_name' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_white_label_options',    // The page on which this option will be displayed.
				'ph_child_white_label_section',         // The name of the section to which this field belongs.
				false
			);

			add_settings_field(
				'ph_child_plugin_description',
				__( 'Plugin Description', 'ph-child' ),
				[ $this, 'plugin_description' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_white_label_options',    // The page on which this option will be displayed.
				'ph_child_white_label_section',         // The name of the section to which this field belongs.
				false
			);

			add_settings_field(
				'ph_child_plugin_author',
				__( 'Plugin Author', 'ph-child' ),
				[ $this, 'plugin_author' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_white_label_options',    // The page on which this option will be displayed.
				'ph_child_white_label_section',         // The name of the section to which this field belongs.
				false
			);

			add_settings_field(
				'ph_child_plugin_link',
				__( 'Plugin Link', 'ph-child' ),
				[ $this, 'plugin_link' ],   // The name of the function responsible for rendering the option interface.
				'ph_child_white_label_options',    // The page on which this option will be displayed.
				'ph_child_white_label_section',         // The name of the section to which this field belongs.
				false
			);

			// regsister setting.
			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_name',
				[
					'type' => 'string',
				]
			);
			// regsister setting.
			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_description',
				[
					'type' => 'string',
				]
			);
			// regsister setting.
			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_author',
				[
					'type' => 'string',
				]
			);

			// regsister setting.
			register_setting(
				'ph_child_white_label_options',
				'ph_child_plugin_link',
				[
					'type' => 'string',
				]
			);
		}

		/**
		 * Return Plugin Name.
		 */
		public function plugin_name() {             ?>
			<input type="text" name="ph_child_plugin_name" class="regular-text" value="<?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_name', '' ) ) ); ?>" />
			<?php
		}

		/**
		 * Return Plugin description.
		 */
		public function plugin_description() {
			?>
			<textarea name="ph_child_plugin_description" rows="3" class="regular-text"><?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_description', '' ) ) ); ?></textarea>
			<?php
		}

		/**
		 * Return Plugin author.
		 */
		public function plugin_author() {
			?>
			<input type="text" name="ph_child_plugin_author" class="regular-text" value="<?php echo esc_attr( sanitize_text_field( get_option( 'ph_child_plugin_author', '' ) ) ); ?>" />
			<?php
		}

		/**
		 * Return Plugin link.
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
		 */
		public function manual_import( $val ) {
			$settings = json_decode( $val, true );

			// update manual import.
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
		 */
		public function commenters_checklist() {
			$disable_roles = (array) get_option( 'ph_child_enabled_comment_roles', [] );
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
			}
		}

		/**
		 * Check if guests are allowed to comment.
		 */
		public function allow_guests() {
			?>
			<input type="checkbox" name="ph_child_allow_guests" <?php checked( get_option( 'ph_child_allow_guests', false ), 'on' ); ?>>
			<?php esc_html_e( 'Allow guests to comment', 'ph-child' ); ?><br>
			<?php
		}

		/**
		 * Check if admin is allowed to comment.
		 */
		public function allow_admin() {
			?>
			<input type="checkbox" name="ph_child_admin" <?php checked( get_option( 'ph_child_admin', false ), 'on' ); ?>>
			<?php esc_html_e( 'Allow commenting in the admin.', 'ph-child' ); ?><br>
			<?php
		}

		/**
		 * Fetch connection status.
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
			</style>
			<?php
			$connection = get_option( 'ph_child_parent_url', false );
			if ( $connection ) {
				/* translators: %s: parent site URL */
				echo '<p class="ph-badge ph-connected">' . sprintf( __( 'Connected to %s', 'ph-child' ), esc_url( $connection ) ) . '</p>';
				echo '<p class="submit">';
				echo '<a class="button button-secondary" href="' . esc_url(
					add_query_arg(
						[
							'ph-child-site-disconnect' => 1,
							'ph-child-site-disconnect-nonce' => wp_create_nonce( 'ph-child-site-disconnect-nonce' ),
						],
						remove_query_arg( 'settings-updated' )
					)
				) . '">' . esc_html__( 'Disconnect', 'project-huddle' ) . '</a>';
			} else {
				echo '<p class="ph-badge ph-not-connected">';
				esc_html_e( 'Not Connected. Please connect this plugin to your Feedback installation.', 'ph-child' );
				echo '</p>';
			}
			?>
			<?php
		}

		/**
		 * Manual connection content.
		 */
		public function manual_connection() {
			?>
			<p><?php esc_html_e( 'If you are having trouble connecting, you can manually connect by pasting the connection details below', 'ph-child' ); ?></p><br>
			<textarea name="ph_child_manual_connection" style="width:500px;height:300px"></textarea>
			<?php
		}

		/**
		 * Feedack custom settings page content.
		 */
		public function options_page() {
			?>
			<div class="wrap">
				<h1><?php esc_html_e( 'Feedback Options', 'ph-child' ); ?></h1>

				<?php $active_tab = isset( $_GET['tab'] ) ? sanitize_text_field( $_GET['tab'] ) : 'general'; ?>

				<h2 class="nav-tab-wrapper">
					<a href="
					<?php
					echo esc_url(
						add_query_arg(
							'tab',
							'general',
							remove_query_arg( 'settings-updated' )
						)
					);
					?>
					" class="nav-tab <?php echo 'general' === $active_tab ? 'nav-tab-active' : ''; ?>">
						<?php esc_html_e( 'General', 'ph-child' ); ?>
					</a>

					<a href="
					<?php
					echo esc_url(
						add_query_arg(
							'tab',
							'connection',
							remove_query_arg( 'settings-updated' )
						)
					);
					?>
					" class="nav-tab <?php echo 'connection' === $active_tab ? 'nav-tab-active' : ''; ?>">
						<?php esc_html_e( 'Connection', 'ph-child' ); ?>
					</a>

					<?php if ( ! defined( 'PH_HIDE_WHITE_LABEL' ) || true !== PH_HIDE_WHITE_LABEL ) : ?>
						<a href="
						<?php
						echo esc_url(
							add_query_arg(
								'tab',
								'white_label',
								remove_query_arg( 'settings-updated' )
							)
						);
						?>
						" class="nav-tab <?php echo 'white_label' === $active_tab ? 'nav-tab-active' : ''; ?>">
							<?php esc_html_e( 'White Label', 'ph-child' ); ?>
						</a>
					<?php endif; ?>
				</h2>

				<form method="post" action="options.php">
					<?php
					if ( 'general' === $active_tab ) {
						settings_fields( 'ph_child_general_options' );
						do_settings_sections( 'ph_child_general_options' );
					} elseif ( 'connection' === $active_tab ) {
						settings_fields( 'ph_child_connection_options' );
						do_settings_sections( 'ph_child_connection_options' );
					} elseif ( 'white_label' === $active_tab ) {
						settings_fields( 'ph_child_white_label_options' );
						do_settings_sections( 'ph_child_white_label_options' );
					}
					submit_button();
					?>
				</form>
			</div>
			<?php
		}

		/**
		 * Check if valid cookie is available.
		 */
		public function has_valid_cookie() {
			$token = get_option( 'ph_child_access_token', '' );
			if ( ! $token ) {
				return false;
			}

			// get token from url.
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
		public function script() {
			static $loaded;

			// make sure we only load once.
			if ( $loaded ) {
				return;
			}

			if ( ! apply_filters( 'ph_script_should_start_loading', true ) ) {
				return;
			}

			// settings must be set.
			$url = get_option( 'ph_child_parent_url' );
			if ( ! $url ) {
				echo '<!-- ProjectHuddle: parent url not set -->';
				return;
			}
			$id = get_option( 'ph_child_id' );
			if ( ! $id ) {
				echo '<!-- ProjectHuddle: project id not set -->';
				return;
			}

			$allowed = false;
			$allowed = ph_child_is_current_user_allowed_to_comment() || $this->has_valid_cookie();

			// always have project and public api key.
			$args = [
				'p'         => (int) $id,
				'ph_apikey' => get_option( 'ph_child_api_key', '' ),
			];

			// auto-add access token and signature if current user is allowed to comment.
			if ( $allowed ) {
				$args['ph_access_token'] = get_option( 'ph_child_access_token', '' );
				$args['ph_signature']    = hash_hmac( 'sha256', 'guest', get_option( 'ph_child_signature', false ) );
				// if user is logged in, add name and email data.
				if ( is_user_logged_in() ) {
					$user                  = wp_get_current_user();
					$args['ph_user_name']  = urlencode( $user->display_name );
					$args['ph_user_email'] = sanitize_email( str_replace( '+', '%2B', $user->user_email ) );
					$args['ph_signature']  = hash_hmac( 'sha256', sanitize_email( $user->user_email ), get_option( 'ph_child_signature', false ) );
					$args['ph_query_vars'] = filter_var( get_option( 'ph_child_admin', false ), FILTER_VALIDATE_BOOLEAN );
				}
			}

			$url = add_query_arg( $args, $url );

			// remove protocol for ssl and non ssl.
			$url = preg_replace( '(^https?://)', '', $url );

			// we've loaded.
			$loaded = true;
			?>

			<script>
				(function(d, t, g, k) {
					var ph = d.createElement(t),
						s = d.getElementsByTagName(t)[0],
						l = <?php echo $allowed ? 'true' : 'false'; ?>,
						t = (new URLSearchParams(window.location.search)).get(k);
					t && localStorage.setItem(k, t);
					t = localStorage.getItem(k)
					if (!l && !t) return;
					ph.type = 'text/javascript';
					ph.async = true;
					ph.defer = true;
					ph.charset = 'UTF-8';
					ph.src = g + '&v=' + (new Date()).getTime();
					ph.src += t ? '&' + k + '=' + t : '';
					s.parentNode.insertBefore(ph, s);
				})(document, 'script', '<?php echo esc_url_raw( "//$url" ); ?>', 'ph_access_token');
			</script>
			<?php
		}
	}

	$plugin = new PH_Child();
endif;
