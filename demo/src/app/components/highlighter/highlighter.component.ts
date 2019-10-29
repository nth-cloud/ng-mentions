import {Component} from '@angular/core';
import {DEMO_SNIPPETS} from './demos';

@Component({
  selector: 'nthd-highlighter',
  template: `
    <nthd-component-wrapper component="NgHighlighter">
        <nthd-api-docs directive="NgHighlighterComponent"></nthd-api-docs>
        <nthd-api-docs directive="NgHighlighterPatternDirective"></nthd-api-docs>
        <nthd-api-docs-class type="NgHighlightedValue"></nthd-api-docs-class>
        <nthd-example-box title="Basic" [snippets]="snippets" component="highlighter" demo="basic" id="basic">
            <nthd-highlighter-basic></nthd-highlighter-basic>
        </nthd-example-box>
        <nthd-example-box title="RegEx Replace" [snippets]="snippets" component="highlighter" demo="regex-replace" id="regex-replace">
            <nthd-highlighter-regex-replace></nthd-highlighter-regex-replace>
        </nthd-example-box>
    </nthd-component-wrapper>
  `
})
export class NthdHighlighterComponent {
  snippets = DEMO_SNIPPETS;
}
