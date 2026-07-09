import { en } from './en';
import type { CronLocale } from './types';

export type { CronLocale };
export { en };

const BUILT_IN_LOCALES: Record<string, CronLocale> = { en };

/**
 * Returns a built-in locale by its ID, e.g. "en" or "es".
 * Throws if the locale is not registered.
 */
export function getLocale(id: string): CronLocale {
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
export function registerLocale(locale: CronLocale): void {
  BUILT_IN_LOCALES[locale.id] = locale;
}
