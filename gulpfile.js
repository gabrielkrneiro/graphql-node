const gulp  = require('gulp');
const clean = require('gulp-clean');
const ts    = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

gulp.task('clean', () => {

    return gulp
        .src('dist')
        .pipe(clean());
});


gulp.task('static', ['clean'], () => {
    
    return gulp
    .src(['src/**/*.json'])
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', ['static'], () => {

    return tsProject.src()
        .pipe(tsProject()) // compile
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['clean', 'static', 'scripts']);

gulp.task('watch', ['build'], () => {

    gulp.watch([
        'src/**/*.ts',
        'src/**/*.json'
    ], 
    [
        'build'
    ]);
});

gulp.task('default', ['watch']);
