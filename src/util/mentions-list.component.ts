import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {getCaretCoordinates, getElementStyle} from './utils';

@Component({
  selector: 'mentions-list',
  template: `
      <ng-template #defaultItemTemplate let-item="item">
          {{transformItem(item)}}
      </ng-template>
      <ul #list class="dropdown-menu scrollable-menu">
          <li *ngFor="let item of items; let i = index" [class.active]="activeIndex === i">
              <a href class="dropdown-item" (click)="onItemClick($event, i, item)">
                  <ng-template [ngTemplateOutlet]="itemTemplate"
                               [ngTemplateOutletContext]="{item:item,index:i}"></ng-template>
              </a>
          </li>
      </ul>
  `,
  styles: [
    'mentions-list {position: absolute;display: none;}', 'mentions-list.drop-up {transform: translateY(-100%);}',
    'mentions-list.show {display: block;} mentions-list.no-items {display: none;}',
    'mentions-list .scrollable-menu {display: block;height: auto;max-height:300px;overflow:auto;}',
    'mentions-list li.active {background: #f7f7f9;}'
  ],
  encapsulation: ViewEncapsulation.None
})
export class NgMentionsListComponent implements OnInit {
  public items: any[];
  public itemTemplate: TemplateRef<any>;
  public displayTransform: (..._: string[]) => string;
  public textAreaElement: HTMLTextAreaElement;

  activeIndex: number = -1;
  readonly itemSelected: EventEmitter<any> = new EventEmitter<any>();

  get selectedItem(): any {
    return this.activeIndex >= 0 && this.items[this.activeIndex] !== undefined ? this.items[this.activeIndex] : null;
  }

  @ViewChild('defaultItemTemplate') defaultItemTemplate: TemplateRef<any>;
  @ViewChild('list') list: ElementRef;
  @HostBinding('class.show') public show: boolean = false;
  @HostBinding('class.drop-up') public dropUp: boolean = false;

  @HostBinding('style.top')
  get top(): string {
    return this._top + this.adjustTop + 'px';
  }

  @HostBinding('style.left')
  get left(): string {
    return this._left + 'px';
  }

  @HostBinding('class.no-items')
  get noItems(): boolean {
    return !Array.isArray(this.items) || this.items.length === 0;
  }

  private _top: number = 0;
  private _left: number = 0;

  ngOnInit(): void {
    if (!this.itemTemplate) {
      this.itemTemplate = this.defaultItemTemplate;
    }
  }

  onItemClick(event: MouseEvent, activeIndex: number, item: any) {
    event.preventDefault();
    this.activeIndex = activeIndex;
    this.itemSelected.emit(item);
  }

  public selectFirstItem() {
    this.activeIndex = 0;
    this.resetScroll();
  }

  public selectPreviousItem() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
    this.scrollToActiveItem();
  }

  public selectNextItem() {
    if (this.activeIndex < this.items.length - 1) {
      this.activeIndex++;
      this.scrollToActiveItem();
    }
  }

  public selectLastItem() {
    this.activeIndex = this.items.length > 0 ? this.items.length - 1 : 0;
    this.scrollToActiveItem();
  }

  public position() {
    const element = this.textAreaElement;
    let coords = getCaretCoordinates(element, element.selectionStart);
    this._top = coords.top;
    this._left = coords.left + element.offsetLeft;
    this.list.nativeElement.scrollTop = 0;
  }

  public resetScroll() {
    this.list.nativeElement.scrollTop = 0;
  }

  public transformItem(item: any) {
    return this.displayTransform(item) || item;
  }

  private get adjustTop(): number {
    let adjust = 0;
    if (!this.dropUp) {
      const computedFontSize = getElementStyle(this.textAreaElement, 'fontSize');
      adjust = parseInt(computedFontSize, 10) + this.textAreaElement.offsetTop;
    }

    return adjust;
  }

  private scrollToActiveItem() {
    let element = this.list.nativeElement as HTMLElement;
    if (this.activeIndex === 0) {
      element.scrollTop = 0;
    } else {
      const activeElement = element.querySelector('li.active') as HTMLElement;
      if (activeElement) {
        element.scrollTop = activeElement.offsetTop;
      }
    }
  }
}
