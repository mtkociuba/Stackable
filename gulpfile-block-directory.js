const gulp = require( 'gulp' )

gulp.task( 'test2', c => {
	console.log( 'test called' )
	return c()
} )
