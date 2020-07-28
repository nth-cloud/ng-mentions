import {NthdMentionsBasic} from './basic/mentions-basic';
import {NthdMentionsCustomSearch} from './custom-search/mentions-custom-search';
import {NthdMentionsStringValues} from './string-values/mentions-string-values';
import {NthdMentionsValidation} from './validation/mentions-validation';
import {NthdMentionsCustomTemplate} from './custom-template/mentions-custom-template';

export const DEMO_DIRECTIVES = [
    NthdMentionsBasic,
    NthdMentionsCustomSearch,
    NthdMentionsStringValues,
    NthdMentionsValidation,
    NthdMentionsCustomTemplate,
];

export const DEMO_SNIPPETS = {
    'basic': {
        'code': require('!!raw-loader!./basic/mentions-basic').default,
        'markup': require('!!raw-loader!./basic/mentions-basic.html').default
    },
    'custom-search': {
        'code': require('!!raw-loader!./custom-search/mentions-custom-search').default,
        'markup': require('!!raw-loader!./custom-search/mentions-custom-search.html').default
    },
    'string-values': {
        'code': require('!!raw-loader!./string-values/mentions-string-values').default,
        'markup': require('!!raw-loader!./string-values/mentions-string-values.html').default
    },
    'validation': {
        'code': require('!!raw-loader!./validation/mentions-validation').default,
        'markup': require('!!raw-loader!./validation/mentions-validation.html').default
    },
    'custom-template': {
        'code': require('!!raw-loader!./custom-template/mentions-custom-template').default,
        'markup': require('!!raw-loader!./custom-template/mentions-custom-template.html').default
    }
};
