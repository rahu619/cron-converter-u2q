export class CronConverterU2Q {

    static readonly delimiter = ' ';
    static readonly unixExpressionLength = 5;
    static readonly quartzExpressionLengths = [6, 7];

    /**
     * Converts a unix cron expression to a quartz cron expression by adding '0' seconds
     * @param unixExpression - the unix expression
     * @returns the corresponding quartz expression
     */
    public static unixToQuartz(unixExpression: string): string {

        this.validateIfNullOrEmpty(unixExpression);

        const parts = unixExpression.split(this.delimiter);
        if (parts.length !== this.unixExpressionLength) throw new Error(`Invalid unix cron format`);

        const [min, hour, dom, month, dow] = parts;
        let quartzDom = dom;
        let quartzDow = dow;

        if (dom === '*' && (dow === '*' || dow !== '*')) quartzDom = '?';
        else if (dom !== '*' && dow === '*') quartzDow = '?';

        return `0 ${min} ${hour} ${quartzDom} ${month} ${quartzDow}`;
    }

    /**
     * Converts a quartz cron expression to a unix cron expression
     * @param quartzExpression - the quartz expression
     * @returns the corresponding unix expression
     */
    public static quartzToUnix(quartzExpression: string): string {

        this.validateIfNullOrEmpty(quartzExpression);

        const parts = quartzExpression.split(this.delimiter);

        if (!this.quartzExpressionLengths.includes(parts.length)) throw new Error(`Invalid quartz cron format`);

        const [_, min, hour, dom, month, dow] = parts;
        let unixDom = dom;
        let unixDow = dow;

        if (dom === '?' && dow === '*') unixDom = '*';
        else if (dow === '?' && dom === '*') unixDow = '*';
        else if (dom !== '?' && dom === '?') unixDom = '*';

        return `${min} ${hour} ${unixDom} ${month} ${unixDow}`;
    }

    private static validateIfNullOrEmpty(cronExpression: string | undefined | null): void {
        if (!cronExpression || cronExpression.trim() === '') throw new Error('Empty or null expression');
    }

}
