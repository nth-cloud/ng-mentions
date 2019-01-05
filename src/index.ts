import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NgxMentionsComponent} from "./mentions.component";
import {NgxMentionsInputDirective} from "./mentions.directive";

const EXPORT_DIRECTIVES = [
    NgxMentionsComponent,
    NgxMentionsInputDirective
];

@NgModule({imports: [CommonModule], exports: EXPORT_DIRECTIVES, declarations: EXPORT_DIRECTIVES})
export class NgxMentionsModule {}