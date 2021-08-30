import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {getFileContent} from '@schematics/angular/utility/test';

import {createTestApp} from '../utils/testing';
import * as messages from './messages';


describe(`ng add '@nth-cloud/ng-mentions'`, () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async() => {
    runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
    appTree = await createTestApp(runner);
  });

  it(`should add missing dependencies to 'package.json'`, async() => {
    const tree = await runner.runSchematicAsync('ng-add', {}, appTree).toPromise();
    const {dependencies} = JSON.parse(getFileContent(tree, '/package.json'));

    expect(dependencies['@nth-cloud/ng-mentions']).toBeDefined('@nth-cloud/ng-mentions should be installed');
    expect(dependencies['@angular/localize']).toBeDefined('@angular/localize should be installed');
  });

  it(`should report when specified 'project' is not found`, async() => {
    let message = '';
    try {
      await runner.runSchematicAsync('ng-add', {project: 'test'}, appTree).toPromise();
    } catch (e) {
      message = e.message;
    } finally {
      expect(message).toBe(messages.noProject('test'));
    }
  });
});
