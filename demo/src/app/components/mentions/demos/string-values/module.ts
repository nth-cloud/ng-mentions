import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgMentionsModule } from '@nth-cloud/ng-mentions';

import { NthdMentionsStringValues } from './mentions-string-values';

@NgModule({
  imports: [BrowserModule, FormsModule, NgMentionsModule],
  declarations: [NthdMentionsStringValues],
  exports: [NthdMentionsStringValues],
  bootstrap: [NthdMentionsStringValues],
})
export class NthdMentionsStringValuesModule {}
