import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {NgxMentionsAccessorDirective} from './mentions-input.directive';
import {MentionsListComponent} from './mentions-list.component';
import {HighlightedDirective, NgxMentionsComponent} from './mentions.component';

export {NgxMentionsAccessorDirective} from './mentions-input.directive';
export {NgxMentionsComponent} from './mentions.component';

const EXPORT_DIRECTIVES = [NgxMentionsComponent, NgxMentionsAccessorDirective];
const DECLARATIONS = [NgxMentionsComponent, NgxMentionsAccessorDirective, MentionsListComponent, HighlightedDirective];

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: EXPORT_DIRECTIVES,
  declarations: DECLARATIONS,
  entryComponents: [MentionsListComponent]
})
export class NgxMentionsModule {
}
