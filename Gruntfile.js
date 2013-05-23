"use strict";

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // watches files for changes, runs a task if there's a change
        watch: {
            data: {
                files: ["data/**/*", "lib/*"],
                tasks: ["default"]
            }
        }
    });

    // Load Tasks
    grunt.loadNpmTasks("grunt-contrib-watch");

    // temporary task to run cfx
    var spawn = require("child_process").spawn;
    grunt.registerTask('cfx', 'Runs a server for devtools', function () {
        this.async();
        var child = spawn('cfx', ['run']);
        child.stderr.on('data', function (data) {
            if (data) {
                grunt.log.write(data.toString());
            }
        });

        child.stdout.on('data', function (data) {
            if (data) {
                grunt.log.write(data.toString());
            }
        });
    });

    // Register Tasks that can be ran
    grunt.registerTask("default", ["cfx"]);
    grunt.registerTask("dev", ["watch"]);
};
