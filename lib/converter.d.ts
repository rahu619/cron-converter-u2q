export declare class CronConverterU2Q {
    /**
     * Converts a unix cron expression to a quartz cron expression by adding '0' seconds
     * @param unixExpression - the unix expression
     * @returns the corresponding quartz expression
     */
    static unixToQuartz(unixExpression: string): string;
    /**
     * Converts a quartz cron expression to a unix cron expression
     * @param quartzExpression - the quartz expression
     * @returns the corresponding unix expression
     */
    static quartzToUnix(quartzExpression: string): string;
    /**
     * Converts interval parts for both Unix and Quartz expressions.
     * In both directions, normalises step notation to the Unix `*\/N` format.
     */
    private static convertIntervalParts;
    /**
     * Converts Unix DOW to Quartz DOW, supporting lists, ranges, and special cases.
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat, 7=Sun(alias)
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     */
    private static unixDowToQuartz;
    /**
     * Converts Quartz DOW to Unix DOW, supporting lists, ranges, and special cases.
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat
     */
    static quartzDowToUnix(dow: string): string;
}
