import {Component, ViewEncapsulation} from '@angular/core';
import {NgHighlightedValue} from '../../../../../../../src/highlighted-value';

@Component({
  selector: 'nthd-highlighter-regex-replace',
  templateUrl: './highlighter-regex-replace.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    'ng-highlighter .highlighted {font-weight: bold;}'
  ]
})
export class NthdHighlighterRegexReplace {
  model: any  = {
    text: 'Hello @[Dave](contact:1). How are you doing today?\n\nWould you like to play a game of chess?',
    markup: '@[__display__](__type__:__id__)',
    markupReplace: '<a href rel="$4">$2</a>',
    clickedValue: null
  };

  handleClickedItem(value: NgHighlightedValue) {
    this.model.clickedValue = value;
  }
}
