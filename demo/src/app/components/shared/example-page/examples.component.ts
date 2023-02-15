import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NthdDemoList } from '../demo-list';

@Component({
  template: `
    <nthd-widget-demo
      *ngFor="let demo of demos"
      [id]="demo.id"
      [demoTitle]="demo.title"
      [code]="demo.code"
      [markup]="demo.markup"
      [component]="component"
      [files]="demo.files"
      [showCode]="demo.showCode"
      [showStackblitz]="demo.showStackblitz ?? true"
    >
      <ng-template [ngComponentOutlet]="demo.type"></ng-template>
    </nthd-widget-demo>
  `,
})
export class NthdExamplesComponent {
  component: string;
  demos: any = [];

  constructor(route: ActivatedRoute, demoList: NthdDemoList) {
    const componentName = (this.component = route.parent!.parent!.snapshot.url[1].path);
    if (componentName) {
      const demos = demoList.getDemos(componentName);
      if (demos) {
        this.demos = Object.keys(demos).map((id) => {
          return { id, ...demos[id] };
        });
      }
    }
  }
}
