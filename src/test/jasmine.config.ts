// Timeouts
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

export type ToHaveCssClass = (className: string, expectationFailOutput?: any) => boolean;
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    interface Matchers<T> {
      toHaveCssClass: ToHaveCssClass;
    }
  }
}

function buildError(isNot: boolean) {
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  return function (actual: HTMLElement, className: string) {
    return {
      pass: actual.classList.contains(className) === !isNot,
      message: `Expected ${actual.outerHTML} ${isNot ? 'not ' : ''}to contain the CSS class "${className}"`,
    };
  };
}

// Matchers
beforeEach(() => {
  jasmine.addMatchers({
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    toHaveCssClass: function () {
      return { compare: buildError(false), negativeCompare: buildError(true) };
    },
  });
});
