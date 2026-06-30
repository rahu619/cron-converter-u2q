export declare class ExpressionHelper {
    static readonly delimiter = " ";
    static readonly unixExpressionLength = 5;
    static readonly quartzExpressionLengths: number[];
    static GetExpressionParts(expression: string): string[];
    private static validateIfNullOrEmpty;
}
