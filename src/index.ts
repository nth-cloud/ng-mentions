import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgHighlighterPatternDirective} from './highlighter-pattern.directive';
import {NgHighlighterComponent} from './highlighter.component';
import {NgMentionsAccessorDirective} from './mentions-input.directive';
import {NgMentionsComponent} from './mentions.component';
import {HighlightedDirective} from './util/highlight.directive';
import {NgMentionsListComponent} from './util/mentions-list.component';

export {NgHighlighterComponent} from './highlighter.component';
export {NgHighlighterPatternDirective} from './highlighter-pattern.directive';
export {NgMentionsAccessorDirective} from './mentions-input.directive';
export {NgMentionsComponent} from './mentions.component';

const EXPORT_DIRECTIVES = [
  NgMentionsComponent,
  NgMentionsAccessorDirective,
  NgHighlighterComponent,
  NgHighlighterPatternDirective,
];
const DECLARATIONS = [
  NgMentionsComponent, NgMentionsAccessorDirective, NgMentionsListComponent, HighlightedDirective,
  NgHighlighterComponent, NgHighlighterPatternDirective
];

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: EXPORT_DIRECTIVES,
    declarations: DECLARATIONS,
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NgMentionsModule {
}
