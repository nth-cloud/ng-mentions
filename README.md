# NG-MENTIONS

[![npm version](https://badge.fury.io/js/%40nth-cloud%2Fng-mentions.svg)](https://badge.fury.io/js/%40nth-cloud%2Fng-mentions)
[![Build Status](https://travis-ci.org/nth-cloud/ng-mentions.svg?branch=master)](https://travis-ci.org/nth-cloud/ng-mentions)
[![codecov](https://codecov.io/gh/nth-cloud/ng-mentions/branch/master/graph/badge.svg)](https://codecov.io/gh/nth-cloud/ng-mentions)
[![dependency Status](https://david-dm.org/nth-cloud/ng-mentions.svg?branch=master)](https://david-dm.org/nth-cloud/ng-mentions)
[![devDependency Status](https://david-dm.org/nth-cloud/ng-mentions/dev-status.svg?branch=master)](https://david-dm.org/nth-cloud/ng-mentions#info=devDependencies)
[![Sauce Test Status](https://saucelabs.com/buildstatus/ng-mentions)](https://saucelabs.com/u/ng-mentions)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/ng-mentions.svg)](https://saucelabs.com/u/ng-mentions)

Native Angular components & directives for customizable mentions. Allowing for customizable search results and mention formatting.

## Demo and Docs

View it in action at https://nth-cloud.github.io/ng-mentions

## Dependencies
* [Angular](https://angular.io) (tested with 9.1.12)

| ng-mentions | Angular |
| ----------- | ------- |
| 0.x.x       | 5.2.1   |
| 1.x.x       | 6.1.0   |
| 2.x.x       | 7.0.0   |
| 3.x.x       | 8.0.0   |
| 4.x.x       | 9.0.0   |

## Installation
After installing the above dependencies, install `ng-mentions` via:
```shell
npm install --save @nth-cloud/ng-mentions
```

Import the main module into your project:
```js
import {NgMentionsModule} from "@nth-cloud/ng-mentions";
```

Import the module into your application:
```js
import {NgMentionsModule} from "@nth-cloud/ng-mentions";

@NgModule({
    ...
    imports: [NgMentionsModule, ...],
    ...
})
export class AppModule {
}
```

If you are using SystemJS, you should adjust your configuration to point to the UMD bundle.

In your systemJS config file, `map` needs to tell the System loader where to look for `ng-mentions`:
```js
map: {
   '@nth-cloud/ng-mentions': 'npm:@nth-cloud/ng-mentions/dist/bundles/ng-mentions.js'
}
```

## Supported browsers
We strive to support the same browsers and versions as supported by Angular. Check browser support notes for
[Angular](https://github.com/angular/angular/blob/master/README.md).

* Chrome (45+)
* Firefox (40+)
* IE (10+)
* Edge (20+)
* Safari (7+)

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)
