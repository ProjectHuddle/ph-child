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

// delete our options
delete_option( 'ph-api-key' );
delete_option( 'ph-access-token' );
delete_option( 'ph-project-id' );
delete_option( 'ph-parent-url' );
delete_option( 'ph-signature' );
delete_option( 'ph-child-plugin-installed' );
delete_option( 'ph-admin-enabled' );
delete_option( 'ph-allow-guests' );
delete_option( 'ph_connection_status' );
delete_option( 'ph_commenters' );
delete_option( 'ph_manual_connection' );
