import { ExpressionHelper as helper } from './helper';

export class CronConverterU2Q {
    static readonly everyXUnitsReplacePlaceholder = `%s`
    static readonly quartzEveryXUnitsRegex = /^0\/(\d+)$/; // For handling 0/5 units
    static readonly unixEveryXUnitsRegex = /^\*\/(\d+)$/; // For handling */5 units
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

        // Enhanced DOW conversion: handle lists, ranges, and special cases
        let quartzDow = this.unixDowToQuartz(dow);
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

        // Enhanced DOW conversion: handle lists, ranges, and special cases
        let unixDow = this.quartzDowToUnix(dow);
        let unixDom = dom;

        // If dow in Quartz was '?', set unixDom to '*'
        if (dow === '?') unixDom = '*';

        return `${min} ${hour} ${unixDom} ${month} ${unixDow}`;
    }

    /**
     * Converts interval parts for both Unix and Quartz expressions.
     */
    private static convertIntervalParts(part: string, isQuartz = false): string {
        const everyXUnitsPattern = isQuartz ? this.quartzEveryXUnitsRegex : this.unixEveryXUnitsRegex;
        const matches = part.match(everyXUnitsPattern);
        const everyXUnitsReplacePattern = isQuartz ? this.quartzEveryXUnitsReplacePattern : this.unixEveryXUnitsReplacePattern;

        if (matches) return `${everyXUnitsReplacePattern.replace(this.everyXUnitsReplacePlaceholder, matches[1])}`;

        return part;
    }

    /**
     * Converts Unix DOW to Quartz DOW, supporting lists, ranges, and special cases.
     */
    private static unixDowToQuartz(dow: string): string {
        if (dow === '*' || dow === '?') return dow;
        if (dow.includes(',')) return dow.split(',').map(this.unixDowToQuartz).join(',');
        if (dow.includes('-')) return dow.split('-').map(this.unixDowToQuartz).join('-');
        if (dow.endsWith('L')) {
            const day = dow.slice(0, -1);
            return `${this.unixDowToQuartz(day)}L`;
        }
        if (dow.includes('#')) {
            const [day, nth] = dow.split('#');
            return `${this.unixDowToQuartz(day)}#${nth}`;
        }
        if (dow === '0' || dow === '7') return '1'; // Sunday
        // For 1-6 (Monday-Saturday), keep as is
        return dow;
    }

    /**
     * Converts Quartz DOW to Unix DOW, supporting lists, ranges, and special cases.
     */
    private static quartzDowToUnix(dow: string): string {
        if (dow === '*' || dow === '?') return dow === '?' ? '*' : dow;

        // Last (L) - do not map the numeric part, just return as is
        if (dow.endsWith('L')) {
            return dow;
        }

        // Nth (#) - do not map the numeric part, just return as is
        if (dow.includes('#')) {
            return dow;
        }

        // For lists and ranges, do not map, just return as is
        if (dow.includes(',') || dow.includes('-')) {
            return dow;
        }

        // Numeric mapping
        if (dow === '1') return '0'; // Sunday
        const num = parseInt(dow, 10);
        if (!isNaN(num) && num >= 2 && num <= 7) return (num - 1).toString();

        return dow;
    }
}
