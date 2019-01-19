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
        console.log('See https://github.com/nth-cloud/ng-mentions/blob/master/DEVELOPER.md#clang-format');
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

const gutil = require('gulp-util');
const del = require('del');
const webpack = require('webpack');
const runSequence = require('run-sequence');
const exec = require('child_process').exec;
const path = require('path');
const os = require('os');

function platformPath(path) {
  return /^win/.test(os.platform()) ? `${path}.cmd` : path;
}

function webpackCallBack(taskName, gulpDone) {
  return function(err, stats) {
    if (err) throw new gutil.PluginError(taskName, err);
    gutil.log(`[${taskName}]`, stats.toString());
    gulpDone();
  }
}

gulp.task('clean:build', function() { return del('dist/'); });
gulp.task('ngc', function(cb) {
  var executable = path.join(__dirname, platformPath('/node_modules/.bin/ngc'));
  exec(`${executable} -p ./tsconfig-es2015.json`, (e) => {
    if (e) console.log(e);
    del('./dist/waste');
    cb();
  }).stdout.on('data', function(data) { console.log(data); });
});

gulp.task('umd', function(cb) {
  function ngExternal(ns) {
    var ng2Ns = `@angular/${ns}`;
    return {root: ['ng', ns], commonjs: ng2Ns, commonjs2: ng2Ns, amd: ng2Ns};
  }

  function rxjsExternal(context, request, cb) {
    if (/^rxjs\/add\/observable\//.test(request)) {
      return cb(null, {root: ['Rx', 'Observable'], commonjs: request, commonjs2: request, amd: request});
    } else if (/^rxjs\/add\/operator\//.test(request)) {
      return cb(null, {root: ['Rx', 'Observable', 'prototype'], commonjs: request, commonjs2: request, amd: request});
    } else if (/^rxjs\//.test(request)) {
      return cb(null, {root: ['Rx'], commonjs: request, commonjs2: request, amd: request});
    }
    cb();
  }

  webpack(
    {
      entry: './temp/index.js',
      output: {filename: 'dist/bundles/ng-mentions.js', library: 'nthm', libraryTarget: 'umd'},
      devtool: 'source-map',
      externals: [
        {
          '@angular/core': ngExternal('core'),
          '@angular/common': ngExternal('common'),
          '@angular/forms': ngExternal('forms')
        },
        rxjsExternal
      ]
    },
    webpackCallBack('webpack', cb));
});

gulp.task('npm', function() {
  var pkgJson = require('./src/package.json');
  var targetPkgJson = {};
  Object.keys(pkgJson).forEach(function(field) { targetPkgJson[field] = pkgJson[field]; });

  targetPkgJson['main'] = 'bundles/ng-mentions.js';
  targetPkgJson['module'] = 'index.js';
  targetPkgJson['typings'] = 'index.d.ts';

  return gulp.src(['README.md', 'LICENSE'])
    .pipe(gulpFile('package.json', JSON.stringify(targetPkgJson, null, 2)))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', function(done) {
  runSequence('clean:build', 'ngc', 'umd', 'npm', done);
});