export class ExpressionHelper {
    static readonly delimiter = ' ';
    static readonly unixExpressionLength = 5;
    static readonly quartzExpressionLengths = [6, 7];

    public static GetExpressionParts(expression: string): string[] {
        this.validateIfNullOrEmpty(expression);
        const parts = expression.split(this.delimiter).map(part => part.trim());
        if (this.quartzExpressionLengths.includes(parts.length)) return parts.map(part => part.replace('?', '*'))
        if (this.unixExpressionLength == parts.length) return parts;

        throw new Error(`Invalid cron expression!`)
    }

    private static validateIfNullOrEmpty(cronExpression: string | undefined | null): void {
        if (!cronExpression || cronExpression.trim() === '') throw new Error('Empty or null expression');
    }

}