<?php
/**
 * Functions used in the child plugin
 *
 * @package ProjectHuddle Child
 */

/**
 * Is the current user allowed to comment?
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
 */
function ph_child_dismiss_js() {
	?>
	<script>
		jQuery(function($) {
			$(document).on('click', '.ph-notice .notice-dismiss', function() {
				// Read the "data-notice" information to track which notice.
				var type = $(this).closest('.ph-notice').data('notice');
				// Since WP 2.8 ajaxurl is always defined in the admin header and points to admin-ajax.php.
				$.ajax(ajaxurl, {
					type: 'POST',
					data: {
						action: 'ph_child_dismissed_notice_handler',
						type: type
					}
				});
			});
		});
	</script>
	<?php
}

/**
 * Stores notice dismissing in options table
 */
function ph_child_ajax_notice_handler() {
	$type = isset( $_POST['type'] ) ? $_POST['type'] : false;
	// Store it in the options table.
	if ( $type ) {
		update_option( "dismissed-$type", true );
		update_site_option( "dismissed-$type", true );
	}
}

add_action( 'wp_ajax_ph_child_dismissed_notice_handler', 'ph_child_ajax_notice_handler' );

/**
 * Flywheel exclusions notice
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
			<p><strong>ProjectHuddle:</strong> ' . esc_html( sprintf( __( 'Flywheel hosting detected!  You\'ll need to request a cache exclusion in order for project access links to work correctly.', 'ph-child' ) ) ) . '</p>
			<p><a href="https://help.projecthuddle.com/article/229-flywheel-client-site-cache-exclusions" target="_blank">Learn More</a></p>
		</div>';
	ph_child_dismiss_js();
}
// phpcs:disable Squiz.Commenting.InlineComment.InvalidEndChar
// add_action('admin_notices', 'ph_child_flywheel_exclusions_notice');
// phpcs:enable

/**
 * WPEngine exclusion notice
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
			<p><strong>ProjectHuddle:</strong> ' . esc_html( sprintf( __( 'WPEngine hosting detected!  You\'ll need to request a cache exclusion in order for ProjectHuddle access links to work properly.', 'ph-child' ) ) ) . '</p>
			<p><a href="https://help.projecthuddle.com/article/228-wpengine-client-site-plugin-exclusions" target="_blank">Learn More</a></p>
		</div>';
	ph_child_dismiss_js();
}
// phpcs:disable Squiz.Commenting.InlineComment.InvalidEndChar
// add_action('admin_notices', 'ph_child_wpengine_exclusions_notice');
// phpcs:enable
