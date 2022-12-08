import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NthdNav, NthdNavContent, NthdNavItem, NthdNavLink} from './nav';
import {NthdNavOutlet, NthdNavPane} from './nav-outlet';

const NTHD_NAV_DIRECTIVES = [NthdNavContent, NthdNav, NthdNavItem, NthdNavLink, NthdNavOutlet, NthdNavPane];

@NgModule({declarations: NTHD_NAV_DIRECTIVES, exports: NTHD_NAV_DIRECTIVES, imports: [CommonModule]})
export class NthdNavModule {
}
