import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

function createWorkspace(runner: SchematicTestRunner): Promise<UnitTestTree> {
  return runner.runExternalSchematic('@schematics/angular', 'workspace', {
    name: 'workspace',
    version: '13.0.0',
    newProjectRoot: 'projects',
  });
}

/**
 * Creates a sample workspace with two applications: 'app' (default) and 'second-app'
 */
export async function createTestApp(runner: SchematicTestRunner, appOptions = {}): Promise<UnitTestTree> {
  let tree = await createWorkspace(runner);
  tree = await runner
    /* eslint-disable-next-line deprecation/deprecation */
    .runExternalSchematicAsync('@schematics/angular', 'application', { name: 'app', ...appOptions }, tree)
    .toPromise();

  return (
    runner
      /* eslint-disable-next-line deprecation/deprecation */
      .runExternalSchematicAsync('@schematics/angular', 'application', { name: 'second-app', ...appOptions }, tree)
      .toPromise()
  );
}
