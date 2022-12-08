import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NthdOverviewSection} from '../../components/shared/overview';

@Component({
  selector: 'nthd-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'd-block'
  },
  template: `
    <h2>
      <a routerLink="." [fragment]="fragment" nthdFragment>
        <img src="img/link-symbol.svg" />
      </a>
      {{ title }}
    </h2>
  `,
})
export class NthdPageHeaderComponent implements NthdOverviewSection {
  @Input() title: string;
  @Input() fragment: string;
}
