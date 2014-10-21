module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                src: ['test/**/*.js']
            },
            watch: {
                options: {
                    growl: true
                },
                src: ['test/**/*.js']
            }
        },
        watch: {
            files: ['lib/**/*.js', 'test/**/*.js'],
            tasks: ['mochaTest:watch']
        }
    });

    grunt.registerTask('test', 'mochaTest:test');

    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
