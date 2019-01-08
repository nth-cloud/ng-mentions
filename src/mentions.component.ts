import {
    AfterContentChecked,
    AfterContentInit, AfterViewInit, ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ContentChild, Directive,
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
import {MentionsListComponent} from "./mentions-list.component";
import {NgxMentionsInputDirective} from "./mentions.directive";
import {
    applyChangeToValue,
    findStartOfMentionInPlainText,
    getCaretPosition,
    getPlainText,
    MarkupMention,
    markupToRegExp,
    setCaretPosition
} from "./utils";

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
const inputProperties = Object.freeze([
    'rows',
    'cols',
]);

interface Tag {
    indices: {start: number, end: number};
}

interface Line {
    originalContent: string;
    content: string;
    parts: Array<string | Mention>;
}

interface Mention {
    contents: string;
}

@Directive({
    selector: 'highlighted'
})
export class HighlightedDirective {
    constructor(public readonly element: ElementRef) {}

    get clientRect(): ClientRect {
        return this.element.nativeElement.getBoundingClientRect();
    }
}

@Component({
    exportAs: 'ngxMentions',
    selector: 'ngx-mentions',
    template: `
        <div>
            <div class="highlighter" [ngStyle]="highlighterStyle">
                <div *ngFor="let line of lines">
                    <ng-container *ngFor="let part of line.parts">
                        <highlighted *ngIf="isPartMention(part)" class="highlighted">{{formatMention(part)}}</highlighted>
                        <ng-container *ngIf="!isPartMention(part)">{{part}}</ng-container>
                    </ng-container>
                    &nbsp;
                </div>
            </div>
            <textarea
                    class="highlighter-input"
                    #input
                    [rows]="textAreaRows"
                    [(value)]="displayContent"
                    [ngClass]="textAreaClassNames"
                    (keyup)="onKeyUp($event)"
                    (keydown)="onKeyDown($event)"
                    (blur)="onBlur($event)"
                    (select)="onSelect($event)"
                    (mouseup)="onSelect($event)"
                    [attr.cols]="textAreaAttributes?.cols"
                    [attr.rows]="textAreaAttributes?.rows"
            ></textarea>
            <ng-content></ng-content>
        </div>
    `,
    styles: [
        'ngx-mentions {position: relative;}',
        'ngx-mentions textarea {position:relative; background-color: transparent !important;}',
        'ngx-mentions textarea:not(.highlighter-input) {position: absolute; visibility: hidden; top: 0; left: 0; z-index: -1;}',
        'ngx-mentions .highlighter {position: absolute; top: 0; left: 0; right: 0; bottom: 0; color: transparent;}',
        'ngx-mentions highlighted {display: inline; border-radius: 3px; padding: 1px; margin: -1px; overflow-wrap: break-word; background-color: lightblue;}'
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
    @ViewChild('input') textAreaInputElement: ElementRef;

    disabled: boolean = false;
    displayContent: string = '';
    lines: Line[] = [];
    highlighterStyle: {[key: string]: string} = {};
    textAreaClassNames: {[key: string]: boolean} = {};
    textAreaRows: number = 1;
    textAreaAttributes: any = {
        cols: null,
        rows: null
    };
    selectionStart: number;
    selectionEnd: number;
    private searchString: string;
    private startPos: number;
    private startNode;
    private mentionsList: MentionsListComponent;
    private stopSearch: boolean = false;
    private markupSearch: MarkupMention;
    private _destroyed: Subject<void> = new Subject<void>();
    private newLine: RegExp = /\n/g;
    private value: string = '';

    constructor(
        private _element: ElementRef,
        private _componentResolver: ComponentFactoryResolver,
        private _viewContainer: ViewContainerRef,
        private _changeDetector: ChangeDetectorRef
    ) {console.log(this);}

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

        this.parseLines(control.ngControl.value);
        this.refreshSourceInputElementStyleAndAttributes();
        this._changeDetector.detectChanges();
        this.refreshStyles();
    }

    ngAfterContentChecked(): void {
        this.validateControl();

        this.parseLines(this.control.ngControl.value);
        this.refreshSourceInputElementStyleAndAttributes();
        this._changeDetector.detectChanges();
        this.refreshStyles();
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

    public onSelect(event: any) {
        this.selectionStart = event.target.selectionStart;
        this.selectionEnd = event.target.selectionEnd;
        console.log('onSelect', this.selectionStart, this.selectionEnd);
    }

    public onKeyUp(event: any) {
        if (event.keyCode === KEY_LEFT || event.keyCode === KEY_RIGHT) {
            this.onSelect(event);
            return;
        }

        let value = this.value;
        let newPlainTextValue = event.target.value;
        console.log('onKeyUp', {displayContent: this.displayContent, newPlainTextValue});
        let displayTransform = this.displayTransform.bind(this);
        let newValue = applyChangeToValue(
            value,
            this.markupSearch,
            this.displayContent,
            newPlainTextValue,
            this.selectionStart,
            this.selectionEnd,
            event.target.selectionEnd,
            displayTransform
        );
        // newPlainTextValue = getPlainText(newValue, this.markupSearch, displayTransform);
        // console.log('onKeyUp\n', event.target.value, "\n", newValue, "\n", newPlainTextValue);
        let selectionStart = event.target.selectionStart;
        let selectionEnd = event.target.selectionEnd;
        let startOfMention = findStartOfMentionInPlainText(value, this.markupSearch, selectionStart, displayTransform);
        if (startOfMention > -1 && this.selectionEnd > startOfMention) {
            selectionStart = startOfMention;
            selectionEnd = selectionStart;
        }
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
        this.parseLines(newValue);
        this._changeDetector.detectChanges();
        // setTimeout(
        //     () => {
        //         setCaretPosition(this.textAreaInputElement.nativeElement, this.selectionEnd)
        //     }
        // );
    }

    public onKeyDown(event: any, nativeElement: HTMLInputElement = this._element.nativeElement) {
        let caretPosition: number = getCaretPosition(this.textAreaInputElement.nativeElement);
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
            //this.displayMentionsList(caretPosition, nativeElement);
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

    public onBlur(event: MouseEvent | KeyboardEvent) {
        this.stopEvent(event);
        if (this.mentionsList) {
            this.mentionsList.hidden = true;
        }
    }

    public isPartMention(part: any): boolean {
        return typeof part.contents !== 'undefined';
    }

    public formatMention(mention: Mention): string {
        return this._formatMention(mention.contents);
    }

    private displayTransform(..._: string[]): string {
        let replaceIndex = this.markupSearch.groups[this.displayName];
        return _[replaceIndex];
    }

    private _formatMention(contents: string): string {
        let replaceValue = `\$${this.displayName}`, replaceIndex;
        let result = contents.replace(this.markupSearch.regEx, `\$${this.displayName}`);
        if (result === replaceValue) {
            replaceIndex = `\$${this.markupSearch.groups[this.displayName]}`;
            result = contents.replace(this.markupSearch.regEx, replaceIndex);
        }

        return result;
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
                // emit value change event
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
            this.onSelect(event);
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

    private parseLines(value: string = '') {
        if (value !== this.value) {
            value = value || '';
            let lines = value.split(this.newLine).map((line: string) => this.formatMentions(line));
            let displayContent = lines.map(line => line.content).join("\n");
            if (this.displayContent !== displayContent) {
                this.value = value;
                this.lines = lines;
                this.displayContent = displayContent;
                this.control.value = value;
                console.log({
                    value,
                    lines,
                    displayContent
                });
                // setTimeout(() => this._changeDetector.detectChanges());
            }
        }
    }

    private formatMentions(line: string): Line {
        let lineObj: Line = <Line>{
            originalContent: line,
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

    private refreshSourceInputElementStyleAndAttributes() {
        let control = this.control;
        this.textAreaClassNames = {};
        this.textAreaAttributes = {};
        Array.from(control.nativeElement.classList).forEach(className => {
            this.textAreaClassNames[className] = true;
        });
        inputProperties.forEach(prop => {
            if (control.nativeElement.hasAttribute(prop)) {
                this.textAreaAttributes[prop] = control.nativeElement.getAttribute(prop);
            } else if (control.nativeElement[prop]) {
                this.textAreaAttributes[prop] = control.nativeElement[prop];
            }
        });
    }

    private refreshStyles() {
        let element = this.textAreaInputElement.nativeElement;
        let computedStyle: any = getComputedStyle(element);
        this.highlighterStyle = {};
        styleProperties.forEach(prop => {
            this.highlighterStyle[prop] = computedStyle[prop];
        });
        this._changeDetector.detectChanges();
    }
}