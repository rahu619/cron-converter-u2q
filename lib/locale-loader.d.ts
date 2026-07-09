import type { CronLocale } from './locales/types';
/**
 * JSON-serializable locale definition accepted by loadLocale.
 *
 * Identical to CronLocale except the ordinal function is replaced by the
 * optional ordinalSuffix string. The suffix is appended to the number at
 * runtime (e.g. "." → "1.", "°" → "1°"). Omit it to get bare numbers.
 */
export interface CronLocaleJSON {
    id: string;
    dayNames: CronLocale['dayNames'];
    monthNames: CronLocale['monthNames'];
    /**
     * Suffix appended to ordinal numbers (e.g. "." for German "1.", "°" for Spanish "1°").
     * Defaults to "" which produces bare numbers ("1", "2", ...).
     */
    ordinalSuffix?: string;
    use24HourTimeFormat?: boolean;
    /** Default IANA timezone for this locale, e.g. "Europe/Berlin". */
    timezone?: string;
    tokens: CronLocale['tokens'];
}
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
export declare function loadLocale(filePath: string, localeId?: string): Promise<void>;
