import {Rule, SchematicContext, SchematicsException, Tree} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';

import {getWorkspace} from '@schematics/angular/utility/workspace';

import {Schema} from './schema';
import * as messages from './messages';
import {addPackageToPackageJson, getPackageVersionFromPackageJson} from '../utils/package-config';

const NG_MENTIONS_VERSION = '5.0.0';

/**
 * This is executed when `ng add @nth-cloud/ng-mentions` is run.
 * It installs all dependencies in the 'package.json' and runs 'ng-add-setup-project' schematic.
 */
export default function ngAdd(options: Schema): Rule {
  return async (tree: Tree, context: SchematicContext) => {

    // Checking that project exists
    const {project} = options;
    if (project) {
      const workspace = await getWorkspace(tree);
      const projectWorkspace = workspace.projects.get(project);

      if (!projectWorkspace) {
        throw new SchematicsException(messages.noProject(project));
      }
    }

    // Installing dependencies
    const angularCoreVersion = getPackageVersionFromPackageJson(tree, '@angular/core') !;
    const angularLocalizeVersion = getPackageVersionFromPackageJson(tree, '@angular/localize');

    addPackageToPackageJson(tree, '@nth-cloud/ng-mentions', `^${NG_MENTIONS_VERSION}`);

    if (angularLocalizeVersion === null) {
      addPackageToPackageJson(tree, '@angular/localize', angularCoreVersion);
    }

    context.addTask(new RunSchematicTask('ng-add-setup-project', options), [
      context.addTask(new NodePackageInstallTask()),
    ]);
  };
}
