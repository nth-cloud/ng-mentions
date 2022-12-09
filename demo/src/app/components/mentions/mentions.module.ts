/* eslint-disable @typescript-eslint/no-var-requires */
import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';

import {NthdSharedModule} from '../../shared';
import {NthdComponentsSharedModule, NthdDemoList} from '../shared';
import {NthdMentionsBasic} from './demos/basic/mentions-basic';
import {NthdMentionsCustomSearch} from './demos/custom-search/mentions-custom-search';
import {NthdMentionsStringValues} from './demos/string-values/mentions-string-values';
import {NthdMentionsValidation} from './demos/validation/mentions-validation';
import {NthdMentionsCustomTemplate} from './demos/custom-template/mentions-custom-template';
import {ComponentWrapper} from '../../shared/component-wrapper/component-wrapper.component';
import {NthdExamplesComponent} from '../shared/example-page/examples.component';
import {NthdApiPage} from '../shared/api-page/api.component';
import {NthdMentionsBasicModule} from './demos/basic/module';
import {NthdMentionsStringValuesModule} from './demos/string-values/module';
import {NthdMentionsCustomSearchModule} from './demos/custom-search/module';
import {NthdMentionsCustomTemplateModule} from './demos/custom-template/module';
import {NthdMentionsValidationModule} from './demos/validation/module';

const DEMOS = {
  basic: {
    title: 'Basic',
    type: NthdMentionsBasic,
    code: require('!!raw-loader!./demos/basic/mentions-basic').default,
    markup: require('!!raw-loader!./demos/basic/mentions-basic.html').default,
  },
  'custom-search': {
    title: 'Custom Search',
    type: NthdMentionsCustomSearch,
    code: require('!!raw-loader!./demos/custom-search/mentions-custom-search').default,
    markup: require('!!raw-loader!./demos/custom-search/mentions-custom-search.html').default,
  },
  'string-values': {
    title: 'String Values',
    type: NthdMentionsStringValues,
    code: require('!!raw-loader!./demos/string-values/mentions-string-values').default,
    markup: require('!!raw-loader!./demos/string-values/mentions-string-values.html').default,
  },
  validation: {
    title: 'Validation',
    type: NthdMentionsValidation,
    code: require('!!raw-loader!./demos/validation/mentions-validation').default,
    markup: require('!!raw-loader!./demos/validation/mentions-validation.html').default,
  },
  'custom-template': {
    title: 'Custom Template',
    type: NthdMentionsCustomTemplate,
    code: require('!!raw-loader!./demos/custom-template/mentions-custom-template').default,
    markup: require('!!raw-loader!./demos/custom-template/mentions-custom-template.html').default,
  }
};

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'examples' },
  {
    path: '',
    component: ComponentWrapper,
    data: {},
    children: [
      { path: 'examples', component: NthdExamplesComponent },
      { path: 'api', component: NthdApiPage }
    ]
  }
];

@NgModule({
  imports: [
    NthdSharedModule,
    NthdComponentsSharedModule,
    NthdMentionsBasicModule,
    NthdMentionsCustomSearchModule,
    NthdMentionsCustomTemplateModule,
    NthdMentionsStringValuesModule,
    NthdMentionsValidationModule,
  ],
})
export class NthdMentionsModule {
  constructor(demoList: NthdDemoList) {
    demoList.register('mentions', DEMOS);
  }
}
