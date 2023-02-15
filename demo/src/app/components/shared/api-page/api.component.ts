import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import apiDocs from '../../../../api-docs';

export function getApis(component: string) {
  const components: any[] = [];
  const classes: any[] = [];
  const configs: any[] = [];
  Object.values(apiDocs)
    .filter((entity) => entity.fileName.startsWith(`src/${component}`))
    .forEach((entity) => {
      switch (entity.type) {
        case 'Directive':
        case 'Component':
          components.push(entity.className);
          break;

        case 'Service':
          if (entity.className.endsWith('Config')) {
            configs.push(entity.className);
          } else {
            classes.push(entity.className);
          }
          break;
        default:
          classes.push(entity.className);
          break;
      }
    });
  return { components, classes, configs };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nthd-api-docs *ngFor="let component of components" [directive]="component"></nthd-api-docs>
    <nthd-api-docs-class *ngFor="let klass of classes" [type]="klass"></nthd-api-docs-class>
    <nthd-api-docs-config *ngFor="let config of configs" [type]="config"></nthd-api-docs-config>
  `,
})
export class NthdApiPage {
  classes: string[];
  components: string[];
  configs: string[];

  constructor(route: ActivatedRoute) {
    const component = route.parent!.parent!.snapshot.url[1].path;
    const apis = getApis(component);
    this.components = apis.components.sort();
    this.classes = apis.classes.sort();
    this.configs = apis.configs.sort();
  }
}
