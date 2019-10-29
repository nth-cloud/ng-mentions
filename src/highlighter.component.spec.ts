import {Component} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {createGenericTestComponent} from './test/common';
import {NgMentionsModule} from './index';

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  model: any = '';
  value: string = 'Test string @[Name](type:1)';
}

const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

describe('ng-highlighter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      {declarations: [TestComponent], imports: [NgMentionsModule]});
  });

  it('should format text as expected', fakeAsync(() => {
    const fixture = createTestComponent(
      `<ng-highlighter [text]="value">
                <ng-highlighter-pattern
                    name="first"
                    markup="@[__display__](__type__:__id__)"
                    markupReplace="@\$2"></ng-highlighter-pattern>
             </ng-highlighter>`
    );

    const rootEl: HTMLElement = fixture.nativeElement;
    const el: HTMLElement = rootEl.querySelector('ng-highlighter');
    const value = el.innerText.trim();

    expect(value).toEqual('Test string @Name');
  }));
});
