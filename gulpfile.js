const gulp = require('gulp');
const clangFormat = require('clang-format');
const gulpFormat = require('gulp-clang-format');

gulp.task('check-format', () => {
  return gulp.src(['gulpfile.js', 'misc/*.ts', 'src/**/*.ts', 'e2e-app/**/*.ts'])
      .pipe(gulpFormat.checkFormat('file', clangFormat))
      .on('warning', function() {
        console.log('See https://github.com/nth-cloud/ng-mentions/blob/master/DEVELOPER.md#clang-format');
        process.exit(1);
      });
});
