# NGX-MENTIONS

[![npm version](https://badge.fury.io/js/ngx-mentions.svg)](https://badge.fury.io/js/ngx-mentions)
[![Build Status](https://travis-ci.org/nth-cloud/ngx-mentions.svg?branch=master)](https://travis-ci.org/nth-cloud/ngx-mentions)
[![dependency Status](https://david-dm.org/nth-cloud/ngx-mentions.svg?branch=master)](https://david-dm.org/nth-cloud/ngx-mentions)
[![devDependency Status](https://david-dm.org/nth-cloud/ngx-mentions/dev-status.svg?branch=master)](https://david-dm.org/nth-cloud/ngx-mentions#info=devDependencies)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/trickeyone.svg)](https://saucelabs.com/u/trickeyone)

[![NPM](https://nodei.co/npm/ngx-mentions.png?compact=true)](https://www.npmjs.com/package/ngx-mentions)

Native Angular v5+ components & directives for customizable mentions. Allowing for customizable search results and mention formatting.

## Demo and Docs

View it in action at https://nth-cloud.github.io/ngx-mentions

## Dependencies
* [Angular](https://angular.io) (tested with 5.1.0)

## Installation
After installing the above dependencies, install `ngx-mentions` via:
```shell
npm install --save ngx-mentions
```

Import the main module into your project:
```js
import {NgxMentionsModule} from "ngx-mentions";
```

Import the module into your application:
```js
import {NgxMentionsModule} from "ngx-mentions";

@NgModule({
    ...
    imports: [NgxMentionsModule, ...],
    ...
})
export class AppModule {
}
```

If you are using SystemJS, you should adjust your configuration to point to the UMD bundle.

In your systemJS config file, `map` needs to tell the System loader where to look for `ngx-mentions`:
```js
map: {
   'ngx-mentions': 'node_modules/ngx-mentions/dist/bundles/ngx-mentions.js'
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

Also, check [Bootstrap 4's notes](https://getbootstrap.com/docs/4.0/getting-started/browsers-devices/#supported-browsers) on supported browsers.

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)