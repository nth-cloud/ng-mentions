export const styleProperties = Object.freeze([
    'direction', // RTL support
    'boxSizing',
    'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY', // copy the scrollbar for IE

    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderStyle',

    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',

    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',

    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration', // might not make a difference, but better be safe

    'letterSpacing',
    'wordSpacing',

    'tabSize',
    'MozTabSize'
]);
const isBrowser = typeof window !== 'undefined';
const isFirefox = isBrowser && (<any>window).mozInnerScreenX != null;

function isInputOrTextAreaElement(element?: HTMLElement): boolean {
    return element !== null && (
        element.nodeName === 'INPUT' ||
        element.nodeName === 'TEXTAREA' ||
        element.nodeName === '#text'
    );
}

function spliceString(value: string, start: number, end: number, insert: string): string {
    return value.substring(0, start) + insert + value.substring(end);
}

function iterateMentionsMarkup(
    value: string,
    mentionMarkup: MarkupMention,
    textIterator: (..._: any[]) => void,
    markupIterator: (..._: any[]) => void,
    displayTransform: (..._: string[]) => string
) {
    let match, start = 0, currentPlainTextIndex = 0;
    let regEx = mentionMarkup.regEx;
    regEx.lastIndex = 0;
    while((match = regEx.exec(value)) !== null) {
        let display = displayTransform(...match);
        let substr = value.substring(start, match.index);
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
    value: string,
    mentionMarkup: MarkupMention,
    markupIterator: (..._: any[]) => boolean,
    displayTransform: (..._: string[]) => string
) {
    let match, start = 0, currentPlainTextIndex = 0;
    let regEx = mentionMarkup.regEx;
    regEx.lastIndex = 0;
    while((match = regEx.exec(value)) !== null) {
        let display = displayTransform(...match);
        let substr = value.substring(start, match.index);
        currentPlainTextIndex += substr.length;
        currentPlainTextIndex += display.length;
        start = regEx.lastIndex;
    }
}

export function mapPlainTextIndex(
    value: string,
    mentionMarkup: MarkupMention,
    indexInPlainText: number,
    toEndOfMarkup: boolean,
    displayTransform: (..._: string[]) => string
): number {
    if (isNaN(indexInPlainText)) {
        return indexInPlainText;
    }

    let result;
    const textIterator = (substr: string, index: number, substringPlainTextIndex: number) => {
        if (typeof result !== 'undefined') {
            return;
        }
        if (substringPlainTextIndex + substr.length >= indexInPlainText) {
            result = index + indexInPlainText - substringPlainTextIndex;
        }
    };
    const markupIterator = (index: number, mentionPlainTextIndex: number, display: string) => {
        if (typeof result !== 'undefined') {
            return;
        }

        if (mentionPlainTextIndex + display.length > indexInPlainText) {
            result = index + (toEndOfMarkup ? mentionMarkup.markup.length : 0);
        }
    };

    iterateMentionsMarkup(value, mentionMarkup, textIterator, markupIterator, displayTransform);

    return typeof result !== 'undefined' ? result : value.length;
}

export function getCaretPosition(element: HTMLInputElement): number {
    if (isInputOrTextAreaElement(element)) {
        let value = element.value;
        return value.slice(0, element.selectionStart).length;
    }

    let selection = window.getSelection();
    if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        return range.startOffset;
    }

    return 0;
}

export function getCaretCoordinates(element: HTMLInputElement, position: number): {top: number, left: number} {
    let coords = {top: 0, left: 0};
    if (!isBrowser) {
        return coords;
    }
    const div = document.createElement('div');
    document.body.appendChild(div);
    let style = div.style;
    const computed = window.getComputedStyle ? getComputedStyle(element) : (<any>element).currentStyle;
    style.whiteSpace = 'pre-wrap';
    if (element.nodeName !== 'INPUT') {
        style.wordWrap = 'break-word';
    }
    style.position = 'absolute';
    style.visibility = 'hidden';
    styleProperties.forEach(prop => style[prop] = computed[prop]);
    if (isFirefox) {
        if (element.scrollHeight > parseInt(computed.height)) {
            style.overflowY = 'scroll';
        }
    } else {
        style.overflow = 'hidden';
    }
    div.textContent = element.value.substring(0, position);
    if (element.nodeName === 'INPUT') {
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');
    }

    let span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    coords = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth'])
    };

    document.body.removeChild(div);

    return coords;
}

