import {MentionsModule} from '@nth-cloud/ng-mentions';

@NgModule({
  declarations: [AppComponent, ...],
  imports: [MentionsModule, ...],
  bootstrap: [AppComponent]
})
export class AppModule {
}
