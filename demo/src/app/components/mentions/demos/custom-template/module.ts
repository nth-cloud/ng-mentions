import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgMentionsModule } from '@nth-cloud/ng-mentions';

import { NthdMentionsCustomTemplate } from './mentions-custom-template';

@NgModule({
  imports: [BrowserModule, FormsModule, NgMentionsModule],
  declarations: [NthdMentionsCustomTemplate],
  exports: [NthdMentionsCustomTemplate],
  bootstrap: [NthdMentionsCustomTemplate],
})
export class NthdMentionsCustomTemplateModule {}
