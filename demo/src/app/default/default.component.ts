import {Component} from '@angular/core';
import {environment} from '../../environments/environment';

const prism = require('prismjs');
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-typescript';

@Component({
    selector: 'ngxd-default',
    templateUrl: './default.component.html'
})
export class DefaultComponent {
    public version: string = environment.version;

    readonly installNPM: string = prism.highlight(require('!!raw-loader!./install-npm.md'), prism.languages.clike);
    readonly bundle: string = prism.highlight(require('!!raw-loader!./bundle.md'), prism.languages.javascript);
    readonly importUsage: string = prism.highlight(require('!!raw-loader!./import.md'), prism.languages.typescript);
    readonly usage: string = prism.highlight(require('!!raw-loader!./usage.md'), prism.languages.typescript);
}
