import {NgxMentionsModule} from 'ngx-mentions';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [NgxMentionsModule, ...],
  bootstrap: [AppComponent]
})
export class AppModule {
}