


module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint : {
			options : {
				reporter : require('jshint-stylish')
			},
			target : ['js/*.js']
		},
		watch: {
			scripts : {
				files: [
					'Gruntfile.js',
					'server.js',
					'js/*.js'
					],
				tasks : ['jshint']
			}
		}
	});


	require('load-grunt-tasks')(grunt);

	// Heroku buildpack
	grunt.registerTask('heroku', ['jshint']);

	grunt.registerTask('default', ['jshint']);

};