<?php
/**
 * Functions used in the child plugin
 *
 * @package ProjectHuddle Child
 */

/**
 * Is the current user allowed to comment?
 *
 * @return bool
 */
function ph_child_is_current_user_allowed_to_comment() {
	// if guests are allowed, yes, they are.
	if ( get_option( 'ph_child_allow_guests', false ) ) {
		return true;
	}

	// otherwise, they must be logged in.
	if ( ! is_user_logged_in() ) {
		return false;
	}

	// get enabled roles.
	$enabled_roles = get_option( 'ph_child_enabled_comment_roles', false );

	// enable all if it hasn't been saved yet.
	if ( false === $enabled_roles && is_bool( $enabled_roles ) ) {
		return true;
	}

	// otherwise filter by user.
	$user  = wp_get_current_user();
	$roles = $user->roles;

	// if they have one of the enabled roles, they can comment.
	foreach ( $roles as $role ) {
		if ( in_array( $role, $enabled_roles ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Dismiss notice action handler
 *
 * @return void
 */
function ph_child_dismiss_js() {
	$nonce = wp_create_nonce( 'ph_child_dismiss_nonce' );
	?>
	<script>
		jQuery(function($) {
			$(document).on('click', '.ph-notice .notice-dismiss', function() {
				// Read the "data-notice" information to track which notice.
				var type = $(this).closest('.ph-notice').data('notice');
				var nonce = '<?php echo esc_js( $nonce ); ?>'; // Include the nonce from PHP.
				// Since WP 2.8 ajax url is always defined in the admin header and points to admin-ajax.php.
				$.ajax(ajaxurl, {
					type: 'POST',
					data: {
						action: 'ph_child_dismissed_notice_handler',
						type: type,
						nonce: nonce // Include the nonce in the request.
					}
				});
			});
		});

	</script>
	<?php
}

/**
	 * List of plugins that we propose to install.
	 *
	 * @since 1.6.0
	 *
	 * @return array
	 */
	 function get_bsf_plugins() {

		$images_url = PH_CHILD_PLUGIN_URL . 'assets/images/settings/';

		$plugins = [

				'surerank/surerank.php'                        => [
				'icon'         => $images_url . 'surerank.svg',
				'type'         => 'plugin',
				'name'         => esc_html__( 'Boost Your Traffic with Easy SEO Optimization!', 'ph_child' ),
				'desc'         => esc_html__( 'Rank higher with effortless SEO optimization. SureRank offers a simple, clutter-free interface with lightweight code, minimal setup, clear meta and schema settings, and smart content optimization that actually makes sense, helping you grow your traffic easily.', 'ph_child' ),
				'wporg'        => 'https://wordpress.org/plugins/surerank/',
				'url'          => 'https://downloads.wordpress.org/plugin/surerank.zip',
				'siteurl'      => 'https://surerank.com/',
				'isFree'       => true,
				'slug'         => 'surerank',
				'status'       => get_plugin_status( 'surerank/surerank.php' ),
				'settings_url' => admin_url( 'admin.php?page=surerank_onboarding' ),
			],
			'surecart/surecart.php'                        => [
				'icon'         => $images_url . 'surecart.svg',
				'type'         => 'plugin',
				'name'         => esc_html__( 'Sell Products Effortlessly with SureCart!', 'ph_child' ),
				'desc'         => esc_html__( 'Sell your products effortlessly with a modern, flexible eCommerce system. SureCart makes it easy to set up one-click checkout, manage subscriptions, recover abandoned carts, and collect secure payments, helping you launch and grow your online store confidently.', 'ph_child' ),
				'wporg'        => 'https://wordpress.org/plugins/surecart/',
				'url'          => 'https://downloads.wordpress.org/plugin/surecart.zip',
				'siteurl'      => 'https://surecart.com/',
				'isFree'       => true,
				'slug'         => 'surecart',
				'status'       => get_plugin_status( 'surecart/surecart.php' ),
				'settings_url' => admin_url( 'admin.php?page=sc-getting-started' ),
			],
			'sureforms/sureforms.php'                      => [
				'icon'         => $images_url . 'sureforms.svg',
				'type'         => 'plugin',
				'name'         => esc_html__( 'Build Powerful Forms in Minutes with SureForms!', 'ph_child' ),
				'desc'         => esc_html__( 'Build powerful forms in minutes without complexity. SureForms lets you create contact forms, payment forms, and surveys using an AI-assisted, clean interface with conversational layouts, conditional logic, payment collection, and mobile optimization for a seamless experience.', 'ph_child' ),
				'wporg'        => 'https://wordpress.org/plugins/sureforms/',
				'url'          => 'https://downloads.wordpress.org/plugin/sureforms.zip',
				'siteurl'      => 'https://sureforms.com/',
				'slug'         => 'sureforms',
				'isFree'       => true,
				'status'       => get_plugin_status( 'sureforms/sureforms.php' ),
				'settings_url' => admin_url( 'admin.php?page=sureforms_menu' ),
			],
			'presto-player/presto-player.php'              => [
				'icon'         => $images_url . 'pplayer.svg',
				'type'         => 'plugin',
				'name'         => esc_html__( 'Add Engaging Videos Seamlessly with Presto Player!', 'ph_child' ),
				'desc'         => html_entity_decode( esc_html__( 'Add engaging videos seamlessly in minutes without complexity. Presto Player lets you enhance your website with videos using branding, chapters, and call-to-actions while providing fast load times, detailed analytics, and user-friendly controls for a seamless viewing experience.', 'ph_child' ) ),
				'wporg'        => 'https://wordpress.org/plugins/presto-player/',
				'url'          => 'https://downloads.wordpress.org/plugin/presto-player.zip',
				'siteurl'      => 'https://prestoplayer.com/',
				'slug'         => 'presto-player',
				'isFree'       => true,
				'status'       => get_plugin_status( 'presto-player/presto-player.php' ),
				'settings_url' => admin_url( 'edit.php?post_type=pp_video_block' ),
			],
			'suretriggers/suretriggers.php'                => [
				'icon'         => $images_url . 'OttoKit-Symbol-Primary.svg',
				'type'         => 'plugin',
				'name'         => esc_html__( 'Automate Your Workflows Easily with Ottokit!', 'ph_child' ),
				'desc'         => esc_html__( 'Automate workflows effortlessly in minutes without complexity. Ottokit lets you connect your WordPress site with web apps to automate tasks, sync data, and run actions using a clean visual builder with scheduling, filters, conditions, and webhooks for a seamless experience.', 'ph_child' ),
				'wporg'        => 'https://wordpress.org/plugins/suretriggers/',
				'url'          => 'https://downloads.wordpress.org/plugin/suretriggers.zip',
				'siteurl'      => 'https://ottokit.com/',
				'slug'         => 'suretriggers',
				'isFree'       => true,
				'status'       => get_plugin_status( 'suretriggers/suretriggers.php' ),
				'settings_url' => admin_url( 'admin.php?page=suretriggers' ),
			],

		];

		foreach ( $plugins as $key => $plugin ) {
			// Check if it's a plugin and is active.
			if ( 'plugin' === $plugin['type'] && is_plugin_active( $key ) ) {
				unset( $plugins[ $key ] );
			}

			if ( 'plugin' === $plugin['type'] && 'astra-sites/astra-sites.php' === $key ) {
				$st_pro_status = get_plugin_status( 'astra-pro-sites/astra-pro-sites.php' );
				if ( 'Installed' === $st_pro_status || 'Activated' === $st_pro_status ) {
					unset( $plugins[ $key ] );
				}
			}

			if ( 'theme' === $plugin['type'] ) {
				$current_theme = wp_get_theme();
				if ( $current_theme->get_stylesheet() === $plugin['slug'] ) {
					unset( $plugins[ $key ] );
				}
			}
		}

		return $plugins;
	}

	/**
	 * Get plugin status
	 *
	 * @since 0.0.1
	 *
	 * @param  string $plugin_init_file Plugin init file.
	 * @return string
	 */
	function get_plugin_status( $plugin_init_file ) {

		$installed_plugins = get_plugins();

		if ( ! isset( $installed_plugins[ $plugin_init_file ] ) ) {
			return 'Install';
		} elseif ( is_plugin_active( $plugin_init_file ) ) {
			return 'Activated';
		} else {
			return 'Installed';
		}
	}
	
	/**
	 * Get the status of a theme.
	 *
	 * @param string $theme_slug The slug of the theme.
	 * @return string The theme status: 'Activated', 'Installed', or 'Install'.
	 *
	 * @since 0.0.1
	 */
	 function get_theme_status( $theme_slug ) {
		$installed_themes = wp_get_themes();
	
		// Check if the theme is installed.
		if ( isset( $installed_themes[ $theme_slug ] ) ) {
			$current_theme = wp_get_theme();
		
			// Check if the current theme slug matches the provided theme slug.
			if ( $current_theme->get_stylesheet() === $theme_slug ) {
				return 'Activated'; // Theme is active.
			} else {
				return 'Installed'; // Theme is installed but not active.
			}
		} else {
			return 'Install'; // Theme is not installed at all.
		}
	}

/**
 * Stores notice dismissing in options table
 *
 * @return void
 */
function ph_child_ajax_notice_handler() {
	$type = isset( $_POST['type'] ) ? sanitize_text_field( $_POST['type'] ) : false;

	if ( current_user_can( 'manage_options' ) && check_ajax_referer( 'ph_child_dismiss_nonce', 'nonce' ) && $type ) {
		update_option( "dismissed-$type", true );
		update_site_option( "dismissed-$type", true );
	}

	wp_die(); // Always terminate AJAX requests with wp_die().
}

add_action( 'wp_ajax_ph_child_dismissed_notice_handler', 'ph_child_ajax_notice_handler' );


/**
 * Flywheel exclusions notice
 *
 * @return void
 */
function ph_child_flywheel_exclusions_notice() {
	// on wp flywheel.
	if ( ! defined( 'FLYWHEEL_CONFIG_DIR' ) ) {
		return;
	}

	// dismissed notice.
	if ( get_site_option( 'dismissed-ph-flywheel-child', false ) ) {
		return;
	}

	echo '<div class="notice notice-info is-dismissible ph-notice" data-notice="ph-flywheel-child">
			<p><strong>SureFeedback:</strong> ' . esc_html( sprintf( __( 'Flywheel hosting detected!  You\'ll need to request a cache exclusion in order for project access links to work correctly.', 'ph-child' ) ) ) . '</p>
			<p><a href="https://surefeedback.com/docs/flywheel-client-site-cache-exclusions" target="_blank">Learn More</a></p>
		</div>';
	ph_child_dismiss_js();
}
// phpcs:disable Squiz.Commenting.InlineComment.InvalidEndChar
// add_action('admin_notices', 'ph_child_flywheel_exclusions_notice');
// phpcs:enable

/**
 * WPEngine exclusion notice
 *
 * @return void
 */
function ph_child_wpengine_exclusions_notice() {
	// on wp engine.
	if ( ! defined( 'WPE_APIKEY' ) ) {
		return;
	}

	// dismissed notice.
	if ( get_site_option( 'dismissed-ph-wp-engine-child', false ) ) {
		return;
	}

	echo '<div class="notice notice-info is-dismissible ph-notice" data-notice="ph-wp-engine-child">
			<p><strong>SureFeedback:</strong> ' . esc_html( sprintf( __( 'WPEngine hosting detected!  You\'ll need to request a cache exclusion in order for SureFeedback access links to work properly.', 'ph-child' ) ) ) . '</p>
			<p><a href="https://surefeedback.com/docs/wpengine-client-site-plugin-exclusions" target="_blank">Learn More</a></p>
		</div>';
	ph_child_dismiss_js();
}
// phpcs:disable Squiz.Commenting.InlineComment.InvalidEndChar
// add_action('admin_notices', 'ph_child_wpengine_exclusions_notice');
// phpcs:enable
