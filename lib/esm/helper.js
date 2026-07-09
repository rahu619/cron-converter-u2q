const MACRO_MAP = {
    '@yearly': '0 0 1 1 *',
    '@annually': '0 0 1 1 *',
    '@monthly': '0 0 1 * *',
    '@weekly': '0 0 * * 0',
    '@daily': '0 0 * * *',
    '@midnight': '0 0 * * *',
    '@hourly': '0 * * * *',
};
export class ExpressionHelper {
    /**
     * Expands a Unix cron @-macro (e.g. @daily) into its 5-field equivalent.
     * Returns the input unchanged if it is not a macro.
     * Throws for @reboot, which has no cron equivalent.
     */
    static expandMacro(expression) {
        const trimmed = expression.trim();
        if (!trimmed.startsWith('@'))
            return expression;
        const key = trimmed.toLowerCase();
        if (key === '@reboot') {
            throw new Error('@reboot has no cron-expression equivalent and cannot be converted');
        }
        const expanded = MACRO_MAP[key];
        if (!expanded) {
            throw new Error(`Unknown cron macro: ${trimmed}`);
        }
        return expanded;
    }
    static GetExpressionParts(expression) {
        this.validateIfNullOrEmpty(expression);
        const parts = expression.trim().split(/\s+/);
        if (this.quartzExpressionLengths.includes(parts.length))
            return parts;
        if (this.unixExpressionLength === parts.length)
            return parts;
        throw new Error(`Invalid cron expression!`);
    }
    static validateIfNullOrEmpty(cronExpression) {
        if (!cronExpression || cronExpression.trim() === '')
            throw new Error('Empty or null expression');
    }
}
ExpressionHelper.delimiter = ' ';
ExpressionHelper.unixExpressionLength = 5;
ExpressionHelper.quartzExpressionLengths = [6, 7];
