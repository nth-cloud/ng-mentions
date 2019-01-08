let asyncDone = require('async-done');
let gulp = require('gulp');
let gutil = require('gulp-util');
let ddescribeIit = require('gulp-ddescribe-iit');
let shell = require('gulp-shell');
let ghPages = require('gulp-gh-pages');
let gulpFile = require('gulp-file');
let del = require('del');
let clangFormat = require('clang-format');
let gulpFormat = require('gulp-clang-format');
let tslint = require('gulp-tslint');
let webpack = require('webpack');
let exec = require('child_process').exec;
let path = require('path');
let os = require('os');
let remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

let PATHS = {
    src: 'src/**/*.ts',
    srcIndex: 'src/index.ts',
    specs: 'e2e/**/*.spec.ts',
    testHelpers: 'e2e/test/**/*.ts',
    demo: 'demo/**/*.ts',
    demoDist: 'demo/dist/**/*',
    typings: 'typings/index.d.ts',
    jasmineTypings: 'typings/globals/jasmine/index.d.ts',
    demoApiDocs: 'demo/src',
    coverageJson: 'coverage/json/coverage-final.json'
};

const docsConfig = Object.assign({port: 9090}, getLocalConfig());

function platformPath(path) {
    return /^win/.test(os.platform()) ? `${path}.cmd` : path;
}

function webpackCallBack(taskName, gulpDone) {
    return function (err, stats) {
        if (err) {
            throw new gutil.PluginError(taskName, err);
        }
        gutil.log(`[${taskName}]`, stats.toString());
        gulpDone();
    }
}

// Transpiling & Building
const cleanBuild = () => {
    return del('dist/');
};

const compileAngular = (done) => {
    let executable = path.join(__dirname, platformPath('/node_modules/.bin/ngc'));
    exec(`${executable} -p ./tsconfig-es2015.json`, (e) => {
        if (e) {
            console.log(e);
        }
        del('./dist/waste');
        done();
    }).stdout.on('data', function (data) {
        console.log(data);
    });
};

const compileUMD = (done) => {
    function ngExternal(ns) {
        let ng2Ns = `@angular/${ns}`;
        return {root: ['ng', ns], commonjs: ng2Ns, commonjs2: ng2Ns, amd: ng2Ns};
    }

    function rxjsExternal(context, request, cb) {
        if (/^rxjs\/add\/observable\//.test(request)) {
            return cb(null, {root: ['Rx', 'Observable'], commonjs: request, commonjs2: request, amd: request});
        } else if (/^rxjs\/add\/operator\//.test(request)) {
            return cb(null, {
                root: ['Rx', 'Observable', 'prototype'],
                commonjs: request,
                commonjs2: request,
                amd: request
            });
        } else if (/^rxjs\//.test(request)) {
            return cb(null, {root: ['Rx'], commonjs: request, commonjs2: request, amd: request});
        }
        cb();
    }

    webpack(
        {
            entry: './temp/index.js',
            mode: 'production',
            output: {filename: 'dist/bundles/ngx-mentions.js', library: 'ngx', libraryTarget: 'umd'},
            devtool: 'source-map',
            externals: [
                {
                    '@angular/core': ngExternal('core'),
                    '@angular/common': ngExternal('common'),
                    '@angular/forms': ngExternal('forms'),
                    '@ng-bootstrap/ng-bootstrap': {
                        root: ['@ng-bootstrap', 'ng-bootstrap'],
                        commonjs: '@ng-bootstrap/ng-bootstrap',
                        commonjs2: '@ng-bootstrap/ng-bootstrap',
                        amd: '@ng-bootstrap/ng-bootstrap'
                    }
                },
                rxjsExternal
            ]
        },
        webpackCallBack('webpack', done));
};

const packageNPM = () => {
    let pkgJson = require('./package.json');
    let targetPkgJson = {};
    let fieldsToCopy = ['version', 'description', 'keywords', 'author', 'repository', 'license', 'bugs', 'homepage'];

    targetPkgJson['name'] = 'ngx-mentions';

    fieldsToCopy.forEach(function (field) {
        targetPkgJson[field] = pkgJson[field];
    });

    targetPkgJson['main'] = 'bundles/ngx-mentions.js';
    targetPkgJson['module'] = 'index.js';
    targetPkgJson['typings'] = 'index.d.ts';

    targetPkgJson.peerDependencies = {};
    Object.keys(pkgJson.dependencies).forEach(function (dependency) {
        targetPkgJson.peerDependencies[dependency] = `${pkgJson.dependencies[dependency]}`;
    });

    return gulp.src('README.md')
        .pipe(gulpFile('package.json', JSON.stringify(targetPkgJson, null, 2)))
        .pipe(gulp.dest('dist'));
};

