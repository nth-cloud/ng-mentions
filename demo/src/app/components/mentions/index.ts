
export * from './toggle.component';

import {NgModule} from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {NgxMentionsModule} from 'ngx-mentions';
import {NgxdSharedModule} from '../../shared';
import {NgxdComponentsSharedModule} from '../shared';
import {NgxdMentionsComponent} from './toggle.component';
import {DEMO_DIRECTIVES} from './demos';

@NgModule({
  imports: [NgxdSharedModule, NgxdComponentsSharedModule, NgxMentionsModule, NgbModule],
  exports: [NgxdMentionsComponent],
  declarations: [NgxdMentionsComponent, ...DEMO_DIRECTIVES]
})
export class NgxdMentionsModule {}
