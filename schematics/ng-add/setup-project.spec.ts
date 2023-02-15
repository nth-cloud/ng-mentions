import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

import { createTestApp } from '../utils/testing';

['app', 'second-app'].forEach((projectName) => {
  describe(`ng-add-project-setup, 'project=${projectName}'`, () => {
    let runner: SchematicTestRunner;
    let log: string[] = [];

    beforeEach(() => {
      log = [];
      runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
      runner.logger.subscribe(({ message }) => log.push(message));
    });

    it(`should add '@angular/localize' polyfill`, async () => {
      let tree = await createTestApp(runner);
      const tsconfigFilePath = `projects/${projectName}/tsconfig.app.json`;
      expect(tree.read(tsconfigFilePath)!.toString()).not.toContain('@angular/localize');

      tree = await runner.runSchematic('ng-add-setup-project', projectName ? { project: projectName } : {}, tree);
      expect(tree.read(tsconfigFilePath)!.toString()).toContain('@angular/localize');
    });
  });
});
