import {Component, DebugElement} from '@angular/core';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule} from '@angular/forms';

import {createGenericTestComponent} from './test/common';

import {NgxMentionsComponent, NgxMentionsModule} from './index';
import {By} from "@angular/platform-browser";
import {MentionsListComponent} from "./mentions-list.component";
import {Key} from "./key";

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  model: any = '';
  mentions: any;
}

const createTestComponent = (html: string) =>
    createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function createKeyDownEvent(key: number) {
  const event = {which: key, preventDefault: () => {}, stopPropagation: () => {}};
  spyOn(event, 'preventDefault');
  spyOn(event, 'stopPropagation');
  return event;
}

function getNativeInput(element: HTMLElement): HTMLTextAreaElement {
  return <HTMLTextAreaElement>element.querySelector('textarea');
}

function changeInput(element: DebugElement, value: string) {
  let input = getDebugInput(element).nativeElement;
  input.value = value;
}

function blurInput(element: any) {
  const input = getNativeInput(element);
  const evt = document.createEvent('HTMLEvents');
  evt.initEvent('blur', false, false);
  input.dispatchEvent(evt);
}

function getDebugInput(element: DebugElement): DebugElement {
  return element.query(By.css('textarea.highlighter-input'));
}

function expectInputValue(element: DebugElement, value: string) {
  expect(getDebugInput(element).nativeElement.value).toBe(value);
}

describe('ngx-mentions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
        {declarations: [TestComponent], imports: [NgxMentionsModule, FormsModule]});
  });

  it('should initialize', () => {
    const fixture = createTestComponent(
        `<ngx-mentions [mentions]="mentions"><textarea ngxMentionInput [(ngModel)]="model"></textarea></ngx-mentions>`);

    let originalValue = 'Test string @[Name](type:1)';
    fixture.componentInstance.model = originalValue;
    fixture.componentInstance.mentions = [{display: 'Name2', type: 'type', id: 2}];
    fixture.detectChanges();
    expect(fixture.componentInstance.model).toBe(originalValue);
    expect(fixture.componentInstance.mentions.length).toBe(1);
    expect(fixture.debugElement.query(By.directive(MentionsListComponent))).toBeNull();
  });

  it('should select first mention on Enter', () => {
    const fixture = createTestComponent(
      `<ngx-mentions [mentions]="mentions"><textarea ngxMentionInput [(ngModel)]="model"></textarea></ngx-mentions>`);

    fixture.componentInstance.mentions = [
      {display: 'item1',id:1,type:'type'},
      {display: 'item2',id:2,type:'type'},
      {display: 'item3',id:3,type:'type'},
    ];
    fixture.detectChanges();
    expect(fixture.componentInstance.mentions.length).toBe(3);
    let element = fixture.debugElement.query(By.directive(NgxMentionsComponent));
    expect(element).not.toBeNull();
    expect(element.componentInstance.mentions.length).toBe(3);
    expect(fixture.debugElement.query(By.directive(MentionsListComponent))).toBeNull();

    let event: any;
    // changeInput(fixture.debugElement, '@');
    event = {key: '@'};
    getDebugInput(fixture.debugElement).triggerEventHandler('keydown', event);
    fixture.detectChanges();

    expect(fixture.componentInstance.model).toBe('@');
    expect(fixture.debugElement.query(By.directive(MentionsListComponent))).not.toBeNull();

    // Down
    // event = createKeyDownEvent(Key.ArrowDown);
    // getDebugInput(fixture.debugElement).triggerEventHandler('keydown', event);
    // fixture.detectChanges();
    // expect(event.preventDefault).toHaveBeenCalled();
  });

  // it('should make previous/next result active with up/down arrow keys', () => {
  //   const fixture = createTestComponent(
  //     `<ngx-mentions [mentions]="mentions"><textarea ngxMentionInput [(ngModel)]="model"></textarea></ngx-mentions>`);
  //
  //   fixture.componentInstance.mentions = [
  //     {display: 'item1',id:1,type:'type'},
  //     {display: 'item2',id:2,type:'type'},
  //     {display: 'item3',id:3,type:'type'},
  //   ];
  //   fixture.detectChanges();
  //   expect(fixture.componentInstance.mentions.length).toBe(3);
  //   let element = fixture.debugElement.query(By.directive(NgxMentionsComponent));
  //   expect(element).not.toBeNull();
  //   expect(element.componentInstance.mentions.length).toBe(3);
  //   expect(fixture.debugElement.query(By.directive(MentionsListComponent))).toBeNull();
  //
  //   let event: any;
  //   // changeInput(fixture.debugElement, '@');
  //   event = {key: '@'};
  //   getDebugInput(fixture.debugElement).triggerEventHandler('keydown', event);
  //   fixture.detectChanges();
  //
  //   // expectInputValue(fixture.debugElement, '@');
  //   expect(fixture.debugElement.query(By.directive(MentionsListComponent))).not.toBeNull();
  //
  //   // Down
  //   // event = createKeyDownEvent(Key.ArrowDown);
  //   // getDebugInput(fixture.debugElement).triggerEventHandler('keydown', event);
  //   // fixture.detectChanges();
  //   // expect(event.preventDefault).toHaveBeenCalled();
  // });

  // it('should remove mention on backspace into mention', async(() => {
  //   const fixture = createTestComponent(
  //     `<ngx-mentions [mentions]="mentions"><textarea ngxMentionInput [(ngModel)]="model"></textarea></ngx-mentions>`);
  //   const event = createKeyDownEvent(Key.Backspace);
  //
  //   let originalValue = 'Test string @[Name](type:1)';
  //   let expectedValue = 'Test string ';
  //   fixture.componentInstance.model = originalValue;
  //   fixture.detectChanges();
  //   fixture.whenStable()
  //     .then(() => {
  //       getDebugInput(fixture.debugElement).nativeElement.focus();
  //       getDebugInput(fixture.debugElement).triggerEventHandler('keydown', event);
  //       fixture.detectChanges();
  //       expect(fixture.componentInstance.model).toBe(expectedValue);
  //     });
  // }));
});
