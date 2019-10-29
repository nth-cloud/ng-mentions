export * from './mentions';

import {NgModule} from '@angular/core';

import {NthdSharedModule} from '../shared';
import {NgxdMentionsModule} from './mentions';
import {NthdHighlighterModule} from './highlighter';

@NgModule({
  imports: [
    NthdSharedModule,
    NgxdMentionsModule,
    NthdHighlighterModule,
  ],
  exports: [
    NgxdMentionsModule,
    NthdHighlighterModule,
  ]
})
export class NthdDemoModule {}
