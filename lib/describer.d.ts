export interface DescriberOptions {
    /** Use 24-hour clock format (e.g. "At 14:30"). Defaults to false ("At 2:30 PM"). */
    use24HourTimeFormat?: boolean;
}
export declare class CronDescriberU2Q {
    /**
     * Generates a human-readable description for a Unix-style cron expression.
     *
     * Unix-style cron expressions consist of 5 parts:
     * - Minute (0-59)
     * - Hour (0-23)
     * - Day of Month (1-31)
     * - Month (1-12)
     * - Day of Week (0-6, where 0 = Sunday)
     * @param unixExpression - A string containing the Unix-style cron expression.
     * @returns A human-readable description or an error message if invalid.
     */
    static describeUnix(unixExpression: string, options?: DescriberOptions): string;
    /**
     * Generates a human-readable description for a Quartz-style cron expression.
     *
     * Quartz-style cron expressions consist of 6 or 7 parts:
     * - Second (0-59)
     * - Minute (0-59)
     * - Hour (0-23)
     * - Day of Month (1-31)
     * - Month (1-12)
     * - Day of Week (1-7, where 1 = Sunday)
     * - Year (optional)
     * @param quartzExpression - A string containing the Quartz-style cron expression.
     * @returns A human-readable description or an error message if invalid.
     */
    static describeQuartz(quartzExpression: string, options?: DescriberOptions): string;
    /** Returns true when a field value is a plain integer (no *, ?, ,, -, /). */
    private static isSimpleNumeric;
    /**
     * Produces a combined time string such as "At 2:30 AM" or "At midnight".
     * Falls back to separate minute/hour descriptions for complex expressions.
     */
    private static describeTime;
    private static describeSecond;
    private static describeMinute;
    private static describeHour;
    private static describeDayOfMonth;
    private static describeMonth;
    private static describeDayOfWeek;
    private static describeYear;
    private static resolveValue;
    private static describeField;
    private static ordinalSuffix;
    private static combineDescriptions;
}
