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

// eslint-disable-next-line max-len
const mobileRegEx = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
// eslint-disable-next-line max-len
const mobileRegEx2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
export function isMobileOrTablet() {
  const agent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return mobileRegEx.test(agent) || mobileRegEx2.test(agent.substr(0, 4));
}

function isInputOrTextAreaElement(element?: HTMLElement): boolean {
  return element !== null &&
      (element.nodeName.toUpperCase() === 'INPUT' || element.nodeName.toUpperCase() === 'TEXTAREA' || element.nodeName === '#text');
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
    return value.slice(0, element.selectionStart).length - (isMobileOrTablet() ? 1 : 0);
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
    element.selectionStart = position;
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
