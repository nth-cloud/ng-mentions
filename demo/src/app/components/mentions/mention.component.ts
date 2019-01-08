import {Component} from '@angular/core';
import {DEMO_SNIPPETS} from './demos';

@Component({
  selector: 'ngxd-mention',
  template: `
    <ngxd-component-wrapper component="NgxMentions">
      <ngxd-api-docs directive="NgxMentionsComponent"></ngxd-api-docs>
      <ngxd-api-docs directive="NgxMentionsInputDirective"></ngxd-api-docs>
      <ngxd-example-box demoTitle="Basic" [snippets]="snippets" component="mentions" demo="basic">
        <ngxd-mentions-basic></ngxd-mentions-basic>
      </ngxd-example-box>
    </ngxd-component-wrapper>
  `
})
export class NgxdMentionsComponent {
  snippets = DEMO_SNIPPETS;
}
