import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgMentionsModule} from '@nth-cloud/ng-mentions';

import {ComponentWrapper} from './component-wrapper/component-wrapper.component';
import {PageWrapper} from './page-wrapper/page-wrapper.component';
import {Analytics} from './analytics/analytics';
import {NthdCodeComponent} from './code/code.component';
import {CodeHighlightService} from './code/code-highlight.service';
import {NthSideNavComponent} from './side-nav/side-nav.component';
import {NthdIcons} from './icons/icons.component';
import {NthdFragment} from './fragment/fragment.directive';
import {NthdPageHeaderComponent} from './page-wrapper/page-header.component';
import {NthdNavModule} from './nav/nav.module';

export {componentsList} from './side-nav/side-nav.component';

@NgModule({
  imports: [CommonModule, RouterModule, NthdNavModule, NgMentionsModule, FormsModule, ReactiveFormsModule],
  exports: [
    CommonModule, RouterModule, ReactiveFormsModule, FormsModule, HttpClientModule, NgMentionsModule,
    ComponentWrapper, PageWrapper, NthdPageHeaderComponent,
    NthdCodeComponent, NthdFragment, NthdNavModule, NthSideNavComponent, NthdIcons,
  ],
  declarations: [
    ComponentWrapper,
    PageWrapper,
    NthdPageHeaderComponent,
    NthdFragment,
    NthSideNavComponent,
    NthdCodeComponent,
    NthdIcons,
  ],
  providers: [Analytics, CodeHighlightService]
})
export class NthdSharedModule {
}
