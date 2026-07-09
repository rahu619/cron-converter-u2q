var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { registerLocale } from './locales/index';
/**
 * Loads a locale JSON file from disk and registers it under its id (or the
 * optional localeId override). Once registered, the locale can be referenced
 * by id in DescriberOptions.locale.
 *
 * The JSON file must conform to the CronLocaleJSON shape.
 * This function uses fs/promises and is intended for Node.js environments.
 *
 * @param filePath  - Absolute or relative path to the JSON locale file.
 * @param localeId  - Optional id override. Defaults to the id field in the JSON.
 */
export function loadLocale(filePath, localeId) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        // Dynamic import keeps 'fs' out of browser bundles when this function is unused.
        const { readFile } = yield import('fs/promises');
        const raw = yield readFile(filePath, 'utf-8');
        const json = JSON.parse(raw);
        const id = localeId !== null && localeId !== void 0 ? localeId : json.id;
        if (!id) {
            throw new Error(`Locale file "${filePath}" must include an "id" field, or pass localeId as the second argument.`);
        }
        const suffix = (_a = json.ordinalSuffix) !== null && _a !== void 0 ? _a : '';
        registerLocale({
            id,
            dayNames: json.dayNames,
            monthNames: json.monthNames,
            ordinal: (n) => !Number.isInteger(n) || n <= 0 ? json.tokens.invalidDay : `${n}${suffix}`,
            use24HourTimeFormat: (_b = json.use24HourTimeFormat) !== null && _b !== void 0 ? _b : false,
            timezone: json.timezone,
            tokens: json.tokens,
        });
    });
}
