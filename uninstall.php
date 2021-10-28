<?php
/**
 * Uninstall ProjectHuddle Child Pkugin
 *
 * Deletes all the plugin data
 *
 * @package     ProjectHuddle Child
 * @subpackage  Uninstall
 * @copyright   Copyright (c) 2016, Andre Gagnon
 * @license     http://opensource.org/licenses/gpl-2.0.php GNU Public License
 * @since       1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// delete our options.
delete_option( 'ph_child_api_key' );
delete_option( 'ph_child_access_token' );
delete_option( 'ph_child_project_id' );
delete_option( 'ph_child_parent_url' );
delete_option( 'ph_child_signature' );
delete_option( 'ph_child_installed' );
delete_option( 'ph_child_admin_enabled' );
delete_option( 'ph_child_allow_guests' );
delete_option( 'ph_child_connection_status' );
delete_option( 'ph_child_commenters' );
delete_option( 'ph_child_manual_connection' );
