module.exports = function (grunt) {
  'use strict';
  
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
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
    watch: {
      sass: {
        files: 'sass/*.sass',
        tasks: ['sass']
      }
    },
  });

  grunt.registerTask('default', ['watch']);
};