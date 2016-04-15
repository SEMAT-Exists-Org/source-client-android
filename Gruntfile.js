// Main Gruntfile.js

'use strict';

// for performance reasons you can only match one level down with:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match search in all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    app: {
      // configurable paths
      app: 'www',
      url: '',
      default_local_server_url: 'http://localhost:8001'
    },

    // // bundle up all js resources into 1 file
    // browserify: {
    //   js: {
    //     // A single entry point for our app
    //     src: 'www/js/app.js',
    //     // Compile to a single file to add a script tag for in your HTML
    //     dest: 'www/js/bundle.js',
    //   },
    // },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= app.app %>/**/*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: 35730
        }
      },
      styles: {
        files: ['<%= app.app %>/**/*.css'],
        tasks: ['newer:copy:styles', 'autoprefixer']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= app.app %>/**/*.html',
          '<%= app.app %>/res/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9002,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35730
      },
      livereload: {
        options: {
          open: {
            target: '<%= app.url %>'
          },
          base: [
            '.tmp',
            '<%= app.app %>'
          ]
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      server: '.tmp'
    }    

  });

  // main task for serving HTML5 application 
  grunt.registerTask('serve', function (target) {
    if (target === 'local') {
      var conn = 'http://' + grunt.config.get('connect.options.hostname') + ':' +
        grunt.config.get('connect.options.port');
      var url = grunt.option('url') || grunt.config.get('app.default_local_server_url');
      grunt.config.set('app.url', conn + '/?url=' + url);
    } else {
      // open with no url passed to fh-js-sdk
      grunt.config.set('connect.livereload.options.open', true);
    }

    grunt.task.run([
      'clean:server',
      'connect:livereload',
      'watch'
    ]);
  });

  // default if running grunt without task specified
  grunt.registerTask('default', ['serve']);


};
