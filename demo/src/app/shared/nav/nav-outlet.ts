import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  Input, NgZone, QueryList,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import {NthdNav, NthdNavItem} from './nav';
import {distinctUntilChanged, skip, startWith, takeUntil} from 'rxjs/operators';
import {nthdNavFadeInTransition, nthdNavFadeOutTransition, nthdRunTransition, NthdTransitionOptions} from './nav-transition';

@Directive({
  selector: '[nthdNavPane]',
  host: {
    '[id]': 'item.panelDomId',
    'class': 'tab-pane',
    '[class.fade]': 'nav.animation',
    '[attr.role]': 'role ? role : nav.roles ? "tabpanel" : undefined',
    '[attr.aria-labelledby]': 'item.domId'
  }
})
export class NthdNavPane {
  @Input() item: NthdNavItem;
  @Input() nav: NthdNav;
  @Input() role: string;

  constructor(public elRef: ElementRef<HTMLElement>) {}
}

@Component({
  selector: '[nthdNavOutlet]',
  host: {'[class.tab-content]': 'true'},
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template ngFor let-item [ngForOf]="nav.items">
      <div nthdNavPane *ngIf="item.isPanelInDom() || isPanelTransitioning(item)" [item]="item" [nav]="nav" [role]="paneRole">
        <ng-template [ngTemplateOutlet]="item.contentTpl?.templateRef || null"
                     [ngTemplateOutletContext]="{$implicit: item.active || isPanelTransitioning(item)}"></ng-template>
      </div>
    </ng-template>
  `
})
export class NthdNavOutlet implements AfterViewInit {
  private _activePane: NthdNavPane | null = null;

  @ViewChildren(NthdNavPane) private _panes: QueryList<NthdNavPane>;

  /**
   * A role to set on the nav pane
   */
  @Input() paneRole;

  /**
   * Reference to the `NthdNav`
   */
  @Input('nthdNavOutlet') nav: NthdNav;

  constructor(private _cd: ChangeDetectorRef, private _ngZone: NgZone) {}

  isPanelTransitioning(item: NthdNavItem) { return this._activePane ?.item === item; }

  ngAfterViewInit() {
    // initial display
    this._updateActivePane();

    // this will be emitted for all 3 types of nav changes: .select(), [activeId] or (click)
    this.nav.navItemChange$
      .pipe(takeUntil(this.nav.destroy$), startWith(this._activePane ?.item || null), distinctUntilChanged(), skip(1))
      .subscribe(nextItem => {
        const options: NthdTransitionOptions<undefined> = {animation: this.nav.animation, runningTransition: 'stop'};

        // next panel we're switching to will only appear in DOM after the change detection is done
        // and `this._panes` will be updated
        this._cd.detectChanges();

        // fading out
        if (this._activePane) {
          nthdRunTransition(this._ngZone, this._activePane.elRef.nativeElement, nthdNavFadeOutTransition, options)
            .subscribe(() => {
              const activeItem = this._activePane ?.item;
              this._activePane = this._getPaneForItem(nextItem);

              // mark for check when transition finishes as outlet or parent containers might be OnPush
              // without this the panes that have "faded out" will stay in DOM
              this._cd.markForCheck();

              // fading in
              if (this._activePane) {
                // we have to add the '.active' class before running the transition,
                // because it should be in place before `nthdRunTransition` does `reflow()`
                this._activePane.elRef.nativeElement.classList.add('active');
                nthdRunTransition(this._ngZone, this._activePane.elRef.nativeElement, nthdNavFadeInTransition, options)
                  .subscribe(() => {
                    if (nextItem) {
                      nextItem.shown.emit();
                      this.nav.shown.emit(nextItem.id);
                    }
                  });
              }

              if (activeItem) {
                activeItem.hidden.emit();
                this.nav.hidden.emit(activeItem.id);
              }
            });
        } else {
          this._updateActivePane();
        }
      });
  }

  private _updateActivePane() {
    this._activePane = this._getActivePane();
    this._activePane ?.elRef.nativeElement.classList.add('show');
    this._activePane ?.elRef.nativeElement.classList.add('active');
  }

  private _getPaneForItem(item: NthdNavItem | null) {
    return this._panes && this._panes.find(pane => pane.item === item) || null;
  }

  private _getActivePane(): NthdNavPane | null {
    return this._panes && this._panes.find(pane => pane.item.active) || null;
  }
}
