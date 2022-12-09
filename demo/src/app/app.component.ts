import {ActivatedRoute} from '@angular/router';
import {Component, NgZone, OnInit} from '@angular/core';
import {ViewportScroller} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {Analytics} from './shared/analytics/analytics';

import '../style/app.scss';
import {environment} from '../environments/environment';

@Component({
  selector: 'nthd-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  navbarCollapsed = false;
  downloadCount: number|string = '';

  constructor(
    private _analytics: Analytics, route: ActivatedRoute, vps: ViewportScroller, zone: NgZone,
    httpClient: HttpClient) {
    route.fragment.pipe(filter(fragment => !!fragment))
      .subscribe((fragment: string) => zone.runOutsideAngular(() => requestAnimationFrame(() => vps.scrollToAnchor(fragment))));

    if (environment.production) {
      httpClient.get<{ downloads: string }>('https://api.npmjs.org/downloads/point/last-month/@nth-cloud/ng-mentions')
        .pipe(map(data => data?.downloads))
        .subscribe({next: count => this.downloadCount = count.toLocaleString(), error: () => of('')});
    }
  }

  ngOnInit(): void {
    this._analytics.trackPageViews();
  }
}
