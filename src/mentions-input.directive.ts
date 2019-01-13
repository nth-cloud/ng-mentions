import {Directive, ElementRef, forwardRef, OnDestroy, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MentionsComponent} from './mentions.component';

/**
 * The NgxMentionsAccessorDirective directive is used to indicate the input element.
 * This directive is required.
 */
@Directive({
  exportAs: 'ngxMentions',
  selector: 'ng-mentions',
  host: {'(change)': 'onChange($event)', '(touch)': 'onTouched()'},
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MentionsAccessorDirective), multi: true}]
})
export class MentionsAccessorDirective implements OnInit, OnDestroy, ControlValueAccessor {
  private _onChange: (_: string) => void;
  private _onTouch: () => void;
  private _destroyed: Subject<void> = new Subject<void>();

  constructor(private element: ElementRef, private host: MentionsComponent) {}

  ngOnInit(): void {
    this.host.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(value => this.onChange(value));
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.host.disabled = isDisabled;
  }

  writeValue(value: string): void {
    if (typeof value === 'string' || value === null) {
      this.host.value = value;
    }
  }

  onChange(value: any) {
    if (this._onChange) {
      this._onChange(value);
    }
  }

  onTouched() {
    if (this._onTouch) {
      this._onTouch();
    }
  }
}
