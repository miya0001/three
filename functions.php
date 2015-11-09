<?php

add_action( 'after_setup_theme', 'three_theme_after_setup_theme' );

function three_theme_after_setup_theme() {
	remove_action( 'after_setup_theme', 'twentythirteen_custom_header_setup', 11 );
}

add_action( 'wp_enqueue_scripts', 'three_theme_enqueue_styles' );

function three_theme_enqueue_styles() {
	wp_enqueue_style( 'dashicons' );

	wp_enqueue_style(
		'twentythirteen-style',
		get_stylesheet_directory_uri() . '/twentythirteen.css'
	);

	wp_enqueue_style(
		'three-style',
		get_stylesheet_directory_uri() . '/style.css',
		array('twentythirteen-style')
	);

	wp_enqueue_script(
		'threejs',
		get_stylesheet_directory_uri() . '/js/three.min.js',
		array(),
		'0.1.0',
		true
	);

	wp_enqueue_script(
		'threejs-detector',
		get_stylesheet_directory_uri() . '/js/Detector.min.js',
		array( 'threejs' ),
		'0.1.0',
		true
	);

	wp_enqueue_script(
		'threejs-deviceorientation',
		get_stylesheet_directory_uri() . '/js/DeviceOrientationControls.min.js',
		array( 'threejs' ),
		'0.1.0',
		true
	);

	wp_enqueue_script(
		'three-theme',
		get_stylesheet_directory_uri() . '/js/three-theme.min.js',
		array( 'threejs-detector' ),
		'0.1.0',
		true
	);
}

add_action( "wp_head", "three_theme_wp_head" );

function three_theme_wp_head() {
?>
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<script type="text/javascript">
		var three_theme_root = "<?php echo esc_js( get_stylesheet_directory_uri() ); ?>";
		<?php if ( is_home() ): ?>
		var is_home = true;
		<?php else: ?>
		var is_home = false;
		<?php endif; ?>
	</script>
<?php
}

add_action( "wp_footer", "three_theme_wp_footer" );

function three_theme_wp_footer() {
?>
<script id="vs" type="x-shader/x-vertex">
	varying vec2 vUv;
	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	}
</script>

<script id="fs" type="x-shader/x-fragment">
	uniform sampler2D map;
	uniform vec3 fogColor;
	uniform float fogNear;
	uniform float fogFar;
	varying vec2 vUv;
	void main() {
		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float fogFactor = smoothstep( fogNear, fogFar, depth );

		gl_FragColor = texture2D( map, vUv );
		gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
		gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
	}
</script>
<?php
}
