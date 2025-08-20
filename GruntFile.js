module.exports = function (grunt) {
  "use strict";

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    addtextdomain: {
      options: {
        textdomain: "ph-child",
      },
      update_all_domains: {
        options: {
          updateDomains: true,
        },
        src: [
          "*.php",
          "**/*.php",
          "!.git/**/*",
          "!bin/**/*",
          "!node_modules/**/*",
          "!tests/**/*",
        ],
      },
    },

    wp_readme_to_markdown: {
      your_target: {
        files: {
          "README.md": "readme.txt",
        },
      },
    },

    makepot: {
      target: {
        options: {
          domainPath: "/languages",
          exclude: [".git/*", "bin/*", "node_modules/*", "tests/*"],
          mainFile: "ph-child.php",
          potFilename: "ph-child.pot",
          potHeaders: {
            poedit: true,
            "x-poedit-keywordslist": true,
          },
          type: "wp-plugin",
          updateTimestamp: true,
        },
      },
    },

    compress: {
      main: {
        options: {
          archive: "ph-child.zip",
        },
        files: [
          {
            src: [
              "**/*",
              "!node_modules/**",
              "!tests/**",
              "!.git/**",
              "!bin/**",
            ],
            dest: "/",
          },
        ],
      },
    },
  });

  grunt.loadNpmTasks("grunt-wp-i18n");
  grunt.loadNpmTasks("grunt-wp-readme-to-markdown");
  grunt.loadNpmTasks("grunt-contrib-compress");

  // Custom task to build Vue.js assets
  grunt.registerTask("build-vue", "Build Vue.js assets", function() {
    var done = this.async();
    var spawn = require('child_process').spawn;
    grunt.log.writeln("Building Vue.js assets...");
    var build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
    build.on('close', function(code) {
      if (code !== 0) {
        grunt.fail.fatal('Vue.js build failed with code ' + code);
      }
      grunt.log.writeln("Vue.js assets built successfully.");
      done();
    });
  });

  grunt.registerTask("i18n", ["addtextdomain", "makepot"]);
  grunt.registerTask("readme", ["wp_readme_to_markdown"]);
  grunt.registerTask("build", ["build-vue", "i18n"]);
  grunt.registerTask("release", ["build", "compress"]);

  grunt.util.linefeed = "\n";
};
