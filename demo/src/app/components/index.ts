export * from './mentions';

import {NgModule} from '@angular/core';

import {NthdSharedModule} from '../shared';
import {NgxdMentionsModule} from './mentions';

@NgModule({
  imports: [
    NthdSharedModule,
    NgxdMentionsModule
  ],
  exports: [
    NgxdMentionsModule
  ]
})
export class NthdDemoModule {}
