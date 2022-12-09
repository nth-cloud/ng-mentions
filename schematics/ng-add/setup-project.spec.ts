import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp} from '../utils/testing';

['app', 'second-app'].forEach(projectName => {
  describe(`ng-add-project-setup, 'project=${projectName}'`, () => {

    let runner: SchematicTestRunner;
    let log: string[] = [];

    beforeEach(() => {
      log = [];
      runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
      runner.logger.subscribe(({message}) => log.push(message));
    });

    it(`should add '@angular/localize' polyfill`, async() => {
      let tree = await createTestApp(runner);
      const polyfillFilePath = `projects/${projectName}/src/polyfills.ts`;

      expect(tree.read(polyfillFilePath) !.toString()).not.toContain('@angular/localize');

      tree = await runner.runSchematicAsync('ng-add-setup-project', projectName ? {project: projectName} : {}, tree)
                 .toPromise();
      expect(tree.read(polyfillFilePath) !.toString()).toContain('@angular/localize');
    });
  });
});
