'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

var opts = {
    mocha: {
        reporter: 'spec',
        globals: [
            'setImmediate',
            'clearImmediate'
        ]
    }
};

gulp.task('test', function(){
    return gulp
        .src(['test/*.js'])
        .pipe(mocha(opts.mocha));
});

gulp.task('watch', function(){
    var watcher = gulp.watch(['lib/**', 'test/**'], ['test']);
    watcher.on('change', function(event){
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

function coverage(tests, output){
    return gulp
        .src(tests, {read: false})
        .pipe(cover.instrument({
            pattern: ['lib/**.js'],
            debugDirectory: 'debug'
        }))
        .pipe(mocha(opts.mocha))
        .pipe(cover.report({
            outFile: output
        }));
}

gulp.task('coverage', function () {
    return coverage(['test/*.js'], 'test/coverage.html');
});

gulp.task('default', ['test', 'watch']);
