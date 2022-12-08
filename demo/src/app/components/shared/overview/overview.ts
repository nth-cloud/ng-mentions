export interface NthdOverviewSection {
  title: string | false;
  fragment: string;
}

export interface NthdOverview {
  [fragment: string]: NthdOverviewSection;
}
