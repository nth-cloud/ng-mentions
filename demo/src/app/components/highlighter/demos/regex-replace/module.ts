import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgMentionsModule } from '@nth-cloud/ng-mentions';

import { NthdHighlighterRegexReplace } from './highlighter-regex-replace';

@NgModule({
  imports: [BrowserModule, NgMentionsModule],
  declarations: [NthdHighlighterRegexReplace],
  exports: [NthdHighlighterRegexReplace],
  bootstrap: [NthdHighlighterRegexReplace],
})
export class NthdHighlighterRegExpReplaceModule {}
