import {NgxdMentionsBasic} from './basic/mentions-basic';
import {NgxdMentionsCustomSearch} from './custom-search/mentions-custom-search';
import {NgxdMentionsStringValues} from './string-values/mentions-string-values';

export const DEMO_DIRECTIVES = [NgxdMentionsBasic, NgxdMentionsCustomSearch, NgxdMentionsStringValues];

export const DEMO_SNIPPETS = {
    'basic': {
        'code': require('!!raw-loader!./basic/mentions-basic'),
        'markup': require('!!raw-loader!./basic/mentions-basic.html')
    },
    'custom-search': {
        'code': require('!!raw-loader!./custom-search/mentions-custom-search'),
        'markup': require('!!raw-loader!./custom-search/mentions-custom-search.html')
    },
    'string-values': {
        'code': require('!!raw-loader!./string-values/mentions-string-values'),
        'markup': require('!!raw-loader!./string-values/mentions-string-values.html')
    }
};
