import {Component} from '@angular/core';
import {DEMO_SNIPPETS} from './demos';

@Component({
  selector: 'nthd-mention',
  template: `
    <nthd-component-wrapper component="NgMentions">
      <nthd-api-docs directive="NgMentionsComponent"></nthd-api-docs>
      <nthd-example-box title="Basic" [snippets]="snippets" component="mentions" demo="basic" id="basic">
        <nthd-mentions-basic></nthd-mentions-basic>
      </nthd-example-box>
      <nthd-example-box title="Validation" [snippets]="snippets" component="mentions" demo="validation" id="validation">
        <nthd-mentions-validation></nthd-mentions-validation>
      </nthd-example-box>
      <nthd-example-box title="Custom Search" [snippets]="snippets" component="mentions" demo="custom-search" id="search">
        <nthd-mentions-custom-search></nthd-mentions-custom-search>
      </nthd-example-box>
      <nthd-example-box title="String Values" [snippets]="snippets" component="mentions" demo="string-values" id="values">
        <nthd-mentions-string-values></nthd-mentions-string-values>
      </nthd-example-box>
        <nthd-example-box title="Custom Mentions List Template" [snippets]="snippets" component="mentions" demo="custom-template"
                          id="template">
            <nthd-mentions-custom-template></nthd-mentions-custom-template>
        </nthd-example-box>
    </nthd-component-wrapper>
  `
})
export class NthdMentionsComponent {
  snippets = DEMO_SNIPPETS;
}
