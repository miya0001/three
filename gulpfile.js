'use strict';

var gulp = require( 'gulp' );
var download = require("gulp-download");
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task( 'download', function () {
	return download( [
			'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/Detector.js',
			'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/js/controls/DeviceOrientationControls.js',
		] )
		.pipe( gulp.dest( 'src' ) );
});

gulp.task( 'npm', function () {
	return gulp.src( [
			'node_modules/three.js/build/three.js'
		] )
		.pipe( gulp.dest( 'src' ) );
} );

gulp.task( 'default', [ 'download', 'npm' ], function(){
  return gulp.src( [
		  'src/*.js'
	  ] )
	  .pipe( uglify() )
	  .pipe( rename( {
		  extname: '.min.js'
	  } ) )
	  .pipe( gulp.dest( 'js' ) );
} );
