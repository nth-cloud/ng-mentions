import {
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnChanges, OnDestroy,
    Optional,
    Output,
    Self, SimpleChanges
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";
import {Subject} from "rxjs";

@Directive({
    selector: '[ngxMentionInput]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxMentionsInputDirective)
        }
    ]
})
export class NgxMentionsInputDirective implements OnChanges, OnDestroy, ControlValueAccessor {
    @Output() valueChanges: EventEmitter<string> = new EventEmitter<string>();
    readonly stateChanges: Subject<void> = new Subject<void>();
    readonly disabledChanges: Subject<boolean> = new Subject<boolean>();

    @Input()
    get value(): string {return this._inputValueAccessor.value;}
    set value(value: string) {
        if (value !== this.value) {
            this._inputValueAccessor.value = value;
            this.stateChanges.next();
            this.valueChanges.emit(value);
        }
    }

    private _inputValueAccessor: {value: any};

    constructor(
        private element: ElementRef,
        @Optional() @Self() public ngControl: NgControl,
        @Optional() @Self() @Inject(NG_VALUE_ACCESSOR) inputValueAccessor: any
    ) {
        this._inputValueAccessor = inputValueAccessor || element.nativeElement;
    }

    get nativeElement(): Element {
        return this.element.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.stateChanges.next();
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabledChanges.next(isDisabled);
    }

    writeValue(obj: any): void {
        if (typeof obj === 'string') {
            this.valueChanges.emit(obj);
        }
    }
}