import { Component } from '@angular/core';

@Component({
  selector: 'ngxd-mentions-basic',
  templateUrl: './mentions-basic.html'
})
export class NgxdMentionsBasic {
  model: any = "Hello @[Save](contact:1). How are you doing today?\n\nWould you like to play a game?";
}
