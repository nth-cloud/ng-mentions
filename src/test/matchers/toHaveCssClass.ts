
export type ToHaveCssClass = (className: string, expectationFailOutput?: any) => boolean;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    interface Matchers<T> {
      toHaveCssClass: ToHaveCssClass;
    }
  }
}

export const toHaveCssClass: ToHaveCssClass = (className: string, actual: HTMLElement) =>
    actual.classList.contains(className);
