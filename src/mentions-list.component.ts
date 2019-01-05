import {Component, TemplateRef} from "@angular/core";

@Component({
    selector: 'mentions-list',
    template: ``,
    styles: [

    ]
})
export class MentionsListComponent {
    public hidden: boolean = false;
    public itemTemplate: TemplateRef<any>;

    public selectPreviousItem() {

    }

    public selectNextItem() {
    }

    public position(element: HTMLInputElement, dropUp: boolean = false) {
    }
}