// tslint:disable:max-line-length
import * as ejs from 'ejs';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';

import {parseDemo} from './parse-demo';

const stackblitzUrl = 'https://stackblitz.com/run';
const packageJson = fs.readJsonSync('package.json');

const versions = {
  ngMentions: packageJson.version,
  angular: getVersion('@angular/core'),
  typescript: getVersion('typescript'),
  rxjs: getVersion('rxjs'),
  zoneJs: getVersion('zone.js'),
  bootstrap: getVersion('bootstrap'),
  prismjs: getVersion('prismjs')
};

function capitalize(string) {
  if (string.indexOf('-') !== -1) {
    string = String(string).split('-').map(str => capitalize(str)).join('');
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function fileContent(...paths: string[]) {
  return fs.readFileSync(path.join(...paths)).toString();
}

function getVersion(name) {
  const value = (packageJson.dependencies || {})[name] || (packageJson.devDependencies || {})[name] ||
      (packageJson.peerDependencies || {})[name];
  if (!value) {
    throw new Error(`couldn't find version for ${name} in package.json`);
  }

  return value;
}

const indexFile = ejs.compile(fileContent('misc', 'stackblitz-templates', 'index.html.ejs'));
const mainFile = ejs.compile(fileContent('misc', 'stackblitz-templates', 'main.ts.ejs'));
const stackblitzFile = ejs.compile(fileContent('misc', 'stackblitz-templates', 'stackblitz.html.ejs'));

const base = path.join('demo', 'src', 'public', 'stackblitzes');
const root = path.join('demo', 'src', 'app', 'components');

const initialData = {
  stackblitzUrl,
  versions,
  dependencies: JSON.stringify({
    '@angular/animations': versions.angular,
    '@angular/core': versions.angular,
    '@angular/common': versions.angular,
    '@angular/compiler': versions.angular,
    '@angular/compiler-cli': versions.angular,
    '@angular/platform-browser': versions.angular,
    '@angular/platform-browser-dynamic': versions.angular,
    '@angular/router': versions.angular,
    '@angular/forms': versions.angular,
    '@angular/localize': versions.angular,
    '@nth-cloud/ng-mentions': versions.ngMentions,
    'rxjs': versions.rxjs,
    'typescript': versions.typescript,
    'zone.js': versions.zoneJs,
  }),
  tags: ['angular', 'mentions', 'ng-mentions', 'nth-cloud'],
  files: [
    {name: 'src/polyfills.ts', source: fileContent('misc', 'stackblitz-templates', 'polyfills.ts')},
    {name: 'tsconfig.json', source: fileContent('misc', 'stackblitz-templates', 'tsconfig.json')},
    {name: 'angular.json', source: fileContent('misc', 'stackblitz-templates', 'angular.json')},
  ]
};

// clear directories
fs.ensureDirSync(base);
fs.ensureDirSync(root);

// getting demo modules metadata
const modulesInfo = parseDemo(path.join(root, '**', 'demos', '*', '*.ts'));
for (const demoModule of modulesInfo.keys()) {
  const demoDir = path.normalize(path.dirname(demoModule));
  const demoFiles = glob.sync(path.join(demoDir, '*'), {});
  const[, componentName, , demoName] = demoDir.replace(root, '').split(path.sep);
  const modulePath = path.basename(demoModule, '.ts');
  const moduleInfo = modulesInfo.get(demoModule);

  const destinationDir = path.join(base, componentName, demoName);
  const stackblitzData = {
    ...initialData,
    componentName,
    demoName,
    ...moduleInfo,
    modulePath: `./app/${modulePath}`,
    title: `ng-mentions - ${capitalize(componentName)} - ${capitalize(demoName)}`,
    tags: [...initialData.tags],
    files: [...initialData.files],
    styles: '',
    openFile: `app/${moduleInfo.bootstrap.fileName}`
  };

  stackblitzData.tags.push(componentName);

  stackblitzData.files.push({name: 'src/index.html', source: indexFile(stackblitzData)});
  stackblitzData.files.push({name: 'src/main.ts', source: mainFile(stackblitzData)});
  for (const file of demoFiles) {
    const destFile = path.basename(file);
    stackblitzData.files.push({name: `src/app/${destFile}`, source: fs.readFileSync(file).toString()});
  }

  fs.ensureDirSync(destinationDir);
  fs.writeFileSync(path.join(destinationDir, 'stackblitz.html'), stackblitzFile(stackblitzData));
}

console.log(`generated ${modulesInfo.size} stackblitz(es) from demo sources.`);
