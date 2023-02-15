import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgMentionsModule } from '@nth-cloud/ng-mentions';

import { PrismComponent } from './default/prism.component';
import { DefaultComponent } from './default';
import { SupportComponent } from './support';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { NthdSharedModule } from './shared';
import { NthdMentionsModule } from './components/mentions/mentions.module';
import { NthdHighlighterModule } from './components/highlighter/highlighter.module';

const DEMOS = [NthdMentionsModule, NthdHighlighterModule];

@NgModule({
  declarations: [AppComponent, DefaultComponent, SupportComponent, PrismComponent],
  imports: [BrowserModule, routing, NgMentionsModule, NthdSharedModule, ...DEMOS],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NthdModule {}
