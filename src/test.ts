// This file is required by karma.conf.js and loads recursively all the .spec and framework files
/** IE9, IE10 and IE11 requires all of the following polyfills. **/
// import 'core-js/client/shim';
import 'core-js/es/symbol';
import 'core-js/es/object';
import 'core-js/es/function';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/math';
import 'core-js/es/string';
import 'core-js/es/date';
import 'core-js/es/array';
import 'core-js/es/regexp';
import 'core-js/es/map';
import 'core-js/es/weak-map';
import 'core-js/es/set';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
import 'classlist.js';

/** Evergreen browsers require these. **/
import 'core-js/es/reflect';


/**
 * Required to support Web Animations `@angular/animation`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
import 'web-animations-js';


/**
 * Zone JS is required by Angular itself.
 */
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-testing';
import './test/jasmine.config';

import {getTestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
// Then we find all the tests.
const context = require.context('.', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
