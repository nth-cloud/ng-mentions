import {toHaveCssClass} from "./matchers/toHaveCssClass";

// Timeouts
jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

function buildError(isNot: boolean) {
  return function(actual: HTMLElement, className: string) {
    return {
      pass: toHaveCssClass(className, actual) === !isNot,
      message: `Expected ${actual.outerHTML} ${isNot ? 'not ' : ''}to contain the CSS class "${className}"`
    };
  };
}

// Matchers
beforeEach(() => {
  jasmine.addMatchers({
    toHaveCssClass: function(util, customEqualityTests) {
      return {
        compare: buildError(false),
        negativeCompare: buildError(true)
      };
    }
  });
});
