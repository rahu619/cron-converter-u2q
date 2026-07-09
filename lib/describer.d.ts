import type { CronLocale } from "./locales/types";
export type { CronLocale };
export interface DescriberOptions {
    /** Use 24-hour clock format (e.g. "At 14:30"). Overrides the locale's default. */
    use24HourTimeFormat?: boolean;
    /**
     * Locale to use for descriptions. Accepts a locale ID string (e.g. "en", "es")
     * or a custom CronLocale object. Defaults to English ("en").
     */
    locale?: string | CronLocale;
}
export declare class CronDescriberU2Q {
    private static resolveLocale;
    static describeUnix(unixExpression: string, options?: DescriberOptions): string;
    static describeQuartz(quartzExpression: string, options?: DescriberOptions): string;
    private static isSimpleNumeric;
    private static describeTime;
    private static describeSecond;
    private static describeMinute;
    private static describeHour;
    private static describeDayOfMonth;
    private static describeMonth;
    private static describeDayOfWeek;
    private static describeYear;
    private static describeField;
    private static resolveValue;
    private static combineDescriptions;
    private static isStepOrRange;
    private static capitalize;
}
