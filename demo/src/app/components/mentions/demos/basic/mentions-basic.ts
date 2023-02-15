import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'nthd-mentions-basic',
  templateUrl: './mentions-basic.html',
  styles: ['.basic-example mentions-list .scrollable-menu {max-height:100px;}'],
  encapsulation: ViewEncapsulation.None,
})
export class NthdMentionsBasic {
  disabled = false;
  required = false;
  rows = 5;
  cols = 35;
  dropUp = false;

  model: any = {
    value: 'Hello @[Dave](contact:1). How are you doing today?\n\nWould you like to play a game of chess?',
    mentions: [
      {
        display: 'Dave',
        id: 1,
        type: 'contact',
      },
      {
        display: 'Bob Ross',
        id: 2,
        type: 'contact',
      },
      {
        display: 'Carl',
        id: 3,
        type: 'contact',
      },
      {
        display: 'Sue',
        id: 4,
        type: 'contact',
      },
    ],
  };
}
