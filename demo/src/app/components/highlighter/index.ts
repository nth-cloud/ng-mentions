export * from './highlighter.component';

import {NgModule} from '@angular/core';

import {NgMentionsModule} from '@nth-cloud/ng-mentions';
import {NthdSharedModule} from '../../shared';
import {NthdComponentsSharedModule} from '../shared';
import {NthdHighlighterComponent} from './highlighter.component';
import {DEMO_DIRECTIVES} from './demos';

@NgModule({
  imports: [NthdSharedModule, NthdComponentsSharedModule, NgMentionsModule],
  exports: [NthdHighlighterComponent],
  declarations: [NthdHighlighterComponent, ...DEMO_DIRECTIVES]
})
export class NthdHighlighterModule {}
