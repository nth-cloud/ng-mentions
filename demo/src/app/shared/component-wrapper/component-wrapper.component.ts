import {Component, NgZone, OnDestroy, Type} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {NthdExamplesComponent} from '../../components/shared/example-page/examples.component';
import {NthdApiPage} from '../../components/shared/api-page/api.component';

export type TableOfContents = {fragment: string, title: string}[];

@Component({
  selector: 'nthd-component-wrapper',
  templateUrl: './component-wrapper.component.html'
})
export class ComponentWrapper implements OnDestroy {
  public component: string;

  public activeTab = 'examples';

  public headerComponentType$: Observable<Type<any>>;

  public isLargeScreenOrLess: boolean;
  public isSmallScreenOrLess: boolean;

  public tableOfContents: TableOfContents = [];

  public sidebarCollapsed = false;

  private _routerSubscription: Subscription;

  constructor(public route: ActivatedRoute, private _router: Router, ngZone: NgZone) {
    this._routerSubscription = this._router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        const parentRoute = this.route.snapshot.parent;
        const tabRoute = this.route.snapshot.firstChild;
        this.component = parentRoute!.url[1].path;
        this.activeTab = tabRoute!.url[0].path;
      });

    this.headerComponentType$ = this.route.data.pipe(map(data => data?.header));
    const smallScreenQL = matchMedia('(max-width: 767.98px)');
    // eslint-disable-next-line deprecation/deprecation
    smallScreenQL.addListener((event) => ngZone.run(() => this.isSmallScreenOrLess = event.matches));
    this.isSmallScreenOrLess = smallScreenQL.matches;

    const largeScreenQL = matchMedia('(max-width: 1199.98px)');
    this.isLargeScreenOrLess = largeScreenQL.matches;
    // eslint-disable-next-line deprecation/deprecation
    largeScreenQL.addListener((event) => ngZone.run(() => this.isLargeScreenOrLess = event.matches));
  }

  ngOnDestroy(): void {
    this._routerSubscription.unsubscribe();
  }

  updateNavigation(component: NthdExamplesComponent | NthdApiPage | any): void {
    const getLinks = (typeCollection: string[]) => {
      return typeCollection.map(item => ({
        fragment: item,
        title: item
      }));
    };
    this.tableOfContents = [];
    if (component instanceof NthdExamplesComponent) {
      this.tableOfContents = component.demos.map(demo => {
        return {
          fragment: demo.id,
          title: demo.title
        };
      });
    } else if (component instanceof NthdApiPage) {
      let toc = getLinks(component.components);
      if (component.classes.length > 0) {
        const klasses = getLinks(component.classes);
        toc = toc.concat(toc.length > 0 ? [<any>{}, ...klasses] : klasses);
      }

      if (component.configs.length > 0) {
        const configs = getLinks(component.configs);
        toc = toc.concat(toc.length > 0 ? [<any>{}, ...configs] : configs);
      }

      this.tableOfContents = toc;
    } else {
      this.tableOfContents = Object.values(component.sections).map(section => section) as TableOfContents;
    }
  }
}
