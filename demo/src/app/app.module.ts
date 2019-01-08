import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {DefaultComponent} from './default';
import {GettingStarted} from './getting-started';
import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {NgxdDemoModule} from './components';
import {NgxdSharedModule} from './shared';
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    DefaultComponent,
    GettingStarted
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    routing,
    NgbModule.forRoot(),
    NgxdDemoModule,
    NgxdSharedModule
  ],
  bootstrap: [AppComponent]
})
export class NgxdModule {
}
