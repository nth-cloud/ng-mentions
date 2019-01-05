# Angular v2+ Mentions

[![npm version](https://badge.fury.io/js/ngx-mentions.svg)](https://badge.fury.io/js/ngx-mentions)
[![Build Status](https://travis-ci.org/trickeyone/ngx-mentions.svg?branch=master)](https://travis-ci.org/trickeyone/ngx-mentions)
[![dependency Status](https://david-dm.org/trickeyone/ngx-mentions.svg?branch=master)](https://david-dm.org/trickeyone/ngx-mentions)
[![devDependency Status](https://david-dm.org/trickeyone/ngx-mentions/dev-status.svg?branch=master)](https://david-dm.org/trickeyone/ngx-mentions#info=devDependencies)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/trickeyone.svg)](https://saucelabs.com/u/trickeyone)

[![NPM](https://nodei.co/npm/ngx-mentions.png?compact=true)](https://www.npmjs.com/package/ngx-mentions)

Angular v2+ Mentions auto-complete and highlight for text areas.

## Demo

View it in action at https://ngx-mentions.github.io

## Dependencies
* [Angular](https://angular.io) (tested with 5.1.0)
* [Bootstrap 4](https://www.getbootstrap.com) (tested with 4.0.0-beta.2)

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
import {NgxToggleModule} from "ngx-mentions";

@NgModule({
    ...
    imports: [NgxToggleModule, ...],
    ...
})
export class AppModule {
}
```

If you are using SystemJS, you should adjust your configuration to point to the UMD bundle.

In your systemJS config file, `map` needs to tell the System loader where to look for `ngx-mentions`:
```js
map: {
   'trickeyone/ngx-mentions': 'node_modules/trickeyone/ngx-mentions/bundles/ngx-mentions.js' 
}
```

## Supported browsers
We support the same browsers and versions supported by both Bootstrap 4 and Angular, whichever is _more_ restrictive.
See [this](https://github.com/angular/angular/blob/master/README.md) for up-to-date Angular browser support.

* Chrome (45+)
* Firefox (40+)
* IE (10+)
* Edge (20+)
* Safari (7+)

Also, check [Bootstrap 4's notes](https://getbootstrap.com/docs/4.0/getting-started/browsers-devices/#supported-browsers) on supported browsers.

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)