import {Component} from '@angular/core';

@Component({
    selector: 'ngxd-mentions-string-values',
    templateUrl: './mentions-string-values.html'
})
export class NgxdMentionsStringValues {
    model: any = {
        markup: '@__display__',
        value: '',
        mentions: [
            'Dave',
            'Sue',
            'Bob',
            'Carl',
            'Mention With Spaces',
            'Mention_With_Underscores'
        ]
    };
}
