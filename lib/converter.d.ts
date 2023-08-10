export declare class CronConverterU2Q {
    static readonly delimiter = " ";
    static readonly unixExpressionLength = 5;
    static readonly quartzExpressionLengths: number[];
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
    private static validateIfNullOrEmpty;
}
