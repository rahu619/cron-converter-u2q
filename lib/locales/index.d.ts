import { en } from './en';
import type { CronLocale } from './types';
export type { CronLocale };
export { en };
/**
 * Returns a built-in locale by its ID, e.g. "en" or "es".
 * Throws if the locale is not registered.
 */
export declare function getLocale(id: string): CronLocale;
/**
 * Registers a custom locale so it can be referenced by ID string in DescriberOptions.
 */
export declare function registerLocale(locale: CronLocale): void;
