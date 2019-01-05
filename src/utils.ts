
function isInputOrTextAreaElement(element?: HTMLElement): boolean {
    return element !== null && (
        element.nodeName === 'INPUT' ||
        element.nodeName === 'TEXTAREA' ||
        element.nodeName === '#text'
    );
}

export function getValue(element: HTMLInputElement): string {
    return isInputOrTextAreaElement(element) ? element.value : element.textContent;
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
    regEx: RegExp;
    groups: {[key: string]: number};
}

export function markupToRegExp(markup: string): MarkupMention {
    let markupPattern = escapeRegExp(markup);
    let placeholderRegExp = /__([\w]+)__/g;
    let placeholders = {};
    let match, i = 0;
    do {
        match = placeholderRegExp.exec(markupPattern);
        if (match) {
            let placeholder = match[1];
            markupPattern = markupPattern.replace(
                `__${placeholder}__`,
                `(?<${placeholder}>.+)`
            );
            placeholders[placeholder] = ++i;
        }
    } while (match);

    return {
        regEx: new RegExp(markupPattern, 'ig'),
        groups: placeholders
    };
}


export function escapeHtml(text: string) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function isCoordinateWithinRect(rect: ClientRect, x: number, y: number) {
    return (rect.left < x && x < rect.right) && (rect.top < y && y < rect.bottom);
}