import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';

import {NgxMentionsComponent, NgxMentionsModule} from './index';
import {Key} from './key';
import {MentionsListComponent} from './mentions-list.component';
import {createGenericTestComponent, createKeyEvent, expectResults, isBrowser} from './test/common';

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  model: any = '';
  mentions: any = [];
}

const createTestComponent = (html: string) =>
    createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function createKeyDownEvent(event: any) {
  spyOn(event, 'preventDefault');
  spyOn(event, 'stopPropagation');
  return event;
}

function getNativeTextArea(element: HTMLElement): HTMLTextAreaElement {
  return <HTMLTextAreaElement>element.querySelector('textarea');
}

function getDropDown(element: HTMLElement): HTMLDivElement {
  return <HTMLDivElement>element.querySelector('mentions-list .dropdown-menu');
}

function changeTextArea(element: any, value: string, reset: boolean = false) {
  const input = getNativeTextArea(element);
  input.focus();
  if (!reset) {
    const evt = createKeyEvent(value.charCodeAt(0), {type: 'keydown', bubbles: true});
    triggerTextAreaEvent(element, evt);
    input.value += value;
  } else {
    input.value = value;
  }
  triggerTextAreaEvent(element, createKeyEvent(null, {type: 'input'}));
  input.setSelectionRange(input.value.length, input.value.length);
}

function triggerTextAreaEvent(element: any, event: any) {
  const input = getNativeTextArea(element);
  input.focus();
  input.dispatchEvent(event);
}

function getDebugInput(element: DebugElement): DebugElement {
  return element.query(By.directive(NgxMentionsComponent));
}

function expectTextAreaValue(element: HTMLElement, value: string) {
  expect(getNativeTextArea(element).value).toEqual(value);
}

function expectMentionListToBeHidden(element: DebugElement, hidden: boolean) {
  let el = element.query(By.directive(MentionsListComponent));
  let e = expect(el);
  if (!hidden) {
    e = e.not;
  }
  e.toBeNull();
}

function expectDropDownItems(element, expectedResults: string[]) {
  const dropDown = getDropDown(element);
  expect(dropDown).not.toBeNull();
  expectResults(dropDown, expectedResults);
}

function tickFixture(fixture: ComponentFixture<TestComponent>) {
  const iterations = isBrowser(['ie10', 'ie11']) ? 2 : 1;
  for (let i = 0; i < iterations; i++) {
    tick();
    fixture.detectChanges();
  }
}

