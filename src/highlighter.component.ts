import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

import {NgHighlightedValue} from './highlighted-value';
import {NgHighlighterPatternDirective} from './highlighter-pattern.directive';
import {Tag} from './util/interfaces';
import {escapeHtml, Highlighted, isCoordinateWithinRect} from './util/utils';

/**
 * The Highlighter Component
 */
@Component({
  exportAs: 'ngHighlighter',
  selector: 'ng-highlighter',
  template: '<div *ngFor="let line of lines" [innerHTML]="line"></div>',
  preserveWhitespaces: false,
  encapsulation: ViewEncapsulation.None
})
export class NgHighlighterComponent implements OnChanges,
    AfterContentInit {
  /**
   * Text value to be highlighted
   */
  @Input() text: string;
  /**
   * Event emitted when a highlighted item it clicked
   */
  @Output() itemClick: EventEmitter<NgHighlightedValue> = new EventEmitter<NgHighlightedValue>();

  @ContentChildren(NgHighlighterPatternDirective) patterns: QueryList<NgHighlighterPatternDirective>;

  readonly newLine: RegExp = /\n/g;
  lines: string[] = [];
  private highlightedElements: Highlighted[] = [];

  constructor(private element: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('text' in changes) {
      this.parseLines();
    }
  }

  ngAfterContentInit(): void {
    if (this.text && this.patterns) {
      this.parseLines();
    }
  }

  @HostListener('click', ['$event'])
  onItemClick(event: MouseEvent) {
    const matchedElement = this.getMatchedElement(event);
    if (matchedElement) {
      event.preventDefault();
      event.stopPropagation();
      const content = (<HTMLElement>matchedElement.element).innerText;
      let rel = matchedElement.element.getAttribute('rel') || null;
      const relElement = matchedElement.element.querySelector('[rel]');
      if (relElement) {
        rel = relElement.getAttribute('rel') || null;
      }
      this.itemClick.emit(new NgHighlightedValue(content, matchedElement.type, rel));
    }
  }

  private parseLines() {
    this.lines = this.text.split(this.newLine).map((line: string) => this.highlight(line));
    this.cdr.detectChanges();
    this.collectHighlightedItems();
  }

  private highlight(line: string) {
    if (line.length === 0 || !this.patterns) {
      return '&nbsp;';
    }

    const tags: Tag[] = [];
    let match;
    this.patterns.forEach((pattern: NgHighlighterPatternDirective) => {
      while ((match = pattern.match(line)) !== null) {
        tags.push({
          type: pattern.className,
          indices: {start: match.index, end: match.index + match[0].length},
          formatter: pattern.format
        });
      }
    });

    const prevTags: Tag[] = [];
    const parts: string[] = [];
    [...tags].sort((tagA, tagB) => tagA.indices.start - tagB.indices.start).forEach((tag: Tag) => {
      const expectedLength = tag.indices.end - tag.indices.start;
      const contents = line.slice(tag.indices.start, tag.indices.end);
      if (contents.length === expectedLength) {
        const prevIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
        const before = line.slice(prevIndex, tag.indices.start);
        parts.push(escapeHtml(before));
        parts.push(`<span class="highlighted ${tag.type || ''}" rel="${tag.type}">${tag.formatter(contents)}</span>`);
        prevTags.push(tag);
      }
    });

    const remainingStart = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
    const remaining = line.slice(remainingStart);
    parts.push(escapeHtml(remaining));
    parts.push('&nbsp;');

    return parts.join('');
  }

  private getMatchedElement(event: MouseEvent): Highlighted {
    const matched = this.highlightedElements.find(
        (el: Highlighted): boolean => isCoordinateWithinRect(el.clientRect, event.clientX, event.clientY));

    return matched ? matched : null;
  }

  private collectHighlightedItems() {
    this.highlightedElements = Array.from((<Element>this.element.nativeElement).getElementsByClassName('highlighted'))
                                   .map((element: HTMLElement) => {
                                     const type = element.getAttribute('rel') || null;

                                     return new Highlighted(element, type);
                                   });
  }
}
