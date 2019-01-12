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
    key: Key|number = null, options: {type: 'keyup'|'keydown'|'input', bubbles?: boolean, cancelable?: boolean} = {
      type: 'keyup',
      bubbles: true,
      cancelable: true
    }) {
  let eventInitDict: any = {bubbles: options.bubbles, cancelable: options.cancelable};
  if (key) {
    eventInitDict.key = String.fromCharCode(key);
  }
  const event = new KeyboardEvent(options.type, eventInitDict);
  if (key) {
    Object.defineProperties(event, {which: {get: () => key}});
    Object.defineProperties(event, {keyCode: {get: () => key}});
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