import {Component} from '@angular/core';

@Component({
    selector: 'ngxd-mentions-basic',
    templateUrl: './mentions-basic.html'
})
export class NgxdMentionsBasic {
    model: any = {
        value: "Hello @[Dave](contact:1). How are you doing today?\n\nWould you like to play a game of chess?",
        mentions: [
            {
                display: 'Dave',
                id: 1,
                type: 'contact'
            },
            {
                display: 'Bob Ross',
                id: 2,
                type: 'contact'
            },
            {
                display: 'Carl',
                id: 3,
                type: 'contact'
            },
            {
                display: 'Sue',
                id: 4,
                type: 'contact'
            },
        ]
    };
}