const updateChangelog = () => {
    let conventionalChangelog = require('gulp-conventional-changelog');
    return gulp.src('CHANGELOG.md', {})
        .pipe(conventionalChangelog({preset: 'angular', releaseCount: 1}, {
            // Override release version to avoid `v` prefix for git comparison
            // See https://github.com/conventional-changelog/conventional-changelog-core/issues/10
            currentTag: require('./package.json').version
        }))
        .pipe(gulp.dest('./'));
};

// Testing
function startKarmaServer(isTddMode, isSaucelabs, done) {
    let karmaServer = require('karma').Server;
    let travis = process.env.TRAVIS;

    let config = {configFile: `${__dirname}/karma.conf.js`, singleRun: !isTddMode, autoWatch: isTddMode};

    if (travis) {
        config['reporters'] = ['dots'];
        config['browsers'] = ['Firefox'];
    }

    if (isSaucelabs) {
        config['reporters'] = ['dots', 'saucelabs'];
        config['browsers'] =
            ['SL_CHROME', 'SL_FIREFOX', 'SL_IE10', 'SL_IE11', 'SL_EDGE16', 'SL_EDGE15', 'SL_SAFARI10', 'SL_SAFARI11'];

        if (process.env.TRAVIS) {
            let buildId = `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`;
            config['sauceLabs'] = {build: buildId, tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER};
            process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
        }
    }

    new karmaServer(config, done).start();
}

const cleanTests = () => {
    return del(['temp/', 'coverage/']);
};

const buildTests = (done) => {
    exec(path.join(__dirname, platformPath('/node_modules/.bin/tsc')), (e) => {
        if (e) {
            console.log(e);
        }
        done();
    }).stdout.on('data', function (data) {
        console.log(data);
    });
};

const describeIt = () => {
    return gulp.src(PATHS.specs).pipe(ddescribeIit({allowDisabledTests: false}));
};

const runTests = (done) => {
    startKarmaServer(false, false, () => {
        asyncDone(() => {
            return gulp.src(PATHS.coverageJson).pipe(remapIstanbul({reports: {'html': 'coverage/html'}}));
        }, done);
    });
};

const remapCoverage = () => {
    return gulp.src(PATHS.coverageJson).pipe(remapIstanbul({reports: {'html': 'coverage/html'}}));
};

const TDD = (done) => {
    let executable = path.join(__dirname, platformPath('/node_modules/.bin/tsc'));
    let startedKarma = false;

    exec(`${executable} -w`, (e) => {
        done(e && e.signal !== 'SIGINT' ? e : undefined);
    }).stdout.on('data', function (data) {
        console.log(data);

        // starting karma in tdd as soon as 'tsc -w' finishes first compilation
        if (!startedKarma) {
            startedKarma = true;
            startKarmaServer(true, false, function (err) {
                process.exit(err ? 1 : 0);
            });
        }
    });
};

const saucelabs = (done) => {
    startKarmaServer(false, true, function (err) {
        done(err);
        process.exit(err ? 1 : 0);
    });
};

// Formatting
function doCheckFormat() {
    return gulp
        .src([
            'gulpfile.js',
            'karma-test-shim.js',
            'misc/api-doc.js',
            'misc/api-doc.spec.js',
            'misc/demo-gen.js',
            PATHS.src
        ])
        .pipe(gulpFormat.checkFormat('file', clangFormat));
}

const lint = () => {
    return gulp.src([PATHS.src, PATHS.demo, '!demo/src/api-docs.ts'])
        .pipe(tslint({formatter: 'prose'}))
        .pipe(tslint.report({summarizeFailureOutput: true}));
};

const checkFormat = () => {
    return doCheckFormat().on('warning', function () {
        console.log('NOTE: this will be promoted to an ERROR in the continuous build');
    });
};

