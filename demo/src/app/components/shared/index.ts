import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {NthdSharedModule} from '../../shared';
import {ExampleBoxComponent} from './example-box';
import {NthdApiDocs, NthdApiDocsBadge, NthdApiDocsClass, NthdApiDocsConfig} from './api-docs';
import {NthdFragment} from './fragment';

@NgModule({
  imports: [NthdSharedModule, NgbModule],
  declarations: [ExampleBoxComponent, NthdApiDocsBadge, NthdApiDocs, NthdApiDocsClass, NthdApiDocsConfig, NthdFragment],
  exports: [ExampleBoxComponent, NthdApiDocsBadge, NthdApiDocs, NthdApiDocsClass, NthdApiDocsConfig, NthdFragment]
})
export class NgxdComponentsSharedModule {}
