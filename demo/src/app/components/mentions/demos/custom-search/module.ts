import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgMentionsModule } from '@nth-cloud/ng-mentions';

import { NthdMentionsCustomSearch } from './mentions-custom-search';

@NgModule({
  imports: [BrowserModule, FormsModule, NgMentionsModule],
  declarations: [NthdMentionsCustomSearch],
  exports: [NthdMentionsCustomSearch],
  bootstrap: [NthdMentionsCustomSearch],
})
export class NthdMentionsCustomSearchModule {}
