import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'nthd-highlighter-basic',
  templateUrl: './highlighter-basic.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    'ng-highlighter .highlighted {font-weight: bold;}'
  ]
})
export class NthdHighlighterBasic {
  model: any  = {
    text: 'Hello @[Dave](contact:1). How are you doing today?\n\nWould you like to play a game of chess?',
    markup: '@[__display__](__type__:__id__)',
    markupReplace: 'display'
  };
}
