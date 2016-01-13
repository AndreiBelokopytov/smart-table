module.exports = function (grunt) {
  'use strict';

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
        style: 'expanded'
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
          'dist/smart-table.min.js': ['dist/smart-table.js']
        }
      }
    },
    concat: {
      dist: {
        options: {
          banner: ';(function () {\nvar SmartTable = {};\n',
          footer: '})();'
        },
        files: {
          'dist/smart-table.js': [
            'js/smart-table.utils.js',
            'js/smart-table.css.js',
            'js/smart-table.comparators.js',
            'js/smart-table.filters.js',
            'js/smart-table.columns.js',
            'js/smart-table.js',
            'js/polyfills.js'],
        },
      },
    },
    watch: {
      sass: {
        files: 'sass/*.sass',
        tasks: ['sass']
      },
      js: {
        files: 'js/*.js',
        tasks: ['concat']
      }
    },
  });

  grunt.registerTask('build', ['jshint', 'sass', 'concat', 'uglify']);
  grunt.registerTask('default', ['watch']);
};
