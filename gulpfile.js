const { src, dest, watch } = require('gulp');
const gulp = require('gulp')
const sass = require('gulp-sass');
const minifyCSS = require('gulp-csso');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

var gutil = require('gulp-util');
var rimraf = require('rimraf');
var path = require('path');
var through = require('through2');

const rev = require('gulp-rev');
const revoutdated = require('gulp-rev-outdated');
const revreplace = require('gulp-rev-replace');

const browserSync = require('browser-sync').create();

function cleaner() {
    return through.obj(function (file, enc, cb) {
        rimraf(path.resolve((file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

function cleanJS() {
    return src(['divi-child/js/*.js'], { read: false })
        .pipe(revoutdated(1)) // leave 1 latest asset file
        .pipe(cleaner());
}

function cleanCSS() {
    return src(['divi-child/css/*.css'], { read: false })
        .pipe(revoutdated(1))
        .pipe(cleaner());
}


function css() {
    return src('./sass/*.scss', { sourcemaps: true })
        .pipe(sass())
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(dest('./divi-child/css/'), { sourcemaps: true })
        .pipe(rev.manifest({
            merge:true
        }))
        .pipe(dest('./'))
        .pipe(browserSync.stream());
}

function js() {
    return src('./js/*.js', { sourcemaps: true })
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('build.min.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(dest('./divi-child/js/', { sourcemaps: true }))
        .pipe(rev.manifest({
            merge:true
        }))
        .pipe(dest('./'));
}

function assetpaths() {
    var manifest = gulp.src('./rev-manifest.json');
    return src('./php/functions.php')
        .pipe(revreplace({manifest:manifest,replaceInExtensions:['.php','.html']}))
        .pipe(dest('./divi-child/'))
}

function browser() {
    browserSync.init({
        proxy: 'http://b39j9a.myraidbox.de/',
        files: [
            './divi-child/*.css',
            './divi-child/*.js',
            './divi-child/*.php'
        ],
        reloadDelay:800,
        open:false,
    });

    watch('./sass/**/*.scss', gulp.series([css, assetpaths, cleanCSS]));
    watch('./js/*.js', gulp.series([js, assetpaths, cleanJS])).on('change', browserSync.reload);
}

exports.css = css;
exports.js = js;
exports.assetpaths = assetpaths;
exports.default = browser;