import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Key} from '../key';

function normalizeText(txt: string): string {
  return txt.trim().replace(/\s+/g, ' ');
}

export function createGenericTestComponent<T>(html: string, type: {new (...args: any[]): T}): ComponentFixture<T> {
  TestBed.overrideComponent(type, {set: {template: html}});
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture as ComponentFixture<T>;
}

export type Browser = 'ie9'|'ie10'|'ie11'|'ie'|'edge'|'chrome'|'safari'|'firefox';

export function getBrowser(ua = window.navigator.userAgent) {
  let browser = 'unknown';

  // IE < 11
  const msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    return 'ie' + parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  // IE 11
  if (ua.indexOf('Trident/') > 0) {
    let rv = ua.indexOf('rv:');
    return 'ie' + parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  // Edge
  if (ua.indexOf('Edge/') > 0) {
    return 'edge';
  }

  // Chrome
  if (ua.indexOf('Chrome/') > 0) {
    return 'chrome';
  }

  // Safari
  if (ua.indexOf('Safari/') > 0) {
    return 'safari';
  }

  // Firefox
  if (ua.indexOf('Firefox/') > 0) {
    return 'firefox';
  }

  if (browser === 'unknown') {
    throw new Error('Browser detection failed for: ' + ua);
  }
}

export function isBrowser(browsers: Browser|Browser[], ua = window.navigator.userAgent) {
  let browsersStr = Array.isArray(browsers) ? (browsers as Browser[]).map(x => x.toString()) : [browsers.toString()];
  let browser = getBrowser(ua);

  if (browsersStr.indexOf('ie') > -1 && browser.startsWith('ie')) {
    return true;
  } else {
    return browsersStr.indexOf(browser) > -1;
  }
}

export function createKeyEvent(
    options: {key?: Key, type: 'keyup'|'keydown'|'input', bubbles?: boolean, cancelable?: boolean} = {
      key: null,
      type: 'keyup',
      bubbles: true,
      cancelable: true
    }): Event {
  let eventInitDict: any = {bubbles: options.bubbles, cancelable: options.cancelable};
  if (options.key === Key.Shift) {
    eventInitDict.shiftKey = true;
    options.key = null;
  }
  let event;
  const isIE = isBrowser(['ie10', 'ie11']);
  if (isIE && options.type === 'input') {
    event = document.createEvent('MouseEvent');
    event.initEvent(options.type, options.bubbles, options.cancelable);
  } else if (isIE) {
    event = document.createEvent('KeyboardEvent');
    event.initEvent(options.type, options.cancelable, options.bubbles);
    // event.initKeyboardEvent(options.type, options.cancelable, options.bubbles, window, 0, 0, 0, 0, 0);
  } else {
    event = new KeyboardEvent(options.type, eventInitDict)
  }
  if (options.key) {
    delete event.keyCode;
    Object.defineProperties(event, {
      which: {get: () => options.key},
      keyCode: {get: () => options.key},
      shiftKey: {get: () => options.key === Key.Shift},
      altKey: {get: () => false},
      ctrlKey: {get: () => false},
      metaKey: {get: () => false},
    });
  }

  return event;
}

export function expectResults(element: HTMLElement, resultsDef: string[]) {
  const elements = element.querySelectorAll('li');

  expect(elements.length).toEqual(resultsDef.length);
  for (let i = 0; i < resultsDef.length; i++) {
    let resultDef = resultsDef[i];
    let classIndicator = resultDef.charAt(0);

    if (classIndicator === '+') {
      expect(elements[i]).toHaveCssClass('active');
      expect(normalizeText(elements[i].textContent)).toEqual(resultDef.substr(1));
    } else {
      expect(elements[i]).not.toHaveCssClass('active');
      expect(normalizeText(elements[i].textContent)).toEqual(resultDef);
    }
  }
}
