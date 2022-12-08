import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { NthdOverviewSection } from './overview';

@Component({
  selector: 'nthd-overview-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-block'
  },
  template: `
    <h2>
      <a class="title-fragment" routerLink="." [fragment]="section.fragment" nthdFragment>
        <img src="img/link-symbol.svg" />
      </a>
      {{ section.title }}
    </h2>
    <ng-content></ng-content>
  `
})
export class NthdOverviewSectionComponent {
  @Input() section: NthdOverviewSection;
}
