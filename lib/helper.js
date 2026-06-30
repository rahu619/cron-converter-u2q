"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionHelper = void 0;
class ExpressionHelper {
    static GetExpressionParts(expression) {
        this.validateIfNullOrEmpty(expression);
        const parts = expression.split(this.delimiter).map(part => part.trim());
        if (this.quartzExpressionLengths.includes(parts.length))
            return parts;
        if (this.unixExpressionLength == parts.length)
            return parts;
        throw new Error(`Invalid cron expression!`);
    }
    static validateIfNullOrEmpty(cronExpression) {
        if (!cronExpression || cronExpression.trim() === '')
            throw new Error('Empty or null expression');
    }
}
exports.ExpressionHelper = ExpressionHelper;
ExpressionHelper.delimiter = ' ';
ExpressionHelper.unixExpressionLength = 5;
ExpressionHelper.quartzExpressionLengths = [6, 7];
