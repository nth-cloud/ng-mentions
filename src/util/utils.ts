export const styleProperties = Object.freeze([
  'direction',  // RTL support
  'boxSizing',
  'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height', 'minHeight', 'minWidth', 'overflowX',
  'overflowY',  // copy the scrollbar for IE

  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderStyle',

  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust', 'lineHeight', 'fontFamily',

  'textAlign', 'textTransform', 'textIndent',
  'textDecoration',  // might not make a difference, but better be safe

  'letterSpacing', 'wordSpacing',

  'tabSize', 'MozTabSize'
]);
const isBrowser = typeof window !== 'undefined';
const isFirefox = isBrowser && (<any>window).mozInnerScreenX != null;

function isInputOrTextAreaElement(element?: HTMLElement): boolean {
  return element !== null &&
      (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA' || element.nodeName === '#text');
}

function spliceString(value: string, start: number, end: number, insert: string): string {
  return value.substring(0, start) + insert + value.substring(end) + '';
}

function iterateMentionsMarkup(
    value: string, mentionMarkup: MarkupMention, textIterator: (..._: any[]) => void,
    markupIterator: (..._: any[]) => void, displayTransform: (..._: string[]) => string) {
  let match; let start = 0;
  let currentPlainTextIndex = 0;
  const regEx = mentionMarkup.regEx;
  regEx.lastIndex = 0;
  while ((match = regEx.exec(value)) !== null) {
    const display = displayTransform(...match);
    const substr = value.substring(start, match.index);
    textIterator(substr, start, currentPlainTextIndex);
    currentPlainTextIndex += substr.length;
    markupIterator(match[0], match.index, currentPlainTextIndex, display);
    currentPlainTextIndex += display.length;
    start = regEx.lastIndex;
  }

  if (start < value.length) {
    textIterator(value.substring(start), start, currentPlainTextIndex);
  }
}

function iterateOnlyMentionsMarkup(
    value: string, mentionMarkup: MarkupMention, markupIterator: (..._: any[]) => boolean,
    displayTransform: (..._: string[]) => string) {
  let match; let start = 0; let currentPlainTextIndex = 0;
  const regEx = mentionMarkup.regEx;
  regEx.lastIndex = 0;
  while ((match = regEx.exec(value)) !== null) {
    const display = displayTransform(...match);
    const substr = value.substring(start, match.index);
    currentPlainTextIndex += substr.length;
    markupIterator(match[0], match.index, currentPlainTextIndex, display);
    currentPlainTextIndex += display.length;
    start = regEx.lastIndex;
  }
}

export function mapPlainTextIndex(
    value: string, mentionMarkup: MarkupMention, indexInPlainText: number, toEndOfMarkup: boolean,
    displayTransform: (..._: string[]) => string): number {
  if (isNaN(indexInPlainText)) {
    return indexInPlainText;
  }

  let result;
  const textIterator = (matchString: string, index: number, substringPlainTextIndex: number) => {
    if (typeof result !== 'undefined') {
      return;
    }
    if (substringPlainTextIndex + matchString.length >= indexInPlainText) {
      result = index + indexInPlainText - substringPlainTextIndex;
    }
  };
  const markupIterator = (matchString: string, index: number, mentionPlainTextIndex: number, display: string) => {
    if (typeof result !== 'undefined') {
      return;
    }

    if (mentionPlainTextIndex + display.length > indexInPlainText) {
      result = index + (toEndOfMarkup ? matchString.length : 0);
    }
  };

  iterateMentionsMarkup(value, mentionMarkup, textIterator, markupIterator, displayTransform);

  return typeof result !== 'undefined' ? result : value.length;
}

export function getCaretPosition(element: HTMLInputElement): number {
  if (isInputOrTextAreaElement(element)) {
    const value = element.value;
    return value.slice(0, element.selectionStart).length;
  }

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    return range.startOffset;
  }

  return 0;
}

export function getCaretCoordinates(element: HTMLTextAreaElement, position: number): {top: number, left: number} {
  let coords = {top: 0, left: 0};
  if (!isBrowser) {
    return coords;
  }
  const div = document.createElement('div');
  document.body.appendChild(div);
  const style = div.style;
  const computed = getElementStyle(element);
  style.whiteSpace = 'pre-wrap';
  if (element.nodeName !== 'INPUT') {
    style.wordWrap = 'break-word';
  }
  style.position = 'absolute';
  style.visibility = 'hidden';
  styleProperties.forEach(prop => style[prop] = computed[prop]);
  if (isFirefox) {
    if (element.scrollHeight > parseInt(computed.height, 10)) {
      style.overflowY = 'scroll';
    }
  } else {
    style.overflow = 'hidden';
  }
  div.textContent = element.value.substring(0, position);
  if (element.nodeName === 'INPUT') {
    div.textContent = div.textContent.replace(/\s/g, '\u00a0');
  }

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  let scrollTop = 0;
  if (element.scrollTop > 0) {
    scrollTop = element.scrollTop;
  }

  coords = {
    top: span.offsetTop + parseInt(computed['borderTopWidth'], 10) - scrollTop,
    left: span.offsetLeft + parseInt(computed['borderLeftWidth'], 10)
  };

  document.body.removeChild(div);

  return coords;
}

