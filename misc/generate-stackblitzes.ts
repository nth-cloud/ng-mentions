// tslint:disable:max-line-length
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as he from 'he';

const stackblitzUrl = 'https://stackblitz.com/run?file=src/app/app.component.ts';

const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
const ngMentions = JSON.parse(fs.readFileSync('src/package.json').toString()).version;
const versions = getVersions();

function capitalize(string) {
  if (string.indexOf('-') !== -1) {
    string = String(string).split('-').map(str => capitalize(str)).join('');
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const ENTRY_CMPTS = {
  'mentions-basic': ['NthdMentionsBasic'],
  'mentions-custom-search': ['NthdMentionsCustomSearch'],
  'mentions-string-values': ['NthdMentionsStringValues'],
  'mentions-validation': ['NthdMentionsValidation'],
};

function getFileContents(filepath) {
  return fs.readFileSync(filepath).toString();
}


function getStackblitzTemplate(path) {
  return getFileContents(`misc/builder-templates/${path}`);
}

function generatePackageJson() {
  return {
    name: 'angular.example',
    version: '0.0.0',
    description: 'Angular Example',
    license: 'MIT',
    scripts: {
      ng: 'ng',
      start: 'ng serve',
      build: 'ng build',
      watch: 'ng build --watch --configuration development',
      test: 'ng test'
    },
    private: true,
    dependencies: Object.assign({}, packageJson.dependencies, {'@nth-cloud/ng-mentions': versions.ngMentions}),
    devDependencies: packageJson.peerDependencies || {},
    engines: {
      node: '^14.15.0'
    }
  };
}


function generateStackblitzContent(componentName, demoName) {
  const fileName = `${componentName}-${demoName}`;
  const basePath = `demo/src/app/components/${componentName}/demos/${demoName}/${fileName}`;

  const files = glob.sync('**/*', {nodir: true, cwd: 'misc/builder-templates', dot: true}).reduce(
    (carry: any, file: string) => {
      carry[file] = getStackblitzTemplate(file);

      return carry;
    },
    {
      'package.json': JSON.stringify(generatePackageJson(), null, 2),
      'src/index.html': generateIndexHtml(),
      'src/app/app.module.ts': generateAppModuleTsContent(componentName, demoName, basePath + '.ts'),
      'src/app/app.component.html': generateAppComponentHtmlContent(componentName, demoName)
    }
  );
  files[`src/app/${fileName}.ts`] = fs.readFileSync(`${basePath}.ts`).toString();
  files[`src/app/${fileName}.html`] = fs.readFileSync(`${basePath}.html`).toString();

  return `<!DOCTYPE html>
<html lang="en">
<body>
  <form id="mainForm" method="post" action="${stackblitzUrl}" target="_self">
    <input type="hidden" name="description" value="Example usage of the ${
      componentName} widget from https://nth-cloud.github.io/ng-mentions">
${generateTags([
    'Angular', 'Bootstrap', 'ng-mentions', capitalize(componentName)
  ])}
    ${Object.keys(files).map(
      filename => `<input type="hidden" name="project[files][${filename}]" value="${he.encode(files[filename])}">`
  ).join('\n')}
    <input type="hidden" name="project[template]" value="node">
  </form>
  <script>document.getElementById("mainForm").submit();</script>
</body>
</html>`;
}

function generateIndexHtml() {
  return `<!DOCTYPE html>
<html>

  <head>
    <title>ng-mentions demo</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/${
      versions.bootstrap}/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.15.0/themes/prism.css" />
  </head>

  <body>
    <my-app>loading...</my-app>
  </body>

</html>`;
}

function generateAppComponentHtmlContent(componentName, demoName) {
  const demoSelector = `nthd-${componentName}-${demoName}`;

  return `
<div class="container-fluid">

  <hr>

  <p>
    This is a demo example forked from the <strong>ng-mentions</strong> project: Angular powered Bootstrap.&nbsp;
    Visit <a href="https://nth-cloud.github.io/ng-mentions/" target="_blank">https://nth-cloud.github.io/ng-mentions</a> for&nbsp;
    more widgets and demos.
  </p>

  <hr>

  <${demoSelector}></${demoSelector}>
</div>
`;
}

function generateAppModuleTsContent(componentName, demoName, filePath) {
  const demoClassName = `Nthd${capitalize(componentName)}${capitalize(demoName)}`;
  const demoImport = `./${componentName}-${demoName}`;
  const entryCmptClasses = (ENTRY_CMPTS[`${componentName}-${demoName}`] || []).join(', ');
  const demoImports = entryCmptClasses ? Array.from(new Set([demoClassName, entryCmptClasses])).join(', ') : demoClassName;
  const file = fs.readFileSync(filePath).toString();
  if (!file.includes(demoClassName)) {
    throw new Error(`Expecting demo class name in ${filePath} to be '${demoClassName}' (note the case)`);
  }

  return `
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgMentionsModule } from '@nth-cloud/ng-mentions';
import { AppComponent } from './app.component';
import { ${demoImports} } from '${demoImport}';

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule, NgMentionsModule],
  declarations: [AppComponent, ${demoImports}]${entryCmptClasses ? `,\n  entryComponents: [${entryCmptClasses}],` : ','}
  bootstrap: [AppComponent]
})
export class AppModule {}
`;
}

function generateTags(tags) {
  return tags.map((tag, idx) => `    <input type="hidden" name="tags[${idx}]" value="${tag}">`).join('\n');
}

function getVersions() {
  return {
    ngMentions,
    bootstrap: getVersion('bootstrap').replace('^', '')
  };
}

function getVersion(name, givenPackageJson?: {dependencies, devDependencies}) {
  if (!givenPackageJson) {
    givenPackageJson = packageJson;
  }

  const value = (givenPackageJson.dependencies || {})[name] || (givenPackageJson.devDependencies || {})[name];

  if (!value) {
    throw new Error(`couldn't find version for ${name} in package.json`);
  }

  return value;
}

function getDemoComponentNames(): string[] {
  const path = 'demo/src/app/components/*/';

  return glob.sync(path, {})
      .map(dir => dir.substr(0, dir.length - 1))
      .map(dirNoEndingSlash => dirNoEndingSlash.substr(dirNoEndingSlash.lastIndexOf('/') + 1))
      .sort();
}

function getDemoNames(componentName: string): string[] {
  const path = `demo/src/app/components/${componentName}/demos/*/`;

  return glob.sync(path, {})
      .map(dir => dir.substr(0, dir.length - 1))
      .map(dirNoEndingSlash => dirNoEndingSlash.substr(dirNoEndingSlash.lastIndexOf('/') + 1))
      .sort();
}

/**
 * Generates StackBlitzes for all demos of all components and puts
 * resulting html files to the public folder of the demo application
 */

const base = 'demo/src/public/app/components';

// removing folder
fs.ensureDirSync(base);
fs.emptyDirSync(base);

// re-creating all stackblitzes
getDemoComponentNames().forEach(componentName => {
  getDemoNames(componentName).forEach(demoName => {
    const file = `${base}/${componentName}/demos/${demoName}/stackblitz.html`;
    fs.ensureFileSync(file);
    fs.writeFileSync(file, generateStackblitzContent(componentName, demoName));
  });
});
