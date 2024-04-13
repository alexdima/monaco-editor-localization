/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const MONACO_LANGUAGE = self.MONACO_LANGUAGE || 'en';
const nlsData = getNlsData();

function translateString(englishValue) {
    if (!nlsData[englishValue]) {
        return englishValue;
    }
    if (!nlsData[englishValue][MONACO_LANGUAGE]) {
        return englishValue;
    }
    return nlsData[englishValue][MONACO_LANGUAGE];
}

export function localize(data, message, ...args) {
    return _format(translateString(message), args);
}

export function localize2(data, message, ...args) {
    const value = _format(translateString(message), args);
    const original = _format(message, args);
    return {
        value,
        original
    };
}

export function getConfiguredDefaultLocale(_) {
    return undefined;
}

let isPseudo = (typeof document !== 'undefined' && document.location && document.location.hash.indexOf('pseudo=true') >= 0);
function _format(message, args) {
    let result;
    if (args.length === 0) {
        result = message;
    }
    else {
        result = message.replace(/\{(\d+)\}/g, (match, rest) => {
            const index = rest[0];
            const arg = args[index];
            let result = match;
            if (typeof arg === 'string') {
                result = arg;
            }
            else if (typeof arg === 'number' || typeof arg === 'boolean' || arg === void 0 || arg === null) {
                result = String(arg);
            }
            return result;
        });
    }
    if (isPseudo) {
        // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
        result = '\uFF3B' + result.replace(/[aouei]/g, '$&$&') + '\uFF3D';
    }
    return result;
}
