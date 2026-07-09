import { ExpressionHelper as helper } from './helper';
import { CronValidatorU2Q } from './validator';

export class CronConverterU2Q {
    /**
     * Converts a unix cron expression to a quartz cron expression by adding '0' seconds
     * @param unixExpression - the unix expression
     * @returns the corresponding quartz expression
     */
    public static unixToQuartz(unixExpression: string, year = '*'): string {
        unixExpression = helper.expandMacro(unixExpression);
        CronValidatorU2Q.validateUnix(unixExpression);
        const parts = helper.GetExpressionParts(unixExpression);
        const [min, hour, dom, month, dow] = parts;

        // Enhanced DOW conversion: handle lists, ranges, and special cases
        let quartzDow = this.unixDowToQuartz(dow);
        let quartzDom = dom;

        // Per Quartz spec, exactly one of DOM or DOW must be '?'
        // When DOM is '*' and DOW is specific, DOM gets '?'; otherwise DOW gets '?'
        if (dom === '*' && dow !== '*') {
            quartzDom = '?';
        } else if (dom !== '*' && dow === '*') {
            quartzDow = '?';
        } else if (dom !== '*' && dow !== '*') {
            throw new Error("Quartz cron does not support specifying both Day of Month and Day of Week");
        }

        const result = `0 ${min} ${hour} ${quartzDom} ${month} ${quartzDow} ${year}`;
        if (year !== '*') {
            CronValidatorU2Q.validateQuartz(result);
        }
        return result;
    }

    /**
     * Converts a quartz cron expression to a unix cron expression
     * @param quartzExpression - the quartz expression
     * @returns the corresponding unix expression
     */
    public static quartzToUnix(quartzExpression: string): string {
        CronValidatorU2Q.validateQuartz(quartzExpression);
        const parts = helper.GetExpressionParts(quartzExpression);
        const [_, min, hour, dom, month, dow] = parts.map(part => part.replace(/^0\/(\d+)$/, '*/$1'));

        if (dom.includes('L') || dom.includes('W')) {
            throw new Error("Unix cron does not support 'L' or 'W' in Day of Month");
        }
        if (dow.includes('L') || dow.includes('#')) {
            throw new Error("Unix cron does not support 'L' or '#' in Day of Week");
        }

        // Enhanced DOW conversion: handle lists, ranges, and special cases
        let unixDow = this.quartzDowToUnix(dow);
        let unixDom = dom === '?' ? '*' : dom;

        return `${min} ${hour} ${unixDom} ${month} ${unixDow}`;
    }

    /**
     * Converts Unix DOW to Quartz DOW, supporting lists, ranges, and special cases.
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat, 7=Sun(alias)
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     */
    private static unixDowToQuartz(dow: string): string {
        if (dow === '*' || dow === '?') return dow;
        if (dow.includes(',')) {
            const mapped = dow.split(',').map(d => this.unixDowToQuartz(d));
            return Array.from(new Set(mapped)).join(',');
        }
        if (dow.includes('-')) return dow.split('-').map(d => this.unixDowToQuartz(d)).join('-');
        if (dow.endsWith('L')) {
            const day = dow.slice(0, -1);
            return `${this.unixDowToQuartz(day)}L`;
        }
        if (dow.includes('#')) {
            const [day, nth] = dow.split('#');
            return `${this.unixDowToQuartz(day)}#${nth}`;
        }
        if (dow === '0' || dow === '7') return '1'; // Sunday
        const num = parseInt(dow, 10);
        if (!isNaN(num) && num >= 1 && num <= 6) return (num + 1).toString(); // Mon(1)→2 … Sat(6)→7
        return dow;
    }

    /**
     * Converts Quartz DOW to Unix DOW, supporting lists, ranges, and special cases.
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat
     */
    public static quartzDowToUnix(dow: string): string {
        if (dow === '*' || dow === '?') return dow === '?' ? '*' : dow;

        // Split compound expressions so each element is converted individually
        if (dow.includes(',')) {
            const mapped = dow.split(',').map(d => this.quartzDowToUnix(d));
            return Array.from(new Set(mapped)).join(',');
        }
        if (dow.includes('-')) return dow.split('-').map(d => this.quartzDowToUnix(d)).join('-');

        // Last (L) — convert the numeric day part, preserve L suffix
        if (dow.endsWith('L')) {
            const day = dow.slice(0, -1);
            return `${this.quartzDowToUnix(day)}L`;
        }

        // Nth weekday (#) — convert the numeric day part, preserve #N
        if (dow.includes('#')) {
            const [day, nth] = dow.split('#');
            return `${this.quartzDowToUnix(day)}#${nth}`;
        }

        // Numeric mapping
        if (dow === '1') return '0'; // Sunday
        const num = parseInt(dow, 10);
        if (!isNaN(num) && num >= 2 && num <= 7) return (num - 1).toString(); // Mon(2)→1 … Sat(7)→6

        return dow;
    }
}
