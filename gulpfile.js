const gulp = require('gulp');
const ghPages = require('gulp-gh-pages');
const gulpFile = require('gulp-file');
const clangFormat = require('clang-format');
const gulpFormat = require('gulp-clang-format');

gulp.task('changelog', () => {
  const conventionalChangelog = require('gulp-conventional-changelog');
  return gulp.src('CHANGELOG.md', {})
      .pipe(conventionalChangelog({preset: 'angular', releaseCount: 1}, {
        // Override release version to avoid `v` prefix for git comparison
        // See https://github.com/conventional-changelog/conventional-changelog-core/issues/10
        currentTag: require('./package.json').version
      }))
      .pipe(gulp.dest('./'));
});

gulp.task('check-format', () => {
  return gulp.src(['gulpfile.js', 'misc/api-doc.js', 'misc/api-doc.spec.js', 'misc/demo-gen.js', 'src/**/*.ts'])
      .pipe(gulpFormat.checkFormat('file', clangFormat))
      .on('warning', function() {
        console.log('See https://github.com/nth-cloud/ngx-mentions/blob/master/DEVELOPER.md#clang-format');
        process.exit(1);
      });
});

// Docs

gulp.task('generate-docs', () => {
  const getApiDocs = require('./misc/get-doc');
  const docs = `const API_DOCS = ${JSON.stringify(getApiDocs(), null, 2)};\n\nexport default API_DOCS;`;

  return gulpFile('api-docs.ts', docs, {src: true}).pipe(gulp.dest('demo/src'));
});

gulp.task('generate-plunks', () => {
  const getPlunker = require('./misc/plunk-gen');
  const demoGenUtils = require('./misc/demo-gen-utils');
  let plunks = [];

  demoGenUtils.getDemoComponentNames().forEach(function(componentName) {
    plunks = plunks.concat(demoGenUtils.getDemoNames(componentName).reduce(function(soFar, demoName) {
      soFar.push({name: `${componentName}/demos/${demoName}/plnkr.html`, source: getPlunker(componentName, demoName)});
      return soFar;
    }, []));
  });

  return gulpFile(plunks, {src: true}).pipe(gulp.dest('demo/src/public/app/components'));
});

gulp.task('statics', () => {
  return gulp.src(['LICENSE', 'README.md']).pipe(gulp.dest('dist'));
});

gulp.task('generate-demo-statics', gulp.parallel(['generate-docs', 'generate-plunks']));
gulp.task('demo-push', () => {
  return gulp.src('demo/dist/**/*').pipe(ghPages({branch: 'gh-pages'}));
});
