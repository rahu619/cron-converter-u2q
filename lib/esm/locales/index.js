import { en } from './en';
export { en };
const BUILT_IN_LOCALES = { en };
/**
 * Returns a built-in locale by its ID, e.g. "en" or "es".
 * Throws if the locale is not registered.
 */
export function getLocale(id) {
    const locale = BUILT_IN_LOCALES[id];
    if (!locale) {
        const available = Object.keys(BUILT_IN_LOCALES).join(', ');
        throw new Error(`Unknown locale "${id}". Available locales: ${available}`);
    }
    return locale;
}
/**
 * Registers a custom locale so it can be referenced by ID string in DescriberOptions.
 */
export function registerLocale(locale) {
    BUILT_IN_LOCALES[locale.id] = locale;
}
