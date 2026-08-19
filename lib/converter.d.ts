export declare class CronConverterU2Q {
    /**
     * Converts a unix cron expression to a quartz cron expression by adding '0' seconds
     * @param unixExpression - the unix expression
     * @returns the corresponding quartz expression
     */
    static unixToQuartz(unixExpression: string, year?: string): string;
    /**
     * Converts a quartz cron expression to a unix cron expression
     * @param quartzExpression - the quartz expression
     * @returns the corresponding unix expression
     */
    static quartzToUnix(quartzExpression: string): string;
    private static readonly UNIX_DOW_ALIASES;
    private static readonly QUARTZ_DOW_ALIASES;
    /** Parses a single Unix DOW token (0-7 or alias), keeping 7 as 7 for enumeration. */
    private static parseUnixDowToken;
    /** Parses a single Quartz DOW token (1-7 or alias). */
    private static parseQuartzDowToken;
    /** Maps one Unix DOW value (0-7, Sunday is 0 or 7) to its Quartz value (1-7, Sunday is 1). */
    private static unixDowValueToQuartz;
    /** Maps one Quartz DOW value (1-7) to its Unix value (0-6, Sunday is 0). */
    private static quartzDowValueToUnix;
    /**
     * Enumerates start..end (inclusive) by step, renders each value through the
     * mapper, and joins the deduplicated results as a list. Used for step
     * notation, where a shifted start can drag the Sunday alias (Unix 7 /
     * Quartz 1) into or out of the value set.
     */
    private static renderSteppedDowValues;
    /**
     * Converts Unix DOW to Quartz DOW, supporting lists, ranges, steps, and special cases.
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat, 7=Sun(alias)
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     */
    private static unixDowToQuartz;
    /**
     * Converts Quartz DOW to Unix DOW, supporting lists, ranges, steps, and special cases.
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat
     */
    static quartzDowToUnix(dow: string): string;
}
