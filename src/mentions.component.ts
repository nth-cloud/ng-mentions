import {
    AfterContentChecked,
    AfterContentInit, AfterViewInit, ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ContentChild,
    ElementRef,
    EventEmitter, HostListener,
    Input,
    OnChanges, OnDestroy, OnInit,
    Output,
    SimpleChanges,
    TemplateRef, ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {startWith, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {NgControl} from "@angular/forms";
import {getCaretPosition, MarkupMention, markupToRegExp, setCaretPosition} from "./utils";
import {MentionsListComponent} from "./mentions-list.component";
import {NgxMentionsInputDirective} from "./mentions.directive";

const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const styleProperties = Object.freeze([
    'direction', // RTL support
    'boxSizing',
    'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY', // copy the scrollbar for IE

    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',

    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',

    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',

    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration', // might not make a difference, but better be safe

    'letterSpacing',
    'wordSpacing',

    'tabSize',
    'MozTabSize'
]);

interface Tag {
    indices: {start: number, end: number};
}

interface Line {
    content: string;
    parts: Array<string | Mention>;
}

interface Mention {
    contents: string;
}

class Highlighted {
    constructor(public readonly element: Element) {}

    get clientRect(): ClientRect {
        return this.element.getBoundingClientRect();
    }
}

@Component({
    exportAs: 'ngxMentions',
    selector: 'ngx-mentions',
    template: `
        <div>
            <div class="highlighter" [ngStyles]="highlighterStyle">
                <div *ngFor="let line of lines">
                    <ng-container *ngFor="let part of line.parts">
                        <span *ngIf="isPartMention(part)" class="highlighted">{{formatMention(part)}}&nbsp;</span>
                        <ng-container *ngIf="!isPartMention(part)">{{part}}</ng-container>
                    </ng-container>
                    &nbsp;
                </div>
            </div>
            <textarea
                class="highlighter-input"
                #input
                [rows]="textAreaRows"
                [(ngModel)]="displayContent"
                [ngClass]="textAreaClassNames"
                (keydown)="keyHandler($event)"
                (blur)="blurHandler($event)"
            ></textarea>
            <ng-content></ng-content>
        </div>
    `,
    styles: [
        'ngx-mentions {position: relative;}',
        'ngx-mentions > textarea:not(.highlighter-input) {position: absolute; visibility: hidden; top: 0; left: 0;}',
        'ngx-mentions .highlighter {position: absolute; top: 0; left: 0; right: 0; bottom: 0; color: transparent;}',
        'ngx-mentions .highlighted {border-radius: 2px; padding: 1px 3px; margin: -1px 3px; overflow-wrap: break-word; background-color: lightblue;}'
    ],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None
})
export class NgxMentionsComponent implements OnChanges, OnInit, AfterContentInit, AfterContentChecked, AfterViewInit, OnDestroy {
    @Input('mentions') mentions: any[] = [];
    @Input('triggerChar') triggerChar: string = '@';
    @Input('markup') mentionMarkup: string = '@[__display__](__type__:__id__)';
    @Input('disableSearch') disableSearch: boolean = false;
    @Input('maxItems') maxItems: number = -1;
    @Input('mentionListTemplate') mentionListTemplate: TemplateRef<any>;
    @Input('mentionFormat') mentionFormat: (item: any) => string;
    @Input('dropUp') dropUp: boolean = false;
    @Input('displayName') displayName: string = 'display';

    @Output('search') search: EventEmitter<string> = new EventEmitter<string>();
    @Output('mentionSelect') mentionSelect: EventEmitter<any> = new EventEmitter<any>();

    @ContentChild(NgxMentionsInputDirective) control: NgxMentionsInputDirective;
    @ViewChild('input') textAreaInputElement: HTMLInputElement;

    disabled: boolean = false;
    displayContent: string;
    lines: Line[] = [];
    highlighterStyle: {[key: string]: string} = {};
    textAreaClassNames: {[key: string]: boolean} = {};
    textAreaRows: number = 1;
    private model: NgControl;
    private searchString: string;
    private startPos: number;
    private startNode;
    private mentionsList: MentionsListComponent;
    private stopSearch: boolean = false;
    private markupSearch: MarkupMention;
    private _destroyed: Subject<void> = new Subject<void>();
    private newLine: RegExp = /\n/g;

    constructor(
        private _element: ElementRef,
        private _componentResolver: ComponentFactoryResolver,
        private _viewContainer: ViewContainerRef,
        private _changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.parseMarkup();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ("markup" in changes) {
            this.parseMarkup();
        }
    }

    ngAfterContentInit(): void {
        this.validateControl();

        let control = this.control;
        control.disabledChanges.pipe(takeUntil(this._destroyed))
            .subscribe((disabled: boolean) => this.disabled = disabled);
        control.stateChanges.pipe(startWith<void>(null!))
            .subscribe(
                () => {
                    this._changeDetector.markForCheck();
                }
            );
        if (control.ngControl && control.ngControl.valueChanges) {
            control.ngControl.valueChanges
                .pipe(takeUntil(this._destroyed))
                .subscribe(() => this._changeDetector.markForCheck());
        }

        this.model = control.ngControl;
        this.parseLines();
        this.textAreaClassNames = {};
        Array.from(control.nativeElement.classList).forEach(className => {
            this.textAreaClassNames[className] = true;
        });
        this._changeDetector.detectChanges();
        this.refreshStyles();
    }

    ngAfterContentChecked(): void {
        this.validateControl();
    }

    ngAfterViewInit(): void {
        this._changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.complete();
    }

    @HostListener('window:resize')
    public onWindowResize() {
        this.refreshStyles();
    }

    public keyHandler(event: any, nativeElement: HTMLInputElement = this._element.nativeElement) {
        let caretPosition: number = getCaretPosition(this.textAreaInputElement);
        let characterPressed = event.key;
        if (!characterPressed) {
            let characterCode = event.which || event.keyCode;
            characterPressed = String.fromCharCode(characterCode);
            if (!event.shiftKey && (characterCode >= 65 && characterCode <= 90)) {
                characterPressed = String.fromCharCode(characterCode + 32);
            }
        }

        if (event.keyCode === KEY_ENTER && event.wasSelection && caretPosition < this.startPos) {
            caretPosition = this.startNode.length;
            setCaretPosition(this.startNode, caretPosition);
        }

        if (characterPressed === this.triggerChar) {
            this.displayMentionsList(caretPosition, nativeElement);
        } else if (this.startPos >= 0) {
            if (caretPosition <= this.startPos) {
                this.mentionsList.hidden = true;
            } else if (event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                caretPosition > this.startPos
            ) {
                this.handleKeyDown(event, caretPosition, characterPressed);
            }
        }
    }

    public blurHandler(event: MouseEvent | KeyboardEvent) {
        this.stopEvent(event);
        if (this.mentionsList) {
            this.mentionsList.hidden = true;
        }
    }

    public isPartMention(part: any): boolean {
        return typeof part.contents !== 'undefined';
    }

    public formatMention(mention: Mention): string {
        return mention.contents.replace(this.markupSearch.regEx, `\$${this.displayName}`);
    }

    private stopEvent(event: MouseEvent | KeyboardEvent) {
        if (event.preventDefault) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }

    private displayMentionsList(caretPosition: number, nativeElement: HTMLInputElement) {
        this.startPos = caretPosition;
        this.startNode = window.getSelection().anchorNode;
        this.searchString = null;
        this.stopSearch = false;
        this.showMentionsList(nativeElement);
        this.updateMentionsList();
    }

    private handleKeyDown(event: any, caretPosition: number, characterPressed: string) {
        if (event.keyCode === KEY_SPACE) {
            this.startPos = -1;
        } else if (event.keyCode === KEY_BACKSPACE && caretPosition > 0) {
            caretPosition--;
            if (caretPosition === this.startPos) {
                this.stopSearch = true;
            }
            this.mentionsList.hidden = this.stopSearch;
        } else if (!this.mentionsList.hidden) {
            if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                this.stopEvent(event);
                this.mentionsList.hidden = true;
                // add mention

                this.startPos = -1;
                return;
            } else if (event.keyCode === KEY_ESCAPE) {
                this.stopEvent(event);
                this.mentionsList.hidden = true;
                this.stopSearch = true;
                return;
            } else if (event.keyCode === KEY_DOWN) {
                this.stopEvent(event);
                this.mentionsList.selectNextItem();
                return;
            } else if (event.keyCode === KEY_UP) {
                this.stopEvent(event);
                this.mentionsList.selectPreviousItem();
                return;
            }
        }

        if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
            this.stopEvent(event);
            return;
        }

        let mention = this.displayContent.substring(this.startPos + 1, caretPosition);
        if (event.keyCode !== KEY_BACKSPACE) {
            mention += characterPressed;
        }
        this.searchString = mention;
        this.search.emit(this.searchString);
        this.updateMentionsList();
    }

    private showMentionsList(element: HTMLInputElement) {
        if (!this.mentionsList) {
            let componentFactory = this._componentResolver.resolveComponentFactory(MentionsListComponent);
            let componentRef = this._viewContainer.createComponent(componentFactory);
            this.mentionsList = componentRef.instance;
            this.mentionsList.itemTemplate = this.mentionListTemplate;
        }
        this.mentionsList.position(element, this.dropUp);
    }

    private updateMentionsList() {
    }

    private validateControl() {
        if (!this.control) {
            throw new Error('ngx-mentions must contain a NgxMentionsControl');
        }
    }

    private parseMarkup() {
        if (this.mentionMarkup.length === 0 || this.mentionMarkup[0] !== this.triggerChar) {
            throw new Error(`ngx-mentions markup pattern must start with the trigger character "${this.triggerChar}"`);
        }

        this.markupSearch = markupToRegExp(this.mentionMarkup);
    }

    private parseLines() {
        let value = (this.model!.value || '');
        this.lines = value.split(this.newLine).map((line: string) => this.formatMentions(line));
        this.displayContent = this.lines.map(line => line.content).join("\n");
        this._changeDetector.detectChanges();
        this.collectHighlightedItems();
    }

    private formatMentions(line: string): Line {
        let lineObj: Line = <Line>{
            content: line,
            parts: []
        };

        if (line.length === 0) {
            return lineObj;
        }

        let tags: Tag[] = [],
            mention;
        let regEx = this.markupSearch.regEx;
        while (mention = regEx.exec(line)) {
            tags.push({
                indices: {
                    start: mention.index,
                    end: mention.index + mention[0].length
                }
            });
        }

        let prevTags: Tag[] = [];
        let content = '';
        [...tags]
            .sort((tagA, tagB) => tagA.indices.start - tagB.indices.start)
            .forEach((tag: Tag) => {
                const expectedLength = tag.indices.end - tag.indices.start;
                const contents = line.slice(tag.indices.start, tag.indices.end);
                if (contents.length === expectedLength) {
                    const prevIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
                    const before = line.slice(prevIndex, tag.indices.start);
                    let mention = <Mention>{contents: contents};
                    lineObj.parts.push(before);
                    lineObj.parts.push(mention);
                    prevTags.push(tag);
                    content += before + this.formatMention(mention);
                }
            });

        const remainingStart = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
        const remaining = line.slice(remainingStart);
        lineObj.parts.push(remaining);
        content += remaining;
        lineObj.content = content;

        return lineObj;
    }

    private collectHighlightedItems() {
        let elements = Array.from(
            this._element.nativeElement.getElementsByClassName('highlighted')
        ).map((element: HTMLElement) => new Highlighted(element));
        console.log(elements);
    }

    private refreshStyles() {
        let computedStyle: any = window.getComputedStyle(this.textAreaInputElement);
        this.highlighterStyle = {};
        styleProperties.forEach(prop => {
            this.highlighterStyle[prop] = computedStyle[prop];
        });
    }
}