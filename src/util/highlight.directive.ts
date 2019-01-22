import {Directive, Input} from '@angular/core';
import {Tag} from './interfaces';

@Directive({selector: 'highlighted'})
export class HighlightedDirective { @Input() tag: Tag; }
