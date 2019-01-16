import {NgMentionsModule} from '@nth-cloud/ng-mentions';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [NgMentionsModule, ...],
  bootstrap: [AppComponent]
})
export class AppModule {
}
