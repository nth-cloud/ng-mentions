import {Injectable} from '@angular/core';

export interface NthdDemoConfig {
  id?: string;
  title: string;
  code?: string;
  markup?: string;
  type: any;
  files?: Array<{[name: string]: string}>;
  showCode?: boolean;
}

export interface NthdDemoListConfig { [demo: string]: NthdDemoConfig }

export interface NthdDemoOverviewConfig { [anchor: string]: string; }

@Injectable({providedIn: 'root'})
export class NthdDemoList {
  private _demos: {[widget: string]: NthdDemoListConfig } = {};
  private _overviews: {[widget: string]: NthdDemoOverviewConfig } = {};

  register(widget: string, list: NthdDemoListConfig, overview?: NthdDemoOverviewConfig): void {
    this._demos[widget] = list;
    if (overview) {
      this._overviews[widget] = overview;
    }
  }

  getDemos(widget: string): NthdDemoListConfig {
    return this._demos[widget];
  }

  getOverviewSections(widget: string): {[fragment: string]: {fragment: string, title?: string}} {
    const overview = this._overviews[widget];
    const sections = {};
    if (overview) {
      Object.keys(overview).forEach(fragment => {
        sections[fragment] = {fragment, title: overview[fragment]};
      });
    }
    return sections;
  }
}