const enforceFormat = () => {
    return doCheckFormat().on('warning', function () {
        console.log('ERROR: You forgot to run clang-format on your change.');
        console.log('See https://github.com/trickeyone/ngx-mentions/blob/master/DEVELOPER.md#clang-format');
        process.exit(1);
    });
};

// Demo
const generateDocs = () => {
    let getApiDocs = require('./misc/get-doc');
    let docs = `const API_DOCS = ${JSON.stringify(getApiDocs(), null, 2)};\n\nexport default API_DOCS;`;

    return gulpFile('api-docs.ts', docs, {src: true}).pipe(gulp.dest(PATHS.demoApiDocs));
};

const generatePlunks = () => {
    let getPlunker = require('./misc/plunk-gen');
    let demoGenUtils = require('./misc/demo-gen-utils');
    let plunks = [];

    demoGenUtils.getDemoComponentNames().forEach(function (componentName) {
        plunks = plunks.concat(demoGenUtils.getDemoNames(componentName).reduce(function (soFar, demoName) {
            soFar.push({
                name: `${componentName}/demos/${demoName}/plnkr.html`,
                source: getPlunker(componentName, demoName)
            });
            return soFar;
        }, []));
    });

    return gulpFile(plunks, {src: true}).pipe(gulp.dest('demo/src/public/app/components'));
};

const cleanDemo = () => {
    return del('demo/dist');
};

const cleanDemoCache = () => {
    return del('.publish/');
};

const demoServer = shell.task([
    `webpack-dev-server --mode development --port ${docsConfig.port} --config webpack.demo.js --inline --progress`
]);

const buildDemo = shell.task(
    ['webpack --mode production --config webpack.demo.js --progress --profile --bail'],
    {env: {MODE: 'build'}}
);

const demoServerAOT = shell.task(
    [`webpack-dev-server --mode development --port ${
        docsConfig.port} --config webpack.demo.js --inline --progress`],
    {env: {MODE: 'build'}}
);

const pushDemo = () => {
    return gulp.src(PATHS.demoDist)
        .pipe(ghPages({remoteUrl: 'https://github.com/trickeyone/ngx-mentions.github.io.git', branch: 'master'}));
};

// Public Tasks

const buildTestsTask = gulp.series(cleanTests, buildTests);

gulp.task('clean:build', cleanBuild);
gulp.task('clean:tests', cleanTests);
gulp.task('clean:demo', cleanDemo);
gulp.task('clean:demo-cache', cleanDemoCache);
gulp.task('ngc', compileAngular);
gulp.task('umd', compileUMD);
gulp.task('npm', packageNPM);
gulp.task('changelog', updateChangelog);
gulp.task('build:tests', buildTestsTask);
gulp.task('ddescribe-iit', describeIt);

gulp.task('remap-coverage', remapCoverage);
gulp.task('lint', lint);
gulp.task('check-format', checkFormat);
gulp.task('enforce-format', enforceFormat);
gulp.task('generate-docs', generateDocs);
gulp.task('generate-plunks', generatePlunks);
gulp.task('demo-push', pushDemo);

const test = gulp.series(buildTestsTask, runTests);
const clean = gulp.parallel(cleanBuild, cleanTests, cleanDemo, cleanDemoCache);
const build = gulp.series(lint, enforceFormat, describeIt, test, cleanBuild, compileAngular, compileUMD, packageNPM);
const deployDemo = gulp.series(cleanDemo, buildDemo, pushDemo, cleanDemoCache);
const defaultTasks = gulp.series(lint, enforceFormat, describeIt, test);
const ci = gulp.series(defaultTasks, buildDemo);

gulp.task('demo-server', gulp.series(generateDocs, generatePlunks, demoServer));
gulp.task('build:demo', gulp.series(cleanDemo, generateDocs, generatePlunks, buildDemo));
gulp.task('demo-server:aot', gulp.series(generateDocs, generatePlunks, demoServerAOT));
gulp.task('saucelabs', gulp.series(buildTestsTask, saucelabs));
gulp.task('tdd', gulp.series(cleanTests, TDD));
gulp.task('test', test);
gulp.task('clean', clean);
gulp.task('build', build);
gulp.task('deploy-demo', deployDemo);
gulp.task('default', defaultTasks);
gulp.task('ci', ci);

function getLocalConfig() {
    try {
        require.resolve('./local.docs.json');
    } catch (e) {
        return {};
    }

    return require('./local.docs.json');
}
