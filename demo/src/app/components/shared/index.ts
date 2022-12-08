import {NgModule} from '@angular/core';

import {NthdSharedModule} from '../../shared';
import {NthWidgetDemoComponent} from './example-page/demo.component';
import {NthdApiDocs, NthdApiDocsBadge, NthdApiDocsClass, NthdApiDocsConfig} from './api-docs';
import {NthdOverviewDirective, NthdOverviewSectionComponent} from './overview';
import {NthdExamplesComponent} from './example-page/examples.component';
import {NthdApiPage} from './api-page/api.component';

export * from './demo-list';

@NgModule({
  imports: [NthdSharedModule],
  declarations: [
    NthWidgetDemoComponent,
    NthdApiDocsBadge,
    NthdApiDocs,
    NthdApiDocsClass,
    NthdApiDocsConfig,
    NthdOverviewDirective,
    NthdOverviewSectionComponent,
    NthdExamplesComponent,
    NthdApiPage,
  ],
  exports: [
    NthWidgetDemoComponent,
    NthdApiDocsBadge,
    NthdApiDocs,
    NthdApiDocsClass,
    NthdApiDocsConfig,
    NthdOverviewDirective,
    NthdOverviewSectionComponent,
    NthdExamplesComponent,
    NthdApiPage,
  ]
})
export class NthdComponentsSharedModule {}