describe('ngx-mentions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
        {declarations: [TestComponent], imports: [NgxMentionsModule, FormsModule, ReactiveFormsModule]});
  });

  describe('value accessor', () => {
    it('should format value', fakeAsync(() => {
         const plainTextValue = 'Test value with Mentions formatted\nAnd New Lines';
         const model = 'Test value with @[Mentions](type:1) formatted\nAnd @[New Lines](type:2)';

         const fixture = createTestComponent(`<ngx-mentions [mentions]="mentions" [(ngModel)]="model"></ngx-mentions>`);

         const el = fixture.nativeElement;
         const comp = fixture.componentInstance;

         expectTextAreaValue(el, '');

         const mentionComp: NgxMentionsComponent = getDebugInput(fixture.debugElement).componentInstance;

         comp.model = model;
         fixture.detectChanges();
         tick();
         expect(comp.model).toBe(model);
         expect(mentionComp.displayContent).toEqual(plainTextValue);
       }));
  });

  it('should initialize', () => {
    const fixture = createTestComponent(`<ngx-mentions [mentions]="mentions" [(ngModel)]="model"></ngx-mentions>`);

    let originalValue = 'Test string @[Name](type:1)';
    fixture.componentInstance.model = originalValue;
    fixture.componentInstance.mentions = [{display: 'Name2', type: 'type', id: 2}];
    fixture.detectChanges();
    expect(fixture.componentInstance.model).toBe(originalValue);
    expect(fixture.componentInstance.mentions.length).toBe(1);
    expect(fixture.debugElement.query(By.directive(MentionsListComponent))).toBeNull();
  });

  it('should select first mention on Enter', fakeAsync(() => {
       const fixture = createTestComponent(`<ngx-mentions [mentions]="mentions" [(ngModel)]="model"></ngx-mentions>`);

       const el = fixture.nativeElement;
       const comp = fixture.componentInstance;
       comp.mentions = [
         {display: 'item1', id: 1, type: 'type'},
         {display: 'item2', id: 2, type: 'type'},
         {display: 'item3', id: 3, type: 'type'},
       ];
       fixture.detectChanges();
       expect(comp.mentions.length).toEqual(3);
       tickFixture(fixture);

       const mentionComp: NgxMentionsComponent = getDebugInput(fixture.debugElement).componentInstance;
       expect(mentionComp.mentions.length).toEqual(3);
       expectMentionListToBeHidden(fixture.debugElement, true);
       tickFixture(fixture);

       let triggerValue = '@';
       triggerTextAreaEvent(el, createKeyEvent(Key.Shift, {type: 'keydown'}));
       tickFixture(fixture);
       changeTextArea(el, triggerValue);
       tickFixture(fixture);

       expectTextAreaValue(el, triggerValue);
       expect(comp.model).toEqual(triggerValue);
       expect(mentionComp.value).toEqual(triggerValue);
       expect(mentionComp.displayContent).toEqual(triggerValue);
       expect(mentionComp.selectionStart).toBeGreaterThan(0);
       tickFixture(fixture);

       const mentionsList = fixture.debugElement.query(By.directive(MentionsListComponent));
       expect(mentionsList).not.toBeUndefined('MentionList should not be undefined');
       expect(mentionsList).not.toBeNull('MentionList should not be null');
       const mentionsListComp = mentionsList.componentInstance;
       expect(mentionsListComp.show).toBeTruthy('MentionList should be shown');
       expect(mentionsListComp.activeIndex).toBe(0, 'MentionList activeIndex should be 0');
       expect(mentionsListComp.selectedItem).not.toBeNull('MentionList selectedItem should not be null');
       expect(mentionsListComp.selectedItem.display).toEqual('item1');
       expect(mentionComp.selectionStart).toBeGreaterThan(0);
       tickFixture(fixture);
       expectDropDownItems(el, ['+item1', 'item2', 'item3']);

       let event = createKeyEvent(Key.Enter, {type: 'keydown'});
       triggerTextAreaEvent(el, event);
       tickFixture(fixture);

       expect(mentionComp.displayContent).toEqual('item1');
       expect(comp.model).toEqual('@[item1](type:1)');
     }));

  it('should make previous/next result active with up/down arrow keys', fakeAsync(() => {
       const fixture = createTestComponent(`<ngx-mentions [mentions]="mentions" [(ngModel)]="model"></ngx-mentions>`);

       const el = fixture.nativeElement;
       const comp = fixture.componentInstance;
       comp.mentions = [
         {display: 'item1', id: 1, type: 'type'},
         {display: 'item2', id: 2, type: 'type'},
         {display: 'item3', id: 3, type: 'type'},
       ];
       tickFixture(fixture);
       expect(comp.mentions.length).toEqual(3);

       const mentionComp: NgxMentionsComponent = getDebugInput(fixture.debugElement).componentInstance;
       expect(mentionComp.mentions.length).toEqual(3);
       expectMentionListToBeHidden(fixture.debugElement, true);
       tickFixture(fixture);

       const triggerValue = '@';
       triggerTextAreaEvent(el, createKeyEvent(Key.Shift, {type: 'keydown'}));
       tickFixture(fixture);
       changeTextArea(el, triggerValue);
       tickFixture(fixture);
       tickFixture(fixture);

       expectTextAreaValue(el, triggerValue);
       expect(comp.model).toEqual(triggerValue, 'TestComponent model should be @');
       expect(mentionComp.value).toEqual(triggerValue, 'MentionsComponent value should be @');
       expect(mentionComp.displayContent).toEqual(triggerValue, 'MentionsComponent displayContent should be @');
       expect(mentionComp.selectionStart)
           .toBeGreaterThan(0, 'MentionsComponent selectionStart should be greater then @');
       tickFixture(fixture);

       const mentionsList = fixture.debugElement.query(By.directive(MentionsListComponent));
       expect(mentionsList).not.toBeUndefined('MentionList should not be undefined');
       expect(mentionsList).not.toBeNull('MentionList should not be null');
       const mentionsListComp = mentionsList.componentInstance;
       expect(mentionsListComp.show).toBeTruthy('MentionList should be shown');
       expect(mentionsListComp.activeIndex).toBe(0, 'MentionList activeIndex should be 0');
       expect(mentionsListComp.selectedItem).not.toBeNull('MentionList selectedItem should not be null');
       expect(mentionsListComp.selectedItem.display).toEqual('item1');
       expect(mentionComp.selectionStart).toBeGreaterThan(0);
       tickFixture(fixture);

       let event;

       // Down
       event = createKeyDownEvent(createKeyEvent(Key.ArrowDown, {type: 'keydown'}));
       triggerTextAreaEvent(el, event);
       tickFixture(fixture);
       expect(event.preventDefault).toHaveBeenCalled();
       expect(mentionsListComp.activeIndex).toBe(1);

       // Up
       event = createKeyDownEvent(createKeyEvent(Key.ArrowUp, {type: 'keydown'}));
       triggerTextAreaEvent(el, event);
       tickFixture(fixture);
       expect(event.preventDefault).toHaveBeenCalled();
       expect(mentionsListComp.activeIndex).toBe(0);

       // End
       event = createKeyDownEvent(createKeyEvent(Key.End, {type: 'keydown'}));
       triggerTextAreaEvent(el, event);
       tickFixture(fixture);
       expect(event.preventDefault).toHaveBeenCalled();
       expect(mentionsListComp.activeIndex).toBe(2);

       // Home
       event = createKeyDownEvent(createKeyEvent(Key.Home, {type: 'keydown'}));
       triggerTextAreaEvent(el, event);
       tickFixture(fixture);
       expect(event.preventDefault).toHaveBeenCalled();
       expect(mentionsListComp.activeIndex).toBe(0);
     }));

  it('should remove mention on backspace into mention', fakeAsync(() => {
       const fixture = createTestComponent(`<ngx-mentions [mentions]="mentions" [(ngModel)]="model"></ngx-mentions>`);
       const comp = fixture.componentInstance;
       const mentionComp: NgxMentionsComponent = getDebugInput(fixture.debugElement).componentInstance;

       const originalValue = '@[Name](type:1)';
       const plainTextValue = 'Nam';
       const expectedValue = '';
       fixture.componentInstance.model = originalValue;
       tickFixture(fixture);
       tickFixture(fixture);

       const textAreaElement = mentionComp.textAreaInputElement.nativeElement as HTMLTextAreaElement;
       const selection = textAreaElement.value.length - 1;
       textAreaElement.setSelectionRange(selection, selection);
       tickFixture(fixture);
       mentionComp.onSelect({target: textAreaElement});
       tickFixture(fixture);
       // mentionComp.displayContent = plainTextValue;
       mentionComp.onChange(plainTextValue);
       fixture.detectChanges();
       tickFixture(fixture);

       expect(mentionComp.displayContent).toEqual(expectedValue);
       expect(comp.model).toEqual(expectedValue);
     }));
});
