import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { readWorkspace } from '@schematics/angular/utility';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';

import { getProjectTargetOptions } from '../../utils/project';
import * as messages from '../messages';
import { Schema } from '../schema';

const NG_MENTIONS_MODULE_NAME = 'NgMentionsModule';
const NG_MENTIONS_PACKAGE_NAME = '@nth-cloud/ng-mentions';

/**
 * Patches main application module by adding 'NgMentionsModule' import
 *
 * Relevant 'angular.json' structure is:
 *
 * {
 *   "projects" : {
 *     "projectName": {
 *       "architect": {
 *         "build": {
 *           "options": {
 *            "main": "src/main.ts"
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "defaultProject": "projectName"
 * }
 *
 */
export function addNgMentionsModuleToAppModule(options: Schema): Rule {
  return async (host: Tree) => {
    const workspace = await readWorkspace(host);
    const projectName = options.project || (workspace.extensions.defaultProject as string);

    // 1. get project by name
    const project = workspace.projects.get(projectName);
    if (!project) {
      throw new SchematicsException(messages.noProject(projectName));
    }

    // 2. get main file for project
    const projectBuildOptions = getProjectTargetOptions(project, 'build');
    const mainFilePath = projectBuildOptions.main as string;
    if (!mainFilePath || !host.read(mainFilePath)) {
      throw new SchematicsException(messages.noMainFile(projectName));
    }

    // 3. get main app module file
    const appModuleFilePath = getAppModulePath(host, mainFilePath);
    const appModuleFileText = host.read(appModuleFilePath);
    if (appModuleFileText === null) {
      throw new SchematicsException(messages.noModuleFile(appModuleFilePath));
    }

    // 4. adding 'NgMentionsModule' to the app module
    const appModuleSource = ts.createSourceFile(
      appModuleFilePath,
      appModuleFileText.toString('utf-8'),
      ts.ScriptTarget.Latest,
      true,
    );

    const changes = addImportToModule(
      appModuleSource,
      appModuleFilePath,
      NG_MENTIONS_MODULE_NAME,
      NG_MENTIONS_PACKAGE_NAME,
    );

    const recorder = host.beginUpdate(appModuleFilePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);
  };
}