export function setCaretPosition(element: HTMLInputElement, position: number): void {
    if (isInputOrTextAreaElement(element) && element.selectionStart) {
        element.focus();
        element.setSelectionRange(position, position);
    } else {
        let range = document.createRange();
        range.setStart(element, position);
        range.collapse(true);
        let selection = window.getSelection();
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
    let markupPattern = escapeRegExp(markup);
    let placeholderRegExp = /__([\w]+)__/g;
    let placeholders = {};
    let match, i = 1;
    do {
        match = placeholderRegExp.exec(markupPattern);
        if (match) {
            let placeholder = match[1];
            markupPattern = markupPattern.replace(
                `__${placeholder}__`,
                `(?<${placeholder}>[^\\)\\]]+)`
            );
            placeholders[placeholder] = ++i;
        }
    } while (match);

    return {
        markup: markup,
        regEx: new RegExp('(' + markupPattern + ')', 'ig'),
        groups: placeholders
    };
}
export function getPlainText(value: string, mentionMarkup: MarkupMention, displayTransform: (..._: string[]) => string) {
    mentionMarkup.regEx.lastIndex = 0;
    return value.replace(mentionMarkup.regEx, displayTransform);
}

export function replacePlaceholders(item: any, markupMention: MarkupMention): string {
    let result = markupMention.markup + '';
    Object.keys(markupMention.groups).forEach(key => result = result.replace(new RegExp(`__${key}__`, 'g'), item[key]));

    return result;
}

export function applyChangeToValue(
    value: string,
    markupMention: MarkupMention,
    plainTextValue: string,
    selectionStartBeforeChange: number = 0,
    selectionEndBeforeChange: number = 0,
    selectionEndAfterChange: number = 0,
    displayTransform: (..._: string[]) => string
) {
    let oldPlainTextValue = getPlainText(value, markupMention, displayTransform);
    let lengthDelta = oldPlainTextValue.length - plainTextValue.length;
    if (!selectionStartBeforeChange) {
        selectionStartBeforeChange = selectionEndBeforeChange + lengthDelta;
    }
    if (!selectionEndBeforeChange) {
        selectionEndBeforeChange = selectionStartBeforeChange;
    }

    if (selectionStartBeforeChange === selectionEndBeforeChange &&
        selectionEndBeforeChange === selectionEndAfterChange &&
        oldPlainTextValue.length === plainTextValue.length
    ) {
        selectionStartBeforeChange--;
    }

    let insert = plainTextValue.slice(selectionStartBeforeChange, selectionEndAfterChange);
    let spliceStart = Math.min(selectionStartBeforeChange, selectionEndAfterChange);
    let spliceEnd = selectionEndBeforeChange;
    if (selectionStartBeforeChange === selectionEndAfterChange) {
        spliceEnd = Math.max(selectionEndBeforeChange, selectionStartBeforeChange + lengthDelta);
    }

    return spliceString(
        value,
        mapPlainTextIndex(value, markupMention, spliceStart, false, displayTransform),
        mapPlainTextIndex(value, markupMention, spliceEnd, true, displayTransform),
        insert
    );
}

export function findStartOfMentionInPlainText(
    value: string,
    mentionMarkup: MarkupMention,
    indexInPlainText: number,
    displayTransform: (..._: string[]) => string
): {start: number, end: number} {
    let result = {start: -1, end: -1};
    const markupIterator = (index: number, mentionPlainTextIndex: number, display: string): boolean => {
        console.log(index, mentionPlainTextIndex, display);
        if (mentionPlainTextIndex < indexInPlainText && mentionPlainTextIndex + display.length > indexInPlainText) {
            result = {start: mentionPlainTextIndex, end: mentionPlainTextIndex + display.length};
            return true;
        }

        return false;
    };
    iterateOnlyMentionsMarkup(value, mentionMarkup, markupIterator, displayTransform);

    return result;
}

export function getBoundsOfMentionAtPosition(value: string, mentionMarkup: MarkupMention, indexInPlainText: number, displayTransform: (..._: string[]) => string): {start: number, end: number} {
    return findStartOfMentionInPlainText(value, mentionMarkup, indexInPlainText, displayTransform);
}
