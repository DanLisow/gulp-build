const {src, dest, watch, parallel, series} = require('gulp');
const scss          = require('gulp-sass')(require('sass'));
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const del           = require('del');
const htmlmin       = require('gulp-htmlmin');
const pug           = require('gulp-pug');

function browsersync(){
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function images(){
    return src('app/img/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/img'))
}

function cleanDist(){
    return del('dist')
}

function template(){
    return src('app/pages/*.pug')
        .pipe(
            pug({
                pretty: true
            })
        )
        .pipe(dest('app'))
        .pipe(browserSync.stream())
}

function scripts(){
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles(){
    return src('app/scss/**/*.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function build(){
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
    .pipe(dest('dist'))
}

function watching(){
    watch(['app/scss/**/*.scss'], styles)
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts)
    watch(['app/pages/*.pug'], template)
}

exports.styles = styles;
exports.template = template;
exports.watching = watching;
exports.browsersync = browsersync;
exports.styles = scripts;
exports.cleanDist = cleanDist;
exports.images = images;


exports.build = series(cleanDist, images, build);
exports.default = parallel(template, styles, scripts, browsersync, watching);