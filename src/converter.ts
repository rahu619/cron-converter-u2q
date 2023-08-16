import { ExpressionHelper as helper } from './helper';

export class CronConverterU2Q {
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
        const parts = helper.GetExpressionParts(unixExpression);
        const [min, hour, dom, month, dow] = parts.map(part => this.convertIntervalParts(part));

        // Converting Unix DOW to Quartz DOW
        let quartzDow = dow.includes(',') ? dow.split(',').map(day => {
            if (day === '0' || day === '7') return '1';
            return (parseInt(day, 10) + 1).toString();
        }).join(',') : dow;

        let quartzDom = dom;

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
        const parts = helper.GetExpressionParts(quartzExpression);
        const [_, min, hour, dom, month, dow] = parts.map(part => this.convertIntervalParts(part, true));


        // Converting Quartz DOW to Unix DOW
        let unixDow = dow.includes(',') ? dow.split(',').map(day => {
            if (day === '1') return '0';
            if (day === '?') return '*';
            return (parseInt(day, 10) - 1).toString();
        }).join(',') : dow;

        let unixDom = dom;

        // If dow in Quartz was '?', set unixDom to '*'
        if (dow === '?') unixDom = '*';


        return `${min} ${hour} ${unixDom} ${month} ${unixDow}`;
    }

    private static convertIntervalParts(part: string, isQuartz = false): string {
        const everyXUnitsPattern = isQuartz ? this.quartzEveryXUnitsRegex : this.unixEveryXUnitsRegex;
        const matches = part.match(everyXUnitsPattern);
        const everyXUnitsReplacePattern = isQuartz ? this.quartzEveryXUnitsReplacePattern : this.unixEveryXUnitsReplacePattern;

        if (matches) return `${everyXUnitsReplacePattern.replace(this.everyXUnitsReplacePlaceholder, matches[1])}`;

        return part;
    }

}
