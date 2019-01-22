import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgMentionsAccessorDirective} from './mentions-input.directive';
import {NgMentionsComponent} from './mentions.component';
import {HighlightedDirective} from './util/highlight.directive';
import {NgMentionsListComponent} from './util/mentions-list.component';

export {NgMentionsAccessorDirective} from './mentions-input.directive';
export {NgMentionsComponent} from './mentions.component';

const EXPORT_DIRECTIVES = [NgMentionsComponent, NgMentionsAccessorDirective];
const DECLARATIONS = [NgMentionsComponent, NgMentionsAccessorDirective, NgMentionsListComponent, HighlightedDirective];

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: EXPORT_DIRECTIVES,
  declarations: DECLARATIONS,
  entryComponents: [NgMentionsListComponent]
})
export class NgMentionsModule {}
