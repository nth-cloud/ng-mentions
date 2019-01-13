import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {MentionsAccessorDirective} from './mentions-input.directive';
import {MentionsListComponent} from './mentions-list.component';
import {HighlightedDirective, MentionsComponent} from './mentions.component';

export {MentionsAccessorDirective} from './mentions-input.directive';
export {MentionsComponent} from './mentions.component';

const EXPORT_DIRECTIVES = [MentionsComponent, MentionsAccessorDirective];
const DECLARATIONS = [MentionsComponent, MentionsAccessorDirective, MentionsListComponent, HighlightedDirective];

@NgModule({
  imports: [CommonModule, FormsModule],
  exports: EXPORT_DIRECTIVES,
  declarations: DECLARATIONS,
  entryComponents: [MentionsListComponent]
})
export class MentionsModule {
}
