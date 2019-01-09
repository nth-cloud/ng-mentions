import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {HighlightedDirective, NgxMentionsComponent} from "./mentions.component";
import {NgxMentionsInputDirective} from "./mentions-input.directive";
import {MentionsListComponent} from "./mentions-list.component";
import {FormsModule} from "@angular/forms";

const EXPORT_DIRECTIVES = [
    NgxMentionsComponent,
    NgxMentionsInputDirective
];
const DECLARATIONS = [
    NgxMentionsComponent,
    NgxMentionsInputDirective,
    MentionsListComponent,
    HighlightedDirective
];

@NgModule({
    imports: [CommonModule, FormsModule],
    exports: EXPORT_DIRECTIVES,
    declarations: DECLARATIONS,
    entryComponents: [MentionsListComponent]
})
export class NgxMentionsModule {}