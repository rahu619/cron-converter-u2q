export class CronConverterU2Q {

    static readonly delimiter = ' ';
    static readonly unixExpressionLength = 5;
    static readonly quartzExpressionLengths = [6, 7];
    static readonly everyXUnitsReplacePlaceholder = `%s`
    static readonly quartzEveryXUnitsRegex = /^0\/(\d+)$/; // For handling 0/5 units
    static readonly unixEveryXUnitsRegex = /^\/(\d+)$/; // For handling */5 units
    static readonly quartzEveryXUnitsReplacePattern = `0/${this.everyXUnitsReplacePlaceholder}`;
    static readonly unixEveryXUnitsReplacePattern = `*/${this.everyXUnitsReplacePlaceholder}`;

    /**
     * Converts a unix cron expression to a quartz cron expression by adding '0' seconds
     * @param unixExpression - the unix expression
     * @returns the corresponding quartz expression
     */
    public static unixToQuartz(unixExpression: string): string {

        this.validateIfNullOrEmpty(unixExpression);
        const parts = unixExpression.split(this.delimiter);
        if (parts.length !== this.unixExpressionLength) throw new Error(`Invalid unix cron format`);

        const [min, hour, dom, month, dow] = parts.map(part => this.convertIntervalParts(part));
        let quartzDom = dom;
        let quartzDow = dow;

        if (dom !== '*' && dow === '*') quartzDow = '?';
        else if (dom === '*') quartzDom = '?';

        return `0 ${min} ${hour} ${quartzDom} ${month} ${quartzDow}`;
    }

    /**
     * Converts a quartz cron expression to a unix cron expression
     * @param quartzExpression - the quartz expression
     * @returns the corresponding unix expression
     */
    public static quartzToUnix(quartzExpression: string): string {

        this.validateIfNullOrEmpty(quartzExpression);
        const parts = quartzExpression.replace('?', '*').split(this.delimiter);
        if (!this.quartzExpressionLengths.includes(parts.length)) throw new Error(`Invalid quartz cron format`);

        const [_, min, hour, dom, month, dow] = parts.map(part => this.convertIntervalParts(part, true));

        return `${min} ${hour} ${dom} ${month} ${dow}`;
    }

    private static validateIfNullOrEmpty(cronExpression: string | undefined | null): void {
        if (!cronExpression || cronExpression.trim() === '') throw new Error('Empty or null expression');
    }

    private static convertIntervalParts(part: string, isQuartz = false): string {
        part = part.trim();

        const everyXUnitsPattern = isQuartz ? this.quartzEveryXUnitsRegex : this.unixEveryXUnitsRegex;
        const matches = part.match(everyXUnitsPattern);
        const everyXUnitsReplacePattern = isQuartz ? this.quartzEveryXUnitsReplacePattern : this.unixEveryXUnitsReplacePattern;

        if (matches) return `${everyXUnitsReplacePattern.replace(this.everyXUnitsReplacePlaceholder, matches[1])}`;

        return part;
    }

}
