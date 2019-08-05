<?php
/**
 * Plugin Name: ProjectHuddle Client Site
 * Plugin URI: http://projecthuddle.io
 * Description: Connect a website to ProjectHuddle
 * Author: Andre Gagnon
 * Version: 1.0.3
 *
 * Requires at least: 5.2
 * Tested up to: 5.2.2
 *
 * Text Domain: ph-child
 * Domain Path: languages
 *
 * @package ProjectHuddle Child
 * @author Andre Gagnon
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

// include child functions
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
		protected $whitelist_option_names = array();

		/**
		 * Get things going
		 */
		public function __construct() {
			$this->whitelist_option_names = array(
				'ph_child_id'           => array(
					'description'       => __( 'Website project ID.', 'project-huddle' ),
					'sanitize_callback' => 'intval',
				),
				'ph_child_api_key'      => array(
					'description'       => __( 'Public API key for the script loader.', 'project-huddle' ),
					'sanitize_callback' => 'sanitize_text_field',
				),
				'ph_child_access_token' => array(
					'description'       => __( 'Access token to verify access to be able to register and leave comments.', 'project-huddle' ),
					'sanitize_callback' => 'sanitize_text_field',
				),
				'ph_child_parent_url'   => array(
					'description'       => __( 'Parent Site URL.', 'project-huddle' ),
					'sanitize_callback' => 'esc_url',
				),
				'ph_child_signature'    => array(
					'description'       => __( 'Secret signature to verify identity.', 'project-huddle' ),
					'sanitize_callback' => 'sanitize_text_field',
				),
				'ph_child_installed'    => array(
					'description'       => __( 'Is the plugin installed?', 'project-huddle' ),
					'sanitize_callback' => 'boolval',
				),
			);

			// options and menu
			add_action( 'admin_init', array( $this, 'options' ) );
			add_action( 'admin_menu', array( $this, 'create_menu' ) );

			// show script on front end and maybe admin
			add_action( 'wp_footer', array( $this, 'script' ) );
			if ( get_option( 'ph_child_admin', false ) ) {
				add_action( 'admin_footer', array( $this, 'script' ) );
			}

			// whitelist our blog options
			add_filter( 'xmlrpc_blog_options', array( $this, 'whitelist_option' ) );

			// maybe disconnect from parent site
			add_action( 'admin_init', array( $this, 'maybe_disconnect' ) );

			// remove disconnect args after successful disconnect
			add_filter( 'removable_query_args', array( $this, 'remove_disconnect_args' ) );

			// update registration option in database for parent site reference
			register_activation_hook( PH_CHILD_PLUGIN_FILE, array( $this, 'register_installation' ) );
			register_deactivation_hook( PH_CHILD_PLUGIN_FILE, array( $this, 'deregister_installation' ) );

			// redirect to the options page after activating
			add_action( 'activated_plugin', array( $this, 'redirect_options_page' ) );

			// Add settings link to plugins page
			add_filter( 'plugin_action_links_' . plugin_basename( PH_CHILD_PLUGIN_FILE ), array( $this, 'add_settings_link' ) );
		}

		/**
		 * Add settings link to plugin list table
		 *
		 * @param  array $links Existing links
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
		 * @param array $args
		 * @return void
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

			// nonce check
			if ( ! isset( $_GET['ph-child-site-disconnect-nonce'] ) || ! wp_verify_nonce( $_GET['ph-child-site-disconnect-nonce'], 'ph-child-site-disconnect-nonce' ) ) {
				wp_die( 'That\'s not allowed' );
			}

			foreach ( $this->whitelist_option_names as $name => $items ) {
				delete_option( $name );
			}
		}

		public function redirect_options_page( $plugin ) {
			if ( $plugin == plugin_basename( __FILE__ ) ) {
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
		 * @param array $options
		 * @return void
		 */
		public function whitelist_option( $options ) {
			foreach ( $this->whitelist_option_names as $name => $item ) {
				$options[ $name ] = array(
					'desc'     => esc_html( $item['description'] ),
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
			add_options_page(
				__( 'Feedback Connection', 'ph-child' ),
				__( 'Feedback', 'ph-child' ),
				'manage_options',
				'feedback-connection-options',
				array( $this, 'options_page' )
			);
		}

		public function options() {
			add_settings_section(
				'ph_general_section', // ID
				__( 'General Settings', 'ph-child' ), // title
				'__return_false', // description
				'ph_child_general_options' // Page on which to add this section of options
			);

			add_settings_field(
				'ph_child_enabled_comment_roles',
				__( 'Who should comment?', 'ph-child' ),
				array( $this, 'commenters_checklist' ),   // The name of the function responsible for rendering the option interface
				'ph_child_general_options',    // The page on which this option will be displayed
				'ph_general_section',         // The name of the section to which this field belongs
				false
			);

			// Finally, we register the fields with WordPress
			register_setting(
				'ph_child_general_options',
				'ph_child_enabled_comment_roles'
			);

			add_settings_field(
				'ph_child_allow_guests',
				__( 'Allow Guests', 'ph-child' ),
				array( $this, 'allow_guests' ),   // The name of the function responsible for rendering the option interface
				'ph_child_general_options',    // The page on which this option will be displayed
				'ph_general_section',         // The name of the section to which this field belongs
				false
			);

			// regsister setting
			register_setting(
				'ph_child_general_options',
				'ph_child_allow_guests',
				array(
					'type' => 'boolean',
				)
			);

			add_settings_field(
				'ph_child_admin',
				__( 'Admin Commenting', 'ph-child' ),
				array( $this, 'allow_admin' ),   // The name of the function responsible for rendering the option interface
				'ph_child_general_options',    // The page on which this option will be displayed
				'ph_general_section',         // The name of the section to which this field belongs
				false
			);

			// regsister setting
			register_setting(
				'ph_child_general_options',
				'ph_child_admin',
				array(
					'type' => 'boolean',
				)
			);

			add_settings_section(
				'ph_connection_status_section', // ID
				__( 'Connection', 'ph-child' ), // title
				'__return_false', // description
				'ph_child_connection_options' // Page on which to add this section of options
			);

			add_settings_field(
				'ph_connection_status',
				__( 'Connection Status', 'ph-child' ),
				array( $this, 'connection_status' ),   // The name of the function responsible for rendering the option interface
				'ph_child_connection_options',    // The page on which this option will be displayed
				'ph_connection_status_section',         // The name of the section to which this field belongs
				false
			);

			add_settings_field(
				'ph_child_manual_connection',
				__( 'Manual Connection Details', 'ph-child' ),
				array( $this, 'manual_connection' ),   // The name of the function responsible for rendering the option interface
				'ph_child_connection_options',    // The page on which this option will be displayed
				'ph_connection_status_section',         // The name of the section to which this field belongs
				false
			);

			// regsister setting
			register_setting(
				'ph_child_connection_options',
				'ph_child_manual_connection',
				array(
					'type'              => 'string',
					'sanitize_callback' => array( $this, 'manual_import' ),
				)
			);

		}

		public function manual_import( $val ) {
			$settings = json_decode( $val, true );

			// update manual import
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
			}
		}

		public function allow_guests() {
			?>
			<input type="checkbox" name="ph_child_allow_guests" <?php checked( get_option( 'ph_child_allow_guests', false ), 'on' ); ?>> 
			<?php esc_html_e( 'Allow guests to comment', 'ph-child' ); ?><br>
			<?php
		}

		public function allow_admin() {
			?>
			<input type="checkbox" name="ph_child_admin" <?php checked( get_option( 'ph_child_admin', false ), 'on' ); ?>> 
			<?php esc_html_e( 'Allow commenting in the admin.', 'ph-child' ); ?><br>
			<?php
		}

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
				if ( $connection = get_option( 'ph_child_parent_url', false ) ) {
					 echo '<p class="ph-badge ph-connected">' . sprintf( __( 'Connected to %s', 'ph-child' ), esc_url( $connection ) ) . '</p>';
					 echo '<p class="submit">';
					echo '<a class="button button-secondary" href="' . esc_url(
						add_query_arg(
							array(
								'ph-child-site-disconnect' => 1,
								'ph-child-site-disconnect-nonce' => wp_create_nonce( 'ph-child-site-disconnect-nonce' ),
							),
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

		public function manual_connection() {
			?>
			<p><?php esc_html_e( 'If you are having trouble connecting, you can manually connect by pasting the connection details below', 'ph-child' ); ?></p><br>
			<textarea name="ph_child_manual_connection" style="width:500px;height:300px"></textarea>
			<?php
		}

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
					" class="nav-tab <?php echo $active_tab === 'connection' ? 'nav-tab-active' : ''; ?>">
						<?php esc_html_e( 'Connection', 'ph-child' ); ?>
					</a>
				</h2>


				<form method="post" action="options.php">
					<?php
					if ( 'general' === $active_tab ) {
						settings_fields( 'ph_child_general_options' );
						do_settings_sections( 'ph_child_general_options' );
					} elseif ( 'connection' === $active_tab ) {
						settings_fields( 'ph_child_connection_options' );
						do_settings_sections( 'ph_child_connection_options' );
					}
					submit_button();
					?>
				</form>		
			</div>
			<?php
		}

		public function token_valid() {
			if ( ! $token = get_option( 'ph_child_access_token', '' ) ) {
				return false;
			}

			// get token from url
			$url_token = isset( $_GET['ph_access_token'] ) ? sanitize_text_field( $_GET['ph_access_token'] ) : '';

			// does it match
			return $url_token === $token;
		}

		/**
		 * Outputs the saved website script
		 * Along with and identify method to sync accounts
		 *
		 * @return void
		 */
		public function script() {
			// check to see if they are allowed to comment
			if ( ! $this->token_valid() ) {
				if ( ! ph_child_is_current_user_allowed_to_comment() ) {
					return;
				}
			}

			// settings must be set
			if ( ! $url = get_option( 'ph_child_parent_url' ) ) {
				echo '<!-- ProjectHuddle: parent url not set -->';
				return;
			}
			if ( ! $id = get_option( 'ph_child_id' ) ) {
				echo '<!-- ProjectHuddle: project id not set -->';
				return;
			}

			// build url
			$url = add_query_arg(
				array(
					'p'               => (int) $id,
					'ph_apikey'       => get_option( 'ph_child_api_key', '' ),
					'ph_access_token' => get_option( 'ph_child_access_token', '' ),
				),
				$url
			);

			// identify user and send signature for verification
			if ( is_user_logged_in() ) :
				$user = wp_get_current_user();

				$url = add_query_arg(
					array(
						'ph_user_name'  => $user->display_name,
						'ph_user_email' => sanitize_email( $user->user_email ),
						'ph_signature'  => hash_hmac( 'sha256', sanitize_email( $user->user_email ), get_option( 'ph_child_signature', false ) ),
						'ph_query_vars' => filter_var( get_option( 'ph_child_admin', false ), FILTER_VALIDATE_BOOLEAN ),
					),
					$url
				);
			else :
				$url = add_query_arg(
					array(
						'ph_signature' => hash_hmac( 'sha256', 'guest', get_option( 'ph_child_signature', false ) ),
					),
					$url
				);
			endif;

			// remove protocol for ssl and non ssl
			$url = preg_replace( '(^https?://)', '', $url );
			?>

			<script>
				(function (d, t, g) {
					var ph    = d.createElement(t), s = d.getElementsByTagName(t)[0];
					ph.type   = 'text/javascript';
					ph.async   = true;
					ph.charset = 'UTF-8';
					ph.src     = g + '&v=' + (new Date()).getTime();
					s.parentNode.insertBefore(ph, s);
				})(document, 'script', '//<?php echo $url; ?>');
			</script>
			<?php
		}
	}

	$plugin = new PH_Child();
endif;
