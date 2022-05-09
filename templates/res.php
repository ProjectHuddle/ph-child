<?php 

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

global $wp_version;

$body_classes = [
	'wp-version-' . str_replace( '.', '-', $wp_version ),
];

if ( is_rtl() ) {
	$body_classes[] = 'rtl';
}
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title><?php echo esc_html__( 'PH Responsive Site', 'PH' ) . ' | ' . esc_html( get_the_title() ); ?></title>
	<?php wp_head(); ?>
	<script>
		var ajaxurl = '<?php admin_url( 'admin-post.php', 'relative' ); ?>';
	</script>
</head>
<body class="<?php echo esc_attr( implode( ' ', $body_classes ) ); ?>">
<div id="ph-editor-wrapper" style="height:100vh">
	<div id="app-root"></div>
        
</div>
<?php
	wp_footer();
	/** This action is documented in wp-admin/admin-footer.php */
	do_action( 'admin_print_footer_scripts' );
?>
</body>
</html>