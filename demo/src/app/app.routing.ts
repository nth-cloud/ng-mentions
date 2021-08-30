import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';
import {DefaultComponent} from './default';
import {SupportComponent} from './support';
import {NthdMentionsComponent} from './components';
import {NthdHighlighterComponent} from './components/highlighter';
import {DEFAULT_TAB} from './shared/component-wrapper/component-wrapper.component';

const DEFAULT_API_PATH = {path: '', pathMatch: 'full', redirectTo: DEFAULT_TAB};

const componentRoutes = [
  {
    path: 'docs/mentions',
    children: [
      DEFAULT_API_PATH,
      {path: ':tab', component: NthdMentionsComponent}
    ]
  },
  {
    path: 'docs/highlighter',
    children: [
      DEFAULT_API_PATH,
      {path: ':tab', component: NthdHighlighterComponent}
    ]
  }
];

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: DefaultComponent},
  {path: 'support', component: SupportComponent},
  {path: 'docs', pathMatch: 'full', redirectTo: 'docs/mentions' },
  ...componentRoutes,
  { path: '**', redirectTo: 'home' }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' });
