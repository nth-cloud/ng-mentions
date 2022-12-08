import { Routes, RouterModule } from '@angular/router';
import {ModuleWithProviders} from '@angular/core';

import {ROUTES as MENTIONS_ROUTES} from './components/mentions/mentions.module';
import {ROUTES as HIGHLIGHTER_ROUTES} from './components/highlighter/highlighter.module';

import {DefaultComponent} from './default';
import {SupportComponent} from './support';

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'home'},
  {path: 'home', component: DefaultComponent},
  {path: 'support', component: SupportComponent},
  {path: 'components', pathMatch: 'full', redirectTo: 'components/mentions' },
  {path: 'components/mentions', children: MENTIONS_ROUTES},
  {path: 'components/highlighter', children: HIGHLIGHTER_ROUTES},
  {path: '**', redirectTo: 'home'}
];

export const routing: ModuleWithProviders<RouterModule> =
  RouterModule.forRoot(routes, { enableTracing: true, useHash: true, scrollPositionRestoration: 'enabled' });

