<?php

/**
 * Main PH_Child Class
 * Uses singleton design pattern
 *
 * @since 1.0.0
 */
final class PH_Child {

	/**
	 * Get things going
	 */
	public function __construct() {     }
	/**
	 * Checks compatibility blacklist.
	 *
	 * @param string $load Specifies if script should start loading.
	 */
	public function compatiblity_blacklist( $load ) {   }
	/**
	 * Show parent plugin activation notice.
	 */
	public function parent_plugin_activated_error_notice() {    }
	/**
	 * Show white label link.
	 *
	 * @param string $plugin_meta Specifies Plugin meta data.
	 * @param string $plugin_file Specifies Plugin file.
	 * @param string $plugin_data Specifies Plugin data.
	 * @param string $status Specifies Plugin status.
	 */
	public function white_label_link( $plugin_meta, $plugin_file, $plugin_data, $status ) {     }
	/**
	 * Apply white label.
	 *
	 * @param string $translated_text White label translated text.
	 * @param string $untranslated_text White label untranslated text.
	 * @param string $domain Plugin domain name.
	 */
	public function white_label( $translated_text, $untranslated_text, $domain ) {  }
	/**
	 * Add settings link to plugin list table
	 *
	 * @param  array $links Existing links.
	 *
	 * @since 1.0.0
	 * @return array        Modified links
	 */
	public function add_settings_link( $links ) {   }
	/**
	 * Make sure these are automatically removed after save
	 *
	 * @param array $args Passes disconnect args.
	 */
	public function remove_disconnect_args( $args ) {   }
	/**
	 * Maybe disconnect from parent site
	 *
	 * @return void
	 */
	public function maybe_disconnect() {    }
	/**
	 * Redirect to options page.
	 *
	 * @param string $plugin Plugin name.
	 */
	public function redirect_options_page( $plugin ) {  }
	/**
	 * Add option for when plugin is active
	 *
	 * @return void
	 */
	public function register_installation() {   }
	/**
	 * Delete option when deactivated
	 *
	 * @return void
	 */
	public function deregister_installation() {     }
	/**
	 * Whitelist our option in xmlrpc
	 *
	 * @param array $options whitelabel options.
	 */
	public function whitelist_option( $options ) {  }
	/**
	 * Create Menu
	 *
	 * @return void
	 */
	public function create_menu() {     }
	/**
	 * Add settings section from dashboard.
	 */
	public function options() {     }
	/**
	 * Return Plugin Name.
	 */
	public function plugin_name() {     }
	/**
	 * Return Plugin description.
	 */
	public function plugin_description() {  }
	/**
	 * Return Plugin author.
	 */
	public function plugin_author() {   }
	/**
	 * Return Plugin author url.
	 */
	public function plugin_author_url() {   }
	/**
	 * Return Plugin link.
	 */
	public function plugin_link() {     }
	/**
	 * Provides manual import functionality.
	 *
	 * @param string $val import content.
	 */
	public function manual_import( $val ) {     }
	/**
	 * Check commenters checklist.
	 */
	public function commenters_checklist() {    }
	/**
	 * Check if guests are allowed to comment.
	 */
	public function allow_guests() {    }
	/**
	 * Check if admin is allowed to comment.
	 */
	public function allow_admin() {     }
	/**
	 * Fetch connection status.
	 */
	public function connection_status() {   }
	/**
	 * Display help link for manual connection.
	 */
	public function help_link() {   }
	/**
	 * Manual connection content.
	 */
	public function manual_connection() {   }
	// Add custom js
	public function ph_custom_inline_script() {     }
	public function ph_user_data() {    }
	/**
	 * Feedback page - custom settings page content.
	 */
	public function options_page() {    }
	/**
	 * Check if valid cookie is available.
	 */
	public function has_valid_cookie() {    }
	/**
	 * Outputs the saved website script
	 * Along with and identify method to sync accounts
	 *
	 * @return void
	 */
	public function script() {  }
}
/**
 * Functions used in the child plugin
 *
 * @package ProjectHuddle Child
 */
/**
 * Is the current user allowed to comment?
 */
function ph_child_is_current_user_allowed_to_comment() { }
/**
 * Dismiss notice action handler
 */
function ph_child_dismiss_js() { }
/**
 * Stores notice dismissing in options table
 */
function ph_child_ajax_notice_handler() { }
/**
 * Flywheel exclusions notice
 */
function ph_child_flywheel_exclusions_notice() { }
// phpcs:disable Squiz.Commenting.InlineComment.InvalidEndChar
// add_action('admin_notices', 'ph_child_flywheel_exclusions_notice');
// phpcs:enable
/**
 * WPEngine exclusion notice
 */
function ph_child_wpengine_exclusions_notice() { }
\define( 'PH_CHILD_PLUGIN_DIR', \plugin_dir_path( __FILE__ ) );
\define( 'PH_CHILD_PLUGIN_URL', \plugin_dir_url( __FILE__ ) );
\define( 'PH_CHILD_PLUGIN_FILE', __FILE__ );
