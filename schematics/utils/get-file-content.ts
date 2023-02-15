/**
 * Copied from Angular source:
 * https://github.com/angular/angular-cli/blob/main/packages/schematics/angular/utility/test/get-file-content.ts
 */

import { Tree } from '@angular-devkit/schematics';

export function getFileContent(tree: Tree, path: string): string {
  const fileEntry = tree.get(path);

  if (!fileEntry) {
    throw new Error(`The file (${path}) does not exist.`);
  }

  return fileEntry.content.toString();
}
