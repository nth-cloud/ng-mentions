import {chain, externalSchematic, Rule} from '@angular-devkit/schematics';

import {Schema} from './schema';
import {addNgMentionsModuleToAppModule} from './steps/add-ngm-module';

/**
 * Sets up a project with all required to run ng-bootstrap.
 * This is run after 'package.json' was patched and all dependencies installed
 */
export default function ngAddSetupProject(options: Schema): Rule {
  return chain([
    addNgMentionsModuleToAppModule(options),
    externalSchematic('@angular/localize', 'ng-add', options.project ? {name: options.project} : {}),
  ]);
}
