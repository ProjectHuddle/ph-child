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
	<title><?php echo esc_html__( 'PH Responsive Site', 'Spectra' ) . ' | ' . esc_html( get_the_title() ); ?></title>
	<?php wp_head(); ?>
	<script>
		var ajaxurl = '<?php admin_url( 'admin-post.php', 'relative' ); ?>';
	</script>
</head>
<body class="<?php echo esc_attr( implode( ' ', $body_classes ) ); ?>">
<div id="spectra-editor-wrapper" style="height:100vh">
	<div id="app-root"></div>
    <?php $iframe_url = get_permalink( $_GET['post'] ) . '?action=spectra-edit'; ?>
    <iframe id="sepctra-frame" style="overflow:hidden;height:100%;width:100%" height="100vh" width="100%" src="<?php echo esc_url( $iframe_url ); ?>"></iframe>    
</div>
<?php
	wp_footer();
	/** This action is documented in wp-admin/admin-footer.php */
	do_action( 'admin_print_footer_scripts' );
?>
</body>
</html>