'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const rsync = require('gulp-rsync');
const gulpCopy = require('gulp-copy');
const terser = require('gulp-terser');

const targetPath = 'dist';
const rsyncConfig = require('./rsync-config.js')(targetPath);

async function styles() {
    await gulp.src('assets/styles/app.scss')
        .pipe(sass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(gulp.dest(targetPath + '/assets/styles'));
};

async function deploy() {
    await gulp.src(targetPath + '/**')
        .pipe(rsync(rsyncConfig));
    console.log('Deploy finished');
};

async function scripts() {
    await gulp.src('assets/scripts/**.js')
        .pipe(terser())
        .pipe(gulp.dest(targetPath + '/assets/scripts'));
};

async function serviceWorker() {
    await gulp.src('sw.js')
        .pipe(terser())
        .pipe(gulp.dest(targetPath + '/'));
};

async function html() {
    await gulp.src('index.html')
        .pipe(gulpCopy(targetPath + '/'));
};

async function manifest() {
    await gulp.src('manifest.json')
        .pipe(gulpCopy(targetPath + '/'));
};

async function images() {
    await gulp.src('assets/images/**')
        .pipe(gulpCopy(targetPath + '/'));
};

async function watch() {
    await gulp.series('styles', 'deploy');
    await gulp.watch('assets/styles/app.scss', gulp.series(styles, deploy));
    await gulp.watch('assets/scripts/**.js', gulp.series(scripts, deploy));
    await gulp.watch('sw.js', gulp.series(serviceWorker, deploy));
    await gulp.watch('assets/images/**', gulp.series(images, deploy));
    await gulp.watch('index.html', gulp.series(html, deploy));
    await gulp.watch('manifest.json', gulp.series(manifest, deploy));
};

exports.html = html;
exports.watch = watch;
exports.deploy = deploy;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.manifest = manifest;
exports.serviceWorker = serviceWorker;
exports.default = gulp.series(gulp.parallel(html, scripts, styles, images, manifest, serviceWorker), deploy);
