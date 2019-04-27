import {Component} from '@angular/core';

@Component({
  selector: 'nthd-mentions-custom-template',
  templateUrl: './mentions-custom-template.html'
})
export class NthdMentionsCustomTemplate {
  model: any = {
    value: '',
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
