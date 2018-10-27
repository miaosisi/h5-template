"use strict";

// Gulp
var gulp = require("gulp");

// Utils
var del = require("del");
var gutil = require("gulp-util");
var $ = require("gulp-load-plugins")();

// Publish
var qn = require("gulp-qn");
var rev = require("gulp-rev-qn");
var revCollector = require("gulp-rev-collector");
var runSequence = require("run-sequence");
var scp = require("gulp-scp2");

// Browserify
var browserify = require("browserify");
var watchify = require("watchify");
var reactify = require("reactify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var assign = require("lodash.assign");

// Server
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var modRewrite = require("connect-modrewrite");
var config = require("./app/constants");

// Edit this values to best suit your app
var APP_DIR = "./app";
var BUILD_DIR = "./build";
var PUBLISH_DIR = "./publish";
var PROJ_NAME = config.projectName;

var paths = {
    html: APP_DIR + "/*.html",
    images: APP_DIR + "/img/*",
    icons: APP_DIR + "/icon/**/*.png",
    mainstyle: APP_DIR + "/style/styles.less",
    styles: APP_DIR + "/style/*.less",
    scripts: [APP_DIR + "/**/*.+(js|jsx)", "!" + APP_DIR + "/bundle.js"],
    mainjs: APP_DIR + "/app.jsx"
};

var qiniu_options = {
    accessKey: config.qiniu.accessKey,
    secretKey: config.qiniu.secretKey,
    bucket: config.qiniu.bucket,
    origin: config.qiniu.origin
};

// Compile LESS & auto-inject into browsers
gulp.task("less", function() {
    return gulp
        .src(paths.mainstyle)
        .pipe($.sourcemaps.init())
        .pipe(
            $.less().on("error", function(err) {
                console.log(err);
                // End the stream to prevent gulp from crashing
                this.emit("end");
            })
        )
        .pipe(
            $.autoprefixer({
                browsers: ["last 2 versions"]
            })
        )
        .pipe($.csso())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(APP_DIR + "/style"))
        .pipe(reload({ stream: true }));
});

gulp.task("less:build", function() {
    return gulp
        .src(paths.mainstyle)
        .pipe($.less())
        .pipe(
            $.autoprefixer({
                browsers: ["last 15 versions"]
            })
        )
        .pipe($.csso())
        .pipe(gulp.dest(BUILD_DIR + "/style"))
        .pipe($.size());
});

// html
gulp.task("html:build", function() {
    return gulp
        .src(paths.html)
        .pipe(gulp.dest(BUILD_DIR))
        .pipe($.size());
});

// img
gulp.task("image:build", function() {
    return gulp
        .src(paths.images)

        .pipe(gulp.dest(BUILD_DIR + "/img"))
        .pipe($.size());
});

// sprite
gulp.task("sprite", function() {
    var spriteData = gulp
        .src(paths.icons)
        .pipe($.plumber())
        .pipe(
            $.spritesmithMulti({
                spritesmith: function(opts) {
                    opts.imgPath = "../img/" + opts.imgName;
                    opts.cssName = opts.imgName.replace(".png", ".less");
                    opts.cssFormat = "less";
                    opts.cssTemplate = null;
                    console.log(opts.cssName);
                    return opts;
                }
            })
        );

    spriteData.img.pipe(gulp.dest(APP_DIR + "/img"));

    spriteData.css.pipe(gulp.dest(APP_DIR + "/style"));
});

