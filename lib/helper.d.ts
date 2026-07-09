export declare class ExpressionHelper {
    static readonly delimiter = " ";
    static readonly unixExpressionLength = 5;
    static readonly quartzExpressionLengths: number[];
    /**
     * Expands a Unix cron @-macro (e.g. @daily) into its 5-field equivalent.
     * Returns the input unchanged if it is not a macro.
     * Throws for @reboot, which has no cron equivalent.
     */
    static expandMacro(expression: string): string;
    static GetExpressionParts(expression: string): string[];
    private static validateIfNullOrEmpty;
}
