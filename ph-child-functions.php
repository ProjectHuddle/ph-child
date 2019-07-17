<?php
/**
 * Functions used in the child plugin
 */

 /**
  * Is the current user allowed to comment?
  */
function ph_child_is_current_user_allowed_to_comment() {
	// if guests are allowed, yes, they are
	if ( get_option( 'ph-allow-guests', false ) ) {
		return true;
	}

	// otherwise, they must be logged in
	if ( ! is_user_logged_in() ) {
		return false;
	}

	// get enabled roles
	$enabled_roles = get_option( 'ph-enabled-comment-roles', false );

	// enable all if it hasn't been saved yet
	if ( false === $enabled_roles && is_bool( $enabled_roles ) ) {
		return true;
	}

	// otherwise filter by user
	$user  = wp_get_current_user();
	$roles = $user->roles;

	// if they have one of the enabled roles, they can comment
	foreach ( $roles as $role ) {
		if ( in_array( $role, $enabled_roles ) ) {
			return true;
		}
	}

	return false;
}
