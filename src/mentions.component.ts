import {
    AfterContentChecked,
    AfterContentInit, AfterViewInit, ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ContentChild, Directive,
    ElementRef,
    EventEmitter, HostListener,
    Input, NgZone,
    OnChanges, OnDestroy, OnInit,
    Output,
    SimpleChanges,
    TemplateRef, ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {MentionsListComponent} from "./mentions-list.component";
import {NgxMentionsInputDirective} from "./mentions-input.directive";
import {
    applyChangeToValue, escapeRegExp,
    findStartOfMentionInPlainText, getBoundsOfMentionAtPosition,
    getCaretPosition, mapPlainTextIndex,
    MarkupMention,
    markupToRegExp, replacePlaceholders,
    setCaretPosition, styleProperties
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

const inputProperties = Object.freeze([
    'rows',
    'cols',
]);

interface Tag {
    indices: { start: number, end: number };
}

interface Line {
    originalContent: string;
    content: string;
    parts: Array<string | Mention>;
}

interface Mention {
    contents: string;
    tag: Tag;
}

@Directive({
    selector: 'highlighted'
})
export class HighlightedDirective {
    @Input() tag: Tag;
}

@Component({
    exportAs: 'ngxMentions',
    selector: 'ngx-mentions',
    template: `
        <div>
            <div class="highlighter" [ngStyle]="highlighterStyle">
                <div *ngFor="let line of lines">
                    <ng-container *ngFor="let part of line.parts">
                        <highlighted *ngIf="isPartMention(part)" [tag]="part.tag">{{formatMention(part)}}</highlighted>
                        <ng-container *ngIf="!isPartMention(part)">{{part}}</ng-container>
                    </ng-container>
                    &nbsp;
                </div>
            </div>
            <textarea
                class="highlighter-input"
                #input
                [rows]="textAreaRows"
                [ngModel]="displayContent"
                [ngClass]="textAreaClassNames"
                (keydown)="onKeyDown($event)"
                (blur)="onBlur($event)"
                (select)="onSelect($event)"
                (mouseup)="onSelect($event)"
                (ngModelChange)="onChange($event)"
                [attr.cols]="textAreaAttributes?.cols"
                [attr.rows]="textAreaAttributes?.rows"
                [disabled]="disabled"
                [required]="required"
                [placeholder]="placeholder"
            ></textarea>
            <ng-content></ng-content>
        </div>
    `,
    styles: [
        'ngx-mentions {position: relative;}',
        'ngx-mentions textarea {position:relative; background-color: transparent !important;}',
        'ngx-mentions textarea:not(.highlighter-input) {position: absolute; visibility: visible; top: 0; left: 0; z-index: -1;}',
        'ngx-mentions .highlighter {position: absolute; top: 0; left: 0; right: 0; bottom: 0; color: transparent;}',
        'ngx-mentions highlighted {display: inline; border-radius: 3px; padding: 1px; margin: -1px; overflow-wrap: break-word; background-color: lightblue;}'
    ],
    preserveWhitespaces: false,
    encapsulation: ViewEncapsulation.None
})
export class NgxMentionsComponent implements OnChanges, OnInit, AfterContentInit, AfterContentChecked, AfterViewInit, OnDestroy {
    @Input('triggerChar') triggerChar: string = '@';
    @Input('markup') mentionMarkup: string = '@[__display__](__type__:__id__)';
    @Input('disableSearch') disableSearch: boolean = false;
    @Input('maxItems') maxItems: number = -1;
    @Input('mentionFormat') mentionFormat: (mentionContent: string) => string;
    @Input('dropUp') dropUp: boolean = false;
    @Input('displayName') displayName: string = 'display';

    @Input('mentions')
    set mentionItems(value: any[]) {
        this.mentions = value;
        if (this.disableSearch && this.mentionsList) {
            this.mentionsList.items = value;
        }
    }

    @Output('search') search: EventEmitter<string> = new EventEmitter<string>();

    @ContentChild(NgxMentionsInputDirective) control: NgxMentionsInputDirective;
    @ContentChild(TemplateRef) mentionListTemplate: TemplateRef<any>;
    @ViewChild('input') textAreaInputElement: ElementRef;

    displayContent: string = '';
    lines: Line[] = [];
    highlighterStyle: { [key: string]: string } = {};
    textAreaClassNames: { [key: string]: boolean } = {};
    textAreaRows: number = 1;
    textAreaAttributes: any = {
        cols: null,
        rows: null
    };
    selectionStart: number;
    selectionEnd: number;
    mentions: any[] = [];

    get disabled(): boolean {
        return this.control ? this.control.disabled : false;
    }

    get required(): boolean {
        return this.control ? this.control.required : false;
    }

    get placeholder(): string {
        return this.control ? this.control.placeholder : null
    }

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
        private element: ElementRef,
        private componentResolver: ComponentFactoryResolver,
        private viewContainer: ViewContainerRef,
        private changeDetector: ChangeDetectorRef,
        private ngZone: NgZone
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
        control.valueChanges.pipe(takeUntil(this._destroyed))
            .subscribe((value: string) => this.parseLines(value));
        this.parseLines(control.value);
        this.updateStylesAndProperties();
    }

    ngAfterContentChecked(): void {
        this.validateControl();

        this.updateStylesAndProperties();
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
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
    }

    public onChange(newPlainTextValue: string) {
        let value = this.value;
        let displayTransform = this.displayTransform.bind(this);
        let selectionStart = this.textAreaInputElement.nativeElement.selectionStart;
        let selectionEnd = this.textAreaInputElement.nativeElement.selectionEnd;
        let bounds = getBoundsOfMentionAtPosition(newPlainTextValue, this.markupSearch, selectionStart, displayTransform);
        if (bounds.start !== -1) {
            newPlainTextValue = newPlainTextValue.substring(0, bounds.start) + newPlainTextValue.substring(bounds.end);
        }
        let newValue = applyChangeToValue(
            value,
            this.markupSearch,
            newPlainTextValue,
            this.selectionStart,
            this.selectionEnd,
            selectionEnd,
            displayTransform
        );
        // newPlainTextValue = getPlainText(newValue, this.markupSearch, displayTransform);
        let startOfMention = findStartOfMentionInPlainText(value, this.markupSearch, selectionStart, displayTransform);
        if (startOfMention.start > -1 && this.selectionEnd > startOfMention.start) {
            selectionStart = startOfMention.start;
            selectionEnd = selectionStart;
        }
        this.selectionStart = selectionStart;
        this.selectionEnd = selectionEnd;
        this.parseLines(newValue);
        this.changeDetector.detectChanges();
        setTimeout(() => setCaretPosition(this.textAreaInputElement.nativeElement, this.selectionEnd));
    }

    public onKeyDown(event: any) {
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

        let startOfMention = findStartOfMentionInPlainText(this.value, this.markupSearch, caretPosition, this.displayTransform.bind(this));
        if (characterPressed === this.triggerChar) {
            this.setupMentionsList(caretPosition);
        } else if (startOfMention.start === -1 && this.startPos >= 0) {
            if (caretPosition <= this.startPos) {
                this.mentionsList.show = false;
                this.startPos = -1;
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
            this.mentionsList.show = false;
        }
    }

    public isPartMention(part: any): boolean {
        return typeof part.contents !== 'undefined';
    }

    public formatMention(mention: Mention): string {
        if (this.mentionFormat) {
            return this.mentionFormat(mention.contents);
        }

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

    private setupMentionsList(caretPosition: number) {
        this.startPos = caretPosition;
        this.startNode = window.getSelection().anchorNode;
        this.searchString = null;
        this.stopSearch = false;
        this.showMentionsList();
        if (!this.disableSearch) {
            this.updateMentionsList();
        }
    }

    private handleKeyDown(event: any, caretPosition: number, characterPressed: string) {
        if (event.keyCode === KEY_SPACE) {
            this.startPos = -1;
        } else if (event.keyCode === KEY_BACKSPACE && caretPosition > 0) {
            caretPosition--;
            if (caretPosition === this.startPos) {
                this.stopSearch = true;
            }
            this.mentionsList.show = !this.stopSearch;
        } else if (this.mentionsList.show) {
            if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                this.stopEvent(event);
                this.mentionsList.show = false;
                let value = this.value;
                let start = mapPlainTextIndex(
                    value,
                    this.markupSearch,
                    this.startPos,
                    false,
                    this.displayTransform.bind(this)
                );
                let item = event.item || this.mentionsList.selectedItem;
                let newValue = replacePlaceholders(item, this.markupSearch);
                let newDisplayValue = this._formatMention(newValue);
                caretPosition = this.startPos + newDisplayValue.length;
                value = value.substring(0, start) + newValue + value.substring(start + this.searchString.length + 1, value.length);
                this.parseLines(value);
                this.startPos = -1;
                this.searchString = null;
                this.stopSearch = true;
                setTimeout(() => setCaretPosition(this.textAreaInputElement.nativeElement, caretPosition));
                return;
            } else if (event.keyCode === KEY_ESCAPE) {
                this.stopEvent(event);
                this.mentionsList.show = false;
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
            this.onSelect(event);
            return;
        }

        let mention = this.displayContent.substring(this.startPos + 1, caretPosition);
        if (event.keyCode !== KEY_BACKSPACE) {
            mention += characterPressed;
        }
        this.searchString = mention;
        this.search.emit(this.searchString);
        if (!this.disableSearch) {
            this.updateMentionsList();
        }
    }

    private getDisplayValue(item: any): string {
        if (typeof item === 'string') {
            return item;
        } else if (item[this.displayName] != undefined) {
            return item[this.displayName];
        }

        return null;
    }

    private showMentionsList() {
        if (!this.mentionsList) {
            let componentFactory = this.componentResolver.resolveComponentFactory(MentionsListComponent);
            let componentRef = this.viewContainer.createComponent(componentFactory);
            this.mentionsList = componentRef.instance;
            this.mentionsList.itemTemplate = this.mentionListTemplate;
            this.mentionsList.displayTransform = this.displayTransform.bind(this);
            this.mentionsList.itemSelected.subscribe(item => {
                this.textAreaInputElement.nativeElement.focus();
                const fakeEvent = {keyCode: KEY_ENTER, wasSelection: true, item: item};
                this.onKeyDown(fakeEvent);
            });
            this.mentionsList.displayTransform = this.getDisplayValue.bind(this);
        }
        this.mentionsList.show = true;
        this.mentionsList.dropUp = this.dropUp;
        this.mentionsList.activeIndex = 0;
        this.mentionsList.position(this.textAreaInputElement.nativeElement);
        this.ngZone.run(() => this.mentionsList.resetScroll());
    }

    private updateMentionsList() {
        let items = Array.from(this.mentions);
        if (this.searchString) {
            let searchString = this.searchString.toLowerCase(),
                searchRegEx = new RegExp(escapeRegExp(searchString), 'i');
            items = items.filter(item => {
                let value = this.getDisplayValue(item);
                return value !== null && searchRegEx.test(value);
            });
            if (this.maxItems > 0) {
                items = items.slice(0, this.maxItems);
            }
        }

        this.mentionsList.items = items;
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
        regEx.lastIndex = 0;
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
        this.changeDetector.detectChanges();
    }

    private updateStylesAndProperties() {
        this.refreshSourceInputElementStyleAndAttributes();
        this.changeDetector.detectChanges();
        this.refreshStyles();
    }
}