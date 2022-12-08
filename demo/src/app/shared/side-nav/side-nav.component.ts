import { Component, Input } from '@angular/core';
import {Router} from '@angular/router';

export const componentsList = [
  'Mentions',
  'Highlighter',
];

@Component({
  selector: 'nthd-side-nav',
  templateUrl: './side-nav.component.html',
})
export class NthSideNavComponent {
  @Input() activeTab: string = '';
  components = componentsList;

  constructor(private router: Router) {}

  isActive(currentRoute: any[]): boolean {
    return this.router.isActive(this.router.createUrlTree(currentRoute), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}
