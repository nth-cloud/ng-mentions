export * from './mentions';

import {NgModule} from '@angular/core';

import {NgxdSharedModule} from '../shared';
import {NgxdMentionsModule} from './mentions';

@NgModule({
  imports: [
    NgxdSharedModule,
    NgxdMentionsModule
  ],
  exports: [
    NgxdMentionsModule
  ]
})
export class NgxdDemoModule {}
