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

THREE.DeviceOrientationControls.prototype.device_update = function () {
	if ( this.enabled === false ) return;

	var alpha  = this.deviceOrientation.alpha ? THREE.Math.degToRad( this.deviceOrientation.alpha ) : 0; // Z
	var beta   = this.deviceOrientation.beta  ? THREE.Math.degToRad( this.deviceOrientation.beta  ) : 0; // X'
	var gamma  = this.deviceOrientation.gamma ? THREE.Math.degToRad( this.deviceOrientation.gamma ) : 0; // Y''
	var orient = this.screenOrientation       ? THREE.Math.degToRad( this.screenOrientation       ) : 0; // O

	setObjectQuaternion( this.object.quaternion, alpha, beta, gamma, orient );
};

var setObjectQuaternion = function () {
	var zee = new THREE.Vector3( 0, 0, 1 );
	var euler = new THREE.Euler();
	var q0 = new THREE.Quaternion();
	var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

	return function ( quaternion, alpha, beta, gamma, orient ) {
		if ( beta < 1.2) {
			beta = 1.2;
		}

		euler.set( beta , alpha, -gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
		quaternion.setFromEuler( euler );                               // orient the device
		quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top
		quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
	}
}();

var container;
var camera, scene, renderer, controls, enable_orientation_controls;
var mesh, geometry, material;

var start_time = Date.now();

var windowHeight;
if ( is_home ) {
	windowHeight = window.innerHeight;
} else {
	windowHeight = jQuery( '#masthead' ).height();
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

	for ( var i = 0; i < 2000; i++ ) {
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
	camera.aspect = window.innerWidth / windowHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, windowHeight );
}

function animate() {
	position = ( ( Date.now() - start_time ) * 0.01 ) % 2000;
	camera.position.z = -position + 2000;
	if ( enable_orientation_controls ) {
		controls.device_update();
	}
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
