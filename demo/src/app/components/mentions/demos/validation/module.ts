import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgMentionsModule} from '@nth-cloud/ng-mentions';

import {NthdMentionsValidation} from './mentions-validation';

@NgModule({
  imports: [BrowserModule, FormsModule, NgMentionsModule],
  declarations: [NthdMentionsValidation],
  exports: [NthdMentionsValidation],
  bootstrap: [NthdMentionsValidation],
})
export class NthdMentionsValidationModule {
}
