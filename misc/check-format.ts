
import {execSync as exec} from 'child_process';
import {join} from 'path';

const baseDir = join(__dirname, '..');
const options = {
  cwd: baseDir
};

const checkFormat = function() {
  const paths = ['misc/*.ts', 'src/**/*.ts', 'e2e-app/**/*.ts', 'schematics/**/*.ts', 'playwright/**/*.ts'];
  const hints = [];

  paths.forEach((path) => {
    const execCmd = `npx clang-format -output-replacements-xml --glob="${path}"`;
    const replacementResult = Buffer.from(exec(execCmd, options)).toString();
    if (replacementResult.includes('<replacement ')) {
      hints.push(`run "npx clang-format -i --glob='${path}'" to apply changes`);
    }
  });

  if (hints.length) {
    console.log(`Some files are not well formatted`);
    console.log(hints.join('\n'));
    console.log('See https://github.com/nth-cloud/ng-mentions/blob/master/DEVELOPER.md#clang-format');
    process.exit(1);
  }
};

checkFormat();
