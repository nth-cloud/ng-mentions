/* eslint-disable @typescript-eslint/no-var-requires */
import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { CodeHighlightService } from '../shared/code/code-highlight.service';

const INSTALL_ANGULAR = require('!!raw-loader!./install-angular.md').default;
const INSTALL_ANGULAR_PROJECT = require('!!raw-loader!./install-angular.md').default;
const INSTALL_NPM = require('!!raw-loader!./install-npm.md').default;
const BUNDLE = require('!!raw-loader!./bundle.md').default;
const IMPORT_USAGE = require('!!raw-loader!./import.md').default;
const USAGE = require('!!raw-loader!./usage.md').default;

@Component({
  selector: 'nthd-default',
  templateUrl: './default.component.html',
})
export class DefaultComponent {
  readonly version: string = environment.version;

  readonly installAngular: string = '';
  readonly installAngularProject: string = '';
  readonly installNPM: string = '';
  readonly bundle: string = '';
  readonly importUsage: string = '';
  readonly usage: string = '';

  constructor(private highlightService: CodeHighlightService) {
    this.installAngular = highlightService.highlight(INSTALL_ANGULAR, 'clike');
    this.installAngularProject = highlightService.highlight(INSTALL_ANGULAR_PROJECT, 'clike');
    this.installNPM = highlightService.highlight(INSTALL_NPM, 'clike');
    this.bundle = highlightService.highlight(BUNDLE, 'javascript');
    this.importUsage = highlightService.highlight(IMPORT_USAGE, 'typescript');
    this.usage = highlightService.highlight(USAGE, 'typescript');
  }
}
