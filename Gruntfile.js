module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            test: {
                NODE_ENV: 'test'
            }
        },
        mochaTest: {
            test: {
                src: ['test/**/*.js'],
                options: {
                    require: ['should', 'coverage/blanket']
                }
            },
            watch: {
                options: {
                    growl: true
                },
                src: ['test/**/*.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage.html'
                },
                src: ['test/**/*.js']
            }
        },
        open: {
            coverage: {
                path: 'coverage.html'
            }
        },
        watch: {
            files: ['lib/**/*.js', 'test/**/*.js'],
            tasks: ['env:test', 'mochaTest:watch']
        }
    });

    grunt.registerTask('test', ['env:test', 'mochaTest:test']);
    grunt.registerTask('coverage', ['env:test', 'mochaTest:test', 'mochaTest:coverage', 'open:coverage']);

    grunt.registerTask('start', 'start xi-core and restart on changes', function() {
        var spawn = require('child_process').spawn;
        var cb = this.async();
        var xi = spawn('node', ['index.js', '--port=2014'],
                       {stdio: 'inherit', cwd: process.cwd()});
        xi.on('close', function(code) {
            if (code !== 0)
                grunt.log.error();
            cb();
        });
    });

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-open');
};