// Make browserify bundle
gulp.task("browserify", function() {
    var customOpts = {
        entries: [paths.mainjs],
        debug: true,
        transform: [reactify]
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = watchify(browserify(opts));
    b.on("update", bundle);
    b.on("log", gutil.log);

    function bundle() {
        return (
            b
                .bundle()
                // log errors if they happen
                .on("error", gutil.log.bind(gutil, "Browserify Error"))
                .pipe(source("bundle.js"))
                // optional, remove if you don't need to buffer file contents
                .pipe(buffer())
                // optional, remove if you dont want sourcemaps
                .pipe($.sourcemaps.init({ loadMaps: true })) // loads map from browserify file
                // Add transformation tasks to the pipeline here.
                .pipe($.sourcemaps.write("./")) // writes .map file
                .pipe(gulp.dest(APP_DIR))
                .pipe(reload({ stream: true }))
        );
    }

    return bundle();
});

gulp.task("browserify:build", function() {
    var customOpts = {
        entries: [paths.mainjs],
        debug: false,
        transform: [reactify]
    };
    var opts = assign({}, watchify.args, customOpts);
    var b = browserify(opts);

    return (
        b
            .bundle()
            // log errors if they happen
            .on("error", gutil.log.bind(gutil, "Browserify Error"))
            .pipe(source("bundle.js"))
            .pipe(buffer())
            .pipe($.uglify().on("error", gutil.log))
            .pipe(gulp.dest(BUILD_DIR))
            .pipe($.size())
    );
});

// Jest
gulp.task("test", function() {});

// Publish font and Img
gulp.task("publish-img", function() {
    return gulp
        .src([
            BUILD_DIR + "/img/*.jpg",
            BUILD_DIR + "/img/*.gif",
            BUILD_DIR + "/img/*.png",
            BUILD_DIR + "/img/*.mp3",
            BUILD_DIR + "/img/*.mp4"
        ])
        .pipe(rev())
        .pipe(gulp.dest(PUBLISH_DIR + "/img"))
        .pipe(
            qn({
                qiniu: qiniu_options,
                prefix: PROJ_NAME + "/img/"
            })
        )
        .pipe(rev.manifest())
        .pipe(gulp.dest(PUBLISH_DIR + "/rev/img"));
});

// Publish JS
gulp.task("publish-js", function() {
    return gulp
        .src([PUBLISH_DIR + "/rev/img/rev-manifest.json", BUILD_DIR + "/*.js"])
        .pipe(
            revCollector({
                replaceReved: true,
                dirReplacements: {
                    "img/": ""
                }
            })
        )
        .pipe(rev())
        .pipe(gulp.dest(PUBLISH_DIR + "/js"))
        .pipe(
            qn({
                qiniu: qiniu_options,
                prefix: PROJ_NAME + "/js/"
            })
        )
        .pipe(rev.manifest())
        .pipe(gulp.dest(PUBLISH_DIR + "/rev/js"));
});

// Publish css
gulp.task("publish-css", function() {
    return gulp
        .src([
            PUBLISH_DIR + "/rev/img/rev-manifest.json",
            BUILD_DIR + "/style/*.css"
        ])
        .pipe(
            revCollector({
                replaceReved: true,
                dirReplacements: {
                    "../img/": ""
                }
            })
        )
        .pipe(rev())
        .pipe(gulp.dest(PUBLISH_DIR + "/style"))
        .pipe(
            qn({
                qiniu: qiniu_options,
                prefix: PROJ_NAME + "/css/"
            })
        )
        .pipe(rev.manifest())
        .pipe(gulp.dest(PUBLISH_DIR + "/rev/css"));
});

// Modify html for publish
gulp.task("publish-html", function() {
    return gulp
        .src([PUBLISH_DIR + "/rev/**/rev-manifest.json", BUILD_DIR + "/*.html"])
        .pipe(
            revCollector({
                replaceReved: true,
                dirReplacements: {
                    "./style/": "",
                    "./": ""
                }
            })
        )
        .pipe(
            scp({
                host: config.server.host,
                username: config.server.username,
                privateKey: require("fs").readFileSync(
                    config.server.privateKeyFile
                ),
                dest: "/srv/htdocs/" + PROJ_NAME
            })
        )
        .pipe(gulp.dest(PUBLISH_DIR));
});

// Start the server
gulp.task("browser-sync", function() {
    browserSync({
        port: 7000,
        server: {
            baseDir: APP_DIR,
            middleware: [
                modRewrite([
                    "!.html|.js|.css|.png|.jpg|.gif|.mp3|.mp4$ /index.html [L]"
                ])
            ]
        }
    });
});

gulp.task("default", ["browserify", "less", "sprite"], function() {
    gulp.start("browser-sync");
    gulp.watch(paths.styles, ["less"]);
    gulp.watch(paths.icons, ["sprite"]);
    gulp.watch(paths.html).on("change", reload);
});

gulp.task("build", ["clean"], function() {
    gulp.start("browserify:build", "less:build", "image:build", "html:build");
});

gulp.task("publish", function() {
    runSequence("publish-img", ["publish-css", "publish-js"], "publish-html");
});

gulp.task("clean", function(cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del([BUILD_DIR], cb);
});
