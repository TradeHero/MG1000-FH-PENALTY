/*global module*/
module.exports = function (grunt) {
    "use strict";
    var sourceFiles, unitTestFiles, config;
    //  order is important
    sourceFiles = [
        'src/lib/thcanvas-v0.1.0.min.js',
        'src/main.js',
        'src/util/input.js',
        'src/ui/base.js',
        'src/ui/view.js',
        'src/ui/control.js',
        'src/util/atomic.js'
    ];
    unitTestFiles = [];
    // Project configuration.

    config = {
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n\n'
            },
            source: {
                src: sourceFiles,
                dest: 'dist/mg2-html-v<%= pkg.version %>.js'
            },
            test: {
                src: unitTestFiles,
                dest: 'tests/js/unitTests.js'
            }
        },
        replace: {
            dev: {
                options: {
                    variables: {
                        version: '<%= pkg.version %>',
                        date: '<%= grunt.template.today("yyyy-mm-dd") %>'
                    },
                    prefix: '@@'
                },
                files: [{
                    src: ['dist/mg2-html-v<%= pkg.version %>.js'],
                    dest: 'dist/mg2-html-v<%= pkg.version %>.js'
                }]
            },
            prod: {
                options: {
                    variables: {
                        version: '<%= pkg.version %>'
                    },
                    prefix: '@@'
                },
                files: [{
                    src: ['dist/mg2-html-Global-v<%= pkg.version %>.min.js'],
                    dest: 'dist/mg2-html-Global-v<%= pkg.version %>.min.js'
                }]
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> http://www.tradehero.mobi by TradeHero */\n'
            },
            build: {
                files: {
                    'dist/mg2-html-v<%= pkg.version %>.min.js': 'dist/mg2-html-v<%= pkg.version %>.js'
                }
            }
        },
        clean: {
            build: ['dist/*']
        },
        jshint: {
            options: {
                laxbreak: true
            },
            all: ['src/**/*.js']
        },
        strip: {
            dev: {
                src: 'dist/mg2-html-v<%= pkg.version %>.js',
                dest: 'dist/mg2-html-v<%= pkg.version %>.js',
                options: {
                    nodes: ['console.log', 'debug']
                }
            },
            prod: {
                src: 'dist/mg2-html-v<%= pkg.version %>.min.js',
                dest: 'dist/mg2-html-v<%= pkg.version %>.min.js',
                options: {
                    nodes: ['console.log', 'debug']
                }
            }
        }
    };
    for (var n = 0; n < sourceFiles.length; n++) {
        var inputFile = sourceFiles[n];
        var className = (inputFile.match(/[-_\w]+[.][\w]+$/i)[0]).replace('.js', '');
        var outputFile = 'dist/mg2-html-' + className + '-v<%= pkg.version %>.min.js';
        config.uglify.build.files[outputFile] = [inputFile];
    }
    grunt.initConfig(config);
    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-strip');
    // Tasks
    grunt.registerTask('dev', ['clean', 'concat:source', 'replace:dev']);
    grunt.registerTask('prod', ['clean', 'concat:source', 'replace:dev', 'uglify', 'replace:prod', 'strip:dev', 'strip:prod']);
    grunt.registerTask('test', ['concat:test']);
    grunt.registerTask('hint', ['clean', 'concat:source', 'replace:dev', 'jshint']);
};