export function getElementStyle(element: HTMLElement, property?: string): any {
  const style = window.getComputedStyle ? getComputedStyle(element) : (<any>element).currentStyle;
  if (property && typeof property === 'string' && typeof style[property] !== 'undefined') {
    return style[property];
  } else if (property && typeof property === 'string') {
    return null;
  }

  return style;
}

export function setCaretPosition(element: HTMLInputElement, position: number): void {
  if (isInputOrTextAreaElement(element) && element.selectionStart !== undefined) {
    element.focus();
    element.setSelectionRange(position, position);
  } else {
    const range = document.createRange();
    range.setStart(element, position);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function escapeRegExp(str: string): string {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export interface MarkupMention {
  markup: string;
  regEx: RegExp;
  groups: {[key: string]: number};
}

export function markupToRegExp(markup: string): MarkupMention {
  const placeholderRegExp = /__([\w]+)__/g;
  const placeholderExclusion = '^\\)\\]';
  let markupPattern = escapeRegExp(markup);
  const placeholders = {};
  let match; let i = 1;
  do {
    match = placeholderRegExp.exec(markupPattern);
    if (match) {
      const placeholder = match[1];
      markupPattern = markupPattern.replace(`__${placeholder}__`, `([${placeholderExclusion}]+)`);
      placeholders[placeholder] = ++i;
    }
  } while (match);

  return {markup, regEx: new RegExp('(' + markupPattern + ')', 'ig'), groups: placeholders};
}

export function getPlainText(
    value: string, mentionMarkup: MarkupMention, displayTransform: (..._: string[]) => string) {
  mentionMarkup.regEx.lastIndex = 0;
  return value.replace(mentionMarkup.regEx, displayTransform);
}

export function replacePlaceholders(item: any, markupMention: MarkupMention): string {
  let result = markupMention.markup + '';
  Object.keys(markupMention.groups)
      .forEach(
          key => result = result.replace(new RegExp(`__${key}__`, 'g'), typeof item === 'string' ? item : item[key]));

  return result;
}

export function applyChangeToValue(
    value: string, markupMention: MarkupMention, plainTextValue: string, selectionStartBeforeChange: number = 0,
    selectionEndBeforeChange: number = 0, selectionEndAfterChange: number = 0,
    displayTransform: (..._: string[]) => string) {
  const oldPlainTextValue = getPlainText(value, markupMention, displayTransform);
  const lengthDelta = oldPlainTextValue.length - plainTextValue.length;
  if (!selectionStartBeforeChange) {
    selectionStartBeforeChange = selectionEndBeforeChange + lengthDelta;
  }
  if (!selectionEndBeforeChange) {
    selectionEndBeforeChange = selectionStartBeforeChange;
  }

  if (selectionStartBeforeChange === selectionEndBeforeChange && selectionEndBeforeChange === selectionEndAfterChange &&
      oldPlainTextValue.length === plainTextValue.length) {
    selectionStartBeforeChange--;
  }

  const insert = plainTextValue.slice(selectionStartBeforeChange, selectionEndAfterChange);
  const spliceStart = Math.min(selectionStartBeforeChange, selectionEndAfterChange);
  let spliceEnd = selectionEndBeforeChange;
  if (selectionStartBeforeChange === selectionEndAfterChange) {
    spliceEnd = Math.max(selectionEndBeforeChange, selectionStartBeforeChange + lengthDelta);
  }

  return spliceString(
      value, mapPlainTextIndex(value, markupMention, spliceStart, false, displayTransform),
      mapPlainTextIndex(value, markupMention, spliceEnd, true, displayTransform), insert);
}

export function findStartOfMentionInPlainText(
    value: string, mentionMarkup: MarkupMention, indexInPlainText: number,
    displayTransform: (..._: string[]) => string): {start: number, end: number} {
  let result = {start: -1, end: -1};
  const markupIterator =
      (matchString: string, index: number, mentionPlainTextIndex: number, display: string): boolean => {
        if (mentionPlainTextIndex < indexInPlainText && mentionPlainTextIndex + display.length > indexInPlainText) {
          result = {start: mentionPlainTextIndex, end: mentionPlainTextIndex + display.length};
          return true;
        }

        return false;
      };
  iterateOnlyMentionsMarkup(value, mentionMarkup, markupIterator, displayTransform);

  return result;
}

export function getBoundsOfMentionAtPosition(
    value: string, mentionMarkup: MarkupMention, indexInPlainText: number,
    displayTransform: (..._: string[]) => string): {start: number, end: number} {
  return findStartOfMentionInPlainText(value, mentionMarkup, indexInPlainText, displayTransform);
}

export function escapeHtml(text: string) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function isCoordinateWithinRect(rect: ClientRect, x: number, y: number) {
  return (rect.left < x && x < rect.right) && (rect.top < y && y < rect.bottom);
}

export class Highlighted {
  constructor(public readonly element: Element, public readonly type: string = null) {}

  get clientRect(): ClientRect {
    return this.element.getBoundingClientRect();
  }
}
