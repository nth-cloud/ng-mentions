import {
    Directive, DoCheck,
    ElementRef,
    EventEmitter,
    forwardRef,
    Injector,
    Input,
    OnChanges, OnDestroy, OnInit,
    Output,
    SimpleChanges
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl} from "@angular/forms";
import {Subject} from "rxjs";

@Directive({
    selector: '[ngxMentionInput]',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgxMentionsInputDirective),
            multi: true
        }
    ]
})
export class NgxMentionsInputDirective implements OnChanges, OnInit, OnDestroy, ControlValueAccessor, DoCheck {
    @Output() valueChanges: EventEmitter<string> = new EventEmitter<string>();
    readonly stateChanges: Subject<void> = new Subject<void>();

    @Input()
    get value(): string {return this._value;}
    set value(value: string) {
        if (value !== this.value) {
            this._value = value;
            this.valueChanges.emit(value);
            if (this._onChange) {
                this._onChange(value);
            }
            this.stateChanges.next();
        }
    }

    @Input()
    get placeholder(): string {return this._placeholder;}
    set placeholder(value: string) {
        this._placeholder = value;
        this.stateChanges.next();
    }

    @Input()
    get required(): boolean {return this._required;}
    set required(value: boolean) {
        this._required = value;
        this.stateChanges.next();
    }

    @Input()
    get disabled(): boolean {return this._disabled;}
    set disabled(value: boolean) {
        this.setDisabledState(value);
        this.stateChanges.next();
    }

    get errorState(): boolean {
        return this._errorState;
    }

    private _onChange: (_:string) => void;
    private _placeholder: string;
    private _required: boolean;
    private _disabled: boolean;
    private _value: string;
    private ngControl: NgControl;
    private _errorState: boolean = false;

    constructor(
        private element: ElementRef,
        private injector: Injector
    ) {
        this._value = this.value;
    }

    get nativeElement(): Element {
        return this.element.nativeElement;
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.stateChanges.next();
    }

    ngOnInit(): void {
        this.ngControl = this.injector.get(NgControl);
        if (this.ngControl !== null) {
            this.ngControl.valueAccessor = this;
        }
    }

    ngDoCheck(): void {
        if (this.ngControl) {
            this._errorState = this.ngControl.invalid && this.ngControl.touched;
            this.stateChanges.next();
        }
    }

    ngOnDestroy(): void {
        this.stateChanges.complete();
    }

    registerOnChange(fn: any): void {
        this._onChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    setDisabledState(isDisabled: boolean): void {
        this._disabled = isDisabled;
    }

    writeValue(value: string): void {
        if (typeof value === 'string' || value === null) {
            this.valueChanges.emit(value);
        }
    }
}