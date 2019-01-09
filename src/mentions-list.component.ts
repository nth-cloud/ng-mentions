import {
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {getCaretCoordinates} from "./utils";

@Component({
    selector: 'mentions-list',
    template: `
        <ng-template #defaultItemTemplate let-item="item">
            {{transformItem(item)}}
        </ng-template>
        <ul #list class="dropdown-menu scrollable-menu">
            <li *ngFor="let item of items; let i = index" [class.active]="activeIndex === i">
                <a href class="dropdown-item" (click)="activeIndex = i;onItemClick($event, item)">
                    <ng-template [ngTemplateOutlet]="itemTemplate" [ngTemplateOutletContext]="{item:item,index:i}"></ng-template>
                </a>
            </li>
        </ul>
    `,
    styles: [
        'mentions-list {position: absolute;display: none;}',
        'mentions-list.show {display: block;}',
        'mentions-list.drop-up {margin-bottom: 24px;}',
        'mentions-list .scrollable-menu {display: block;height: auto;max-height:300px;overflow:auto;}',
        'mentions-list li.active {background: #f7f7f9;}'
    ],
    encapsulation: ViewEncapsulation.None
})
export class MentionsListComponent implements OnInit {
    public items: any[];
    public itemTemplate: TemplateRef<any>;
    public displayTransform: (..._: string[]) => string;

    activeIndex: number = -1;
    readonly itemSelected: EventEmitter<any> = new EventEmitter<any>();

    get selectedItem(): any {
        return this.activeIndex >= 0 && this.items[this.activeIndex] != undefined ? this.items[this.activeIndex] : null;
    }

    @ViewChild('defaultItemTemplate') defaultItemTemplate: TemplateRef<any>;
    @ViewChild('list') list: ElementRef;
    @HostBinding('class.drop-up') public dropUp: boolean = false;
    @HostBinding('class.show') public show: boolean = false;
    @HostBinding('style.top') private top: string;
    @HostBinding('style.left') private left: string;

    ngOnInit(): void {
        if (!this.itemTemplate) {
            this.itemTemplate = this.defaultItemTemplate;
        }
    }

    onItemClick(event: MouseEvent, item: any) {
        event.preventDefault();
        this.itemSelected.emit(item);
    }

    public selectPreviousItem() {
        if (this.activeIndex > 0) {
            this.activeIndex--;
        }
    }

    public selectNextItem() {
        if (this.activeIndex < this.items.length - 1) {
            this.activeIndex++;
        }
    }

    public position(element: HTMLInputElement) {
        let coords = getCaretCoordinates(element, element.selectionStart);
        coords.top += element.offsetTop + 16;
        coords.left += element.offsetLeft;
        this.top = coords.top + 'px';
        this.left = coords.left + 'px';
    }

    public resetScroll() {
        this.list.nativeElement.scrollTop = 0;
    }

    public transformItem(item: any) {
        return this.displayTransform(item) || item;
    }
}