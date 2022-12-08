import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

const BADGES = {
  'Directive': 'success',
  'Component': 'success',
  'Service': 'primary',
  'Configuration': 'primary',
  'Class': 'danger',
  'Interface': 'danger'
};

@Component({
  selector: 'nthd-api-docs-badge',
  template: `
    <h5>
      <span *ngIf="deprecated" class="badge bg-secondary">Deprecated {{deprecated.version}}</span>
      <span *ngIf="since" class="badge bg-info text-dark">Since {{since.version}}</span>
      <span class="badge" [ngClass]="badgeClass">{{text}}</span>
    </h5>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NthdApiDocsBadge {

  badgeClass;
  text;

  @Input() deprecated?: {version: string};

  @Input() since?: {version: string};

  @Input()
  set type(type: string) {
    this.text = type;
    this.badgeClass = `badge-${BADGES[type] || 'secondary'}`;
  }
}
