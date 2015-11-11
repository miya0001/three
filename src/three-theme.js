( function( $ ){
	if ( $( '.home' ).length ) {
		var nav_icon = $( '<div id="nav-icon" />' );
		nav_icon.html( '<a class="scroll" data-speed="1000" href="#main"><span class="dashicons dashicons-arrow-down-alt2"></span></a>' );
		$( '#masthead' ).append( nav_icon );

		$( 'a.scroll' ).click( function() {
			var speed = 500;
			var href= $( this ).attr( "href" );
			var target = $( href == "#" || href == "" ? 'html' : href );
			var position = target.offset().top;
			$( "html, body" ).animate( { scrollTop:position }, speed, "swing" );
			return false;
		} );
	}
} )( jQuery );


if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container;
var camera, scene, renderer, controls, enable_orientation_controls;
var mesh, geometry, material;

var start_time = Date.now();

var windowHeight;
if ( window.innerHeight > jQuery( '#masthead' ).height() ) {
	windowHeight = jQuery( '#masthead' ).height();
} else {
	windowHeight = window.innerHeight;
}

init();

function init() {
	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, windowHeight );

	var three = document.createElement('div');
	three.id = 'three';
	three.appendChild( renderer.domElement );
	document.getElementById( 'masthead' ).appendChild( three );

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / windowHeight, 1, 500 );

	window.addEventListener( 'deviceorientation', setOrientationControls, true );

	var texture = THREE.ImageUtils.loadTexture( three_theme_root + '/img/cloud.png', null, animate );
	texture.magFilter = THREE.LinearMipMapLinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;

	var fog = new THREE.Fog( 0x326696, 100, 500 );

	material = new THREE.ShaderMaterial( {
		uniforms: {
			"map": { type: "t", value: texture },
			"fogColor" : { type: "c", value: fog.color },
			"fogNear" : { type: "f", value: fog.near },
			"fogFar" : { type: "f", value: fog.far },
		},
		vertexShader: document.getElementById( 'vs' ).textContent,
		fragmentShader: document.getElementById( 'fs' ).textContent,
		depthWrite: false,
		depthTest: false,
		transparent: true
	} );

	var geometry = new THREE.Geometry();
	var plane = new THREE.Mesh( new THREE.PlaneGeometry( 64, 64 ) );

	for ( var i = 0; i < 8000; i++ ) {
		plane.position.x = Math.random() * 1000 - 500;
		plane.position.y = - Math.random() * Math.random() * 200 - 20;
		plane.position.z = i;
		plane.rotation.z = Math.random() * Math.PI;
		plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

		geometry.mergeMesh( plane );
	}

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.z = -500;
	scene.add( mesh );

	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'orientationchange', onWindowResize, false );
}

function setOrientationControls( e ) {
	if ( ! e.alpha ) {
		return;
	}

	enable_orientation_controls = true;
	controls = new THREE.DeviceOrientationControls( camera, true );
	window.removeEventListener( 'deviceorientation', setOrientationControls, true );
}

function onWindowResize( event ) {
	if ( window.innerHeight > jQuery( '#masthead' ).height() ) {
		windowHeight = jQuery( '#masthead' ).height();
	} else {
		windowHeight = window.innerHeight;
	}

	camera.aspect = window.innerWidth / windowHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, windowHeight );
}

function animate() {
	var position = ( ( Date.now() - start_time ) * 0.01 ) % 8000;
	if ( position > 8000 ) {
		return;
	}
	camera.position.z = -position + 8000;
	if ( enable_orientation_controls ) {
		controls.update();
	}
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
