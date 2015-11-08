
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

		euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us
		quaternion.setFromEuler( euler );                               // orient the device
		quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top
		quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation
	}
}();

var container;
var camera, scene, renderer, controls, enable_animate;
var mesh, geometry, material;

var mouseX = 0, mouseY = 0;
var start_time = Date.now();

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();

function init() {
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor( new THREE.Color( 0x326696 ) );

	document.getElementById( 'masthead' ).appendChild( renderer.domElement );

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1000 );

	window.addEventListener( 'deviceorientation', setOrientationControls, true );

	var texture = THREE.ImageUtils.loadTexture( three_theme_root + '/img/cloud.png', null, animate );
	texture.magFilter = THREE.LinearMipMapLinearFilter;
	texture.minFilter = THREE.LinearMipMapLinearFilter;

	var fog = new THREE.Fog( 0x4584b4, - 100, 3000 );

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
		plane.position.y = - Math.random() * Math.random() * 200 - 50;
		plane.position.z = i;
		plane.rotation.z = Math.random() * Math.PI;
		plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;

		geometry.mergeMesh( plane );
	}

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	mesh = new THREE.Mesh( geometry, material );
	mesh.position.z = - 8000;
	scene.add( mesh );

	window.addEventListener( 'resize', onWindowResize, false );
}

function setOrientationControls( e ) {
	if ( ! e.alpha ) {
		return;
	}

	enable_animate = true;
	controls = new THREE.DeviceOrientationControls( camera, true );
	window.removeEventListener( 'deviceorientation', setOrientationControls, true );
}

function onWindowResize( event ) {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	position = ( ( Date.now() - start_time ) * 0.01 ) % 8000;
	camera.position.x = camera.position.x * 0.01;
	camera.position.y = camera.position.y * 0.01;
	camera.position.z = -position + 8000;
	if ( enable_animate ) {
		controls.device_update();
	}
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

( function( $ ){
	$( 'a.scroll' ).click( function() {
		var speed = 500;
		var href= $( this ).attr( "href" );
		var target = $( href == "#" || href == "" ? 'html' : href );
		var position = target.offset().top;
		$( "html, body" ).animate( { scrollTop:position }, speed, "swing" );
		return false;
	} );
} )( jQuery );
