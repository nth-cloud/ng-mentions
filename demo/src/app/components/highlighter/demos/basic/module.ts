import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgMentionsModule} from '@nth-cloud/ng-mentions';

import {NthdHighlighterBasic} from './highlighter-basic';

@NgModule({
  imports: [BrowserModule, NgMentionsModule],
  declarations: [NthdHighlighterBasic],
  exports: [NthdHighlighterBasic],
  bootstrap: [NthdHighlighterBasic],
})
export class NthdHighlighterBasicModule {
}
