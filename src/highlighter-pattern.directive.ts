import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { MarkupMention, markupToRegExp } from './util/utils';

/**
 * The Highlighted Pattern Directive
 */
@Directive({ exportAs: 'ngHighlighterPattern', selector: 'ng-highlighter-pattern' })
export class NgHighlighterPatternDirective implements OnInit, OnChanges {
  /**
   * Optional. CSS Class that will be added to the highlighted element.
   */
  @Input() className: string;
  /**
   * The markup used to format a mention
   */
  @Input() markup: string;
  /**
   * This can either be the name of the item taken from part of the markup, or it
   * can be a fully formed HTML markup with RegExp placers.
   * Optionally, this can also be a custom function that can be used to format the matched text
   * and returned to be displayed. No other transformation will be done to the text and no
   * matching information is passed the to function, just the matched text.
   */
  @Input() markupReplace: string | ((content: string) => string);

  private markupMention: MarkupMention;

  ngOnInit(): void {
    if (this.markup) {
      this.markupMention = markupToRegExp(this.markup);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('markup' in changes) {
      this.markupMention = markupToRegExp(this.markup);
    }
  }

  match(value: string) {
    return this.markupMention ? this.markupMention.regEx.exec(value) : null;
  }

  readonly format = (content: string) => {
    if (typeof this.markupReplace === 'string') {
      let result;
      const replaceTries = [
        this.markupReplace,
        `\$${this.markupReplace}`,
        `\$${this.markupMention.groups[this.markupReplace]}`,
      ];
      for (const attempt of replaceTries) {
        result = content.replace(this.markupMention.regEx, attempt);
        if (result !== attempt) {
          break;
        }
      }

      return result;
    } else if (typeof this.markupReplace === 'function') {
      return this.markupReplace(content);
    }

    return content;
  };
}
