import {Component} from '@angular/core';
import {DEMO_SNIPPETS} from './demos';

@Component({
  selector: 'ngxd-toggle',
  template: `
    <ngxd-component-wrapper component="Mentions">
      <ngxd-api-docs directive="NgxMentions"></ngxd-api-docs>
      <ngxd-api-docs directive="NgxMentionsInput"></ngxd-api-docs>
      <ngxd-example-box demoTitle="Basic" [snippets]="snippets" component="mentions" demo="basic">
        <ngxd-toggle-basic></ngxd-toggle-basic>
      </ngxd-example-box>
    </ngxd-component-wrapper>
  `
})
export class NgxdMentionsComponent {
  snippets = DEMO_SNIPPETS;
}
