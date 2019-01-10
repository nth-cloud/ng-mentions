import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule} from "@angular/forms";

import {PrismComponent} from "./default/prism.component";
import {DefaultComponent} from './default';
import {SupportComponent} from "./support";
import {AppComponent} from './app.component';
import {routing} from './app.routing';
import {NgxdDemoModule} from './components';
import {NgxdSharedModule} from './shared';

@NgModule({
    declarations: [
        AppComponent,
        DefaultComponent,
        SupportComponent,
        PrismComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        routing,
        NgbModule.forRoot(),
        NgxdDemoModule,
        NgxdSharedModule
    ],
    bootstrap: [AppComponent]
})
export class NgxdModule {
}
