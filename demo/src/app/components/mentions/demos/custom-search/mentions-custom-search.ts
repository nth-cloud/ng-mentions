import { Component } from '@angular/core';

@Component({
  selector: 'nthd-mentions-custom-search',
  templateUrl: './mentions-custom-search.html',
})
export class NthdMentionsCustomSearch {
  model: any = {
    value: '',
    mentions: [],
  };
  items: any[] = [
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
  ];

  get names(): string {
    return this.items.map((item) => item.display).join(', ');
  }

  onSearch(searchTerm: string) {
    this.model.mentions = [];
    if (searchTerm.length === 0) {
      return;
    }

    this.model.mentions = Array.from(this.items).filter((item) => item.display.toLowerCase().startsWith(searchTerm));
  }
}
