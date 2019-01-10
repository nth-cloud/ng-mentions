import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {DefaultComponent} from './default';
import {SupportComponent} from "./support";
import {NgxdMentionsComponent} from './components';
import {DEFAULT_TAB} from './shared/component-wrapper/component-wrapper.component';

const DEFAULT_API_PATH = {path: '', pathMatch: 'full', redirectTo: DEFAULT_TAB};

const componentRoutes = [{
    path: 'demo/toggle',
    children: [
      DEFAULT_API_PATH,
      {path: ':tab', component: NgxdMentionsComponent}
    ]
  }
];

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: DefaultComponent},
  {path: 'support', component: SupportComponent},
  {path: 'demo', pathMatch: 'full', redirectTo: 'demo/toggle' },
  ...componentRoutes,
  { path: '**', redirectTo: 'home' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {useHash: true});
