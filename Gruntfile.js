module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
        sourceMap: true,
        outputStyle: 'expanded'
      },
      dist: {
        files: [
          {
            src: 'sass/smart-table.sass',
            dest: 'css/smart-table.css'
          },
          {
            src: 'sass/smart-table.theme.default.sass',
            dest: 'css/smart-table.theme.default.css'
          }
        ]
      }
    },
    jshint: {
      options: {
        ignores: ['**/vendor/**'],
        reporter: require('jshint-stylish'),
        jshintrc: true
      },
      validate: ['js/*.js', 'examples/**/*.js']
    },
    uglify: {
      options: {
        banner: 
          '/*!\n' +
          ' * <%= pkg.name %> - v<%= pkg.version %>\n' +
          ' * Developed by Andrei Belokopytov\n' +
          ' * Licensed under the MIT license\n' +
          ' *\n' +
          ' */\n',
        sourceMap: true
      },
      js: {
        files: {
          'dist/smart-table.min.js': ['js/smart-table.js']
        }
      }
    },
    watch: {
      sass: {
        files: 'sass/*.sass',
        tasks: ['sass']
      }
    },
  });

  grunt.registerTask('build', ['jshint', 'sass', 'uglify']);
  grunt.registerTask('default', ['watch']);
};
