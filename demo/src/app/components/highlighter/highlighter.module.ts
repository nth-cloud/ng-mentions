/* eslint-disable @typescript-eslint/no-var-requires */
import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';

import { NthdSharedModule } from '../../shared';
import { NthdComponentsSharedModule, NthdDemoList } from '../shared';
import { NthdHighlighterBasic } from './demos/basic/highlighter-basic';
import { NthdHighlighterRegexReplace } from './demos/regex-replace/highlighter-regex-replace';
import { ComponentWrapper } from '../../shared/component-wrapper/component-wrapper.component';
import { NthdExamplesComponent } from '../shared/example-page/examples.component';
import { NthdApiPage } from '../shared/api-page/api.component';
import { NthdHighlighterBasicModule } from './demos/basic/module';
import { NthdHighlighterRegExpReplaceModule } from './demos/regex-replace/module';

const DEMOS = {
  basic: {
    title: 'Basic Highlighter',
    type: NthdHighlighterBasic,
    code: require('!!raw-loader!./demos/basic/highlighter-basic').default,
    markup: require('!!raw-loader!./demos/basic/highlighter-basic.html').default,
  },
  'regexp-replace': {
    title: 'Regular Expression Replacement',
    type: NthdHighlighterRegexReplace,
    code: require('!!raw-loader!./demos/regex-replace/highlighter-regex-replace').default,
    markup: require('!!raw-loader!./demos/regex-replace/highlighter-regex-replace.html').default,
  },
};

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'examples' },
  {
    path: '',
    component: ComponentWrapper,
    data: {},
    children: [
      { path: 'examples', component: NthdExamplesComponent },
      { path: 'api', component: NthdApiPage },
    ],
  },
];

@NgModule({
  imports: [
    NthdSharedModule,
    NthdComponentsSharedModule,
    NthdHighlighterBasicModule,
    NthdHighlighterRegExpReplaceModule,
  ],
})
export class NthdHighlighterModule {
  constructor(demoList: NthdDemoList) {
    demoList.register('highlighter', DEMOS);
  }
}
