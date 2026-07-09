import type { CronLocale } from './locales/types';
export interface NextRunOptions {
    /**
     * A registered locale ID (e.g. "de") or a CronLocale object.
     * When set, its timezone field is used unless timezone is also specified.
     */
    locale?: string | CronLocale;
    /**
     * IANA timezone name (e.g. "America/New_York").
     * Overrides the locale's timezone when both are provided.
     */
    timezone?: string;
}
/** Returns the next `count` run dates matching `expression` after `fromDate`. */
export declare function getNextRuns(expression: string, count: number, fromDate?: Date, options?: NextRunOptions): Date[];
/** Returns the previous `count` run dates matching `expression` before `fromDate`. */
export declare function getPreviousRuns(expression: string, count: number, fromDate?: Date, options?: NextRunOptions): Date[];
