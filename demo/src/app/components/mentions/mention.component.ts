import {Component} from '@angular/core';
import {DEMO_SNIPPETS} from './demos';

@Component({
  selector: 'nthd-mention',
  template: `
    <nthd-component-wrapper component="NgxMentions">
      <nthd-api-docs directive="MentionsComponent"></nthd-api-docs>
      <nthd-example-box demoTitle="Basic" [snippets]="snippets" component="mentions" demo="basic">
        <nthd-mentions-basic></nthd-mentions-basic>
      </nthd-example-box>
      <nthd-example-box demoTitle="Validation" [snippets]="snippets" component="mentions" demo="validation">
        <nthd-mentions-validation></nthd-mentions-validation>
      </nthd-example-box>
      <nthd-example-box demoTitle="Custom Search" [snippets]="snippets" component="mentions" demo="custom-search">
        <nthd-mentions-custom-search></nthd-mentions-custom-search>
      </nthd-example-box>
      <nthd-example-box demoTitle="String Values" [snippets]="snippets" component="mentions" demo="string-values">
        <nthd-mentions-string-values></nthd-mentions-string-values>
      </nthd-example-box>
    </nthd-component-wrapper>
  `
})
export class NthdMentionsComponent {
  snippets = DEMO_SNIPPETS;
}
