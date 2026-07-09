"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLocale = exports.getLocale = exports.en = void 0;
const en_1 = require("./en");
Object.defineProperty(exports, "en", { enumerable: true, get: function () { return en_1.en; } });
const BUILT_IN_LOCALES = { en: en_1.en };
/**
 * Returns a built-in locale by its ID, e.g. "en" or "es".
 * Throws if the locale is not registered.
 */
function getLocale(id) {
    const locale = BUILT_IN_LOCALES[id];
    if (!locale) {
        const available = Object.keys(BUILT_IN_LOCALES).join(', ');
        throw new Error(`Unknown locale "${id}". Available locales: ${available}`);
    }
    return locale;
}
exports.getLocale = getLocale;
/**
 * Registers a custom locale so it can be referenced by ID string in DescriberOptions.
 */
function registerLocale(locale) {
    BUILT_IN_LOCALES[locale.id] = locale;
}
exports.registerLocale = registerLocale;
