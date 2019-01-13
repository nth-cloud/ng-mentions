
export * from './mention.component';

import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {MentionsModule} from '@nth-cloud/ng-mentions';
import {NthdSharedModule} from '../../shared';
import {NgxdComponentsSharedModule} from '../shared';
import {NthdMentionsComponent} from './mention.component';
import {DEMO_DIRECTIVES} from './demos';

@NgModule({
  imports: [NthdSharedModule, NgxdComponentsSharedModule, MentionsModule, NgbModule],
  exports: [NthdMentionsComponent],
  declarations: [NthdMentionsComponent, ...DEMO_DIRECTIVES]
})
export class NgxdMentionsModule {}
