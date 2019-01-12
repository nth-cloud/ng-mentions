
export type ToHaveCssClass = (className: string, expectationFailOutput?: any) => boolean;

declare global {
  namespace jasmine {
    interface Matchers<T> {
      toHaveCssClass: ToHaveCssClass;
    }
  }
}

export const toHaveCssClass: ToHaveCssClass = (className: string, actual: HTMLElement) =>
    actual.classList.contains(className);