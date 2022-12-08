import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgMentionsModule} from '@nth-cloud/ng-mentions';

import {NthdMentionsBasic} from './mentions-basic';

@NgModule({
  imports: [BrowserModule, FormsModule, NgMentionsModule],
  declarations: [NthdMentionsBasic],
  exports: [NthdMentionsBasic],
  bootstrap: [NthdMentionsBasic],
})
export class NthdMentionsBasicModule {
}
