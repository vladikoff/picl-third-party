"use strict";

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // watches files for changes, runs a task if there's a change
        watch: {
            data: {
                files: ["data/**/*", "lib/*", "packages/**/*"],
                tasks: ["default"]
            }
        }
    });

    // Load Tasks
    grunt.loadNpmTasks("grunt-contrib-watch");
    // temporary task to run cfx
    var spawn = require("child_process").spawn;
    grunt.registerTask("cfx", "Runs a server for devtools", function () {
        this.async();
        // create a temporary profile

        var cmd = ["run", "--profiledir", "tmp/addon-dev/profiles/profile8" ];
        if (grunt.option('mobile')) {
          cmd = "run -a fennec-on-device -b adb --mobile-app firefox_beta --force-mobile".split(' ');
        }

        var child = spawn("cfx", cmd);
        child.stderr.on("data", function (data) {
            if (data) {
                grunt.log.write(data.toString());
            }
        });

        child.stdout.on("data", function (data) {
            if (data) {
                grunt.log.write(data.toString());
            }
        });
    });

    // Register Tasks that can be ran
    grunt.registerTask("default", ["cfx"]);
    grunt.registerTask("dev", ["watch"]);
};
