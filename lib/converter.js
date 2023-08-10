"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronConverterU2Q = void 0;
class CronConverterU2Q {
    /**
     * Converts a unix cron expression to a quartz cron expression by adding '0' seconds
     * @param unixExpression - the unix expression
     * @returns the corresponding quartz expression
     */
    static unixToQuartz(unixExpression) {
        this.validateIfNullOrEmpty(unixExpression);
        const parts = unixExpression.split(this.delimiter);
        if (parts.length !== this.unixExpressionLength)
            throw new Error(`Invalid unix cron format`);
        const [min, hour, dom, month, dow] = parts;
        let quartzDom = dom;
        let quartzDow = dow;
        if (dom === '*' && (dow === '*' || dow !== '*'))
            quartzDom = '?';
        else if (dom !== '*' && dow === '*')
            quartzDow = '?';
        return `0 ${min} ${hour} ${quartzDom} ${month} ${quartzDow}`;
    }
    /**
     * Converts a quartz cron expression to a unix cron expression
     * @param quartzExpression - the quartz expression
     * @returns the corresponding unix expression
     */
    static quartzToUnix(quartzExpression) {
        this.validateIfNullOrEmpty(quartzExpression);
        const parts = quartzExpression.split(this.delimiter);
        if (!this.quartzExpressionLengths.includes(parts.length))
            throw new Error(`Invalid quartz cron format`);
        const [_, min, hour, dom, month, dow] = parts;
        let unixDom = dom;
        let unixDow = dow;
        if (dom === '?' && dow === '*')
            unixDom = '*';
        else if (dow === '?' && dom === '*')
            unixDow = '*';
        else if (dom !== '?' && dom === '?')
            unixDom = '*';
        return `${min} ${hour} ${unixDom} ${month} ${unixDow}`;
    }
    static validateIfNullOrEmpty(cronExpression) {
        if (!cronExpression || cronExpression.trim() === '')
            throw new Error('Empty or null expression');
    }
}
exports.CronConverterU2Q = CronConverterU2Q;
CronConverterU2Q.delimiter = ' ';
CronConverterU2Q.unixExpressionLength = 5;
CronConverterU2Q.quartzExpressionLengths = [6, 7];
