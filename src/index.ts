import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgMentionsAccessorDirective} from './mentions-input.directive';
import {NgMentionsComponent} from './mentions.component';
import {HighlightedDirective} from './util/highlight.directive';
import {NgMentionsListComponent} from './util/mentions-list.component';
import {NgHighlighterComponent} from './highlighter.component';
import {NgHighlighterPatternDirective} from './highlighter-pattern.directive';

export {NgMentionsAccessorDirective} from './mentions-input.directive';
export {NgMentionsComponent} from './mentions.component';
export {NgHighlighterComponent} from './highlighter.component';

const EXPORT_DIRECTIVES = [
  NgMentionsComponent,
  NgMentionsAccessorDirective,
  NgHighlighterComponent,
  NgHighlighterPatternDirective,
];
const DECLARATIONS = [
  NgMentionsComponent,
  NgMentionsAccessorDirective,
  NgMentionsListComponent,
  HighlightedDirective,
  NgHighlighterComponent,
  NgHighlighterPatternDirective
];

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: EXPORT_DIRECTIVES,
  declarations: DECLARATIONS,
  entryComponents: [NgMentionsListComponent]
})
export class NgMentionsModule {
}
