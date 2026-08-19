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

        // Convert DOW first: a Unix range like 0-7 (every day) can normalise to '*'
        let quartzDow = this.unixDowToQuartz(dow);
        let quartzDom = dom;

        // Per Quartz spec, exactly one of DOM or DOW must be '?'.
        // When both are wildcards the DOW gets '?' (the schedule still runs every day).
        if (quartzDom === '*' && quartzDow === '*') {
            quartzDow = '?';
        } else if (quartzDom === '*' && quartzDow !== '*') {
            quartzDom = '?';
        } else if (quartzDom !== '*' && quartzDow === '*') {
            quartzDow = '?';
        } else {
            throw new Error("Quartz cron does not support specifying both Day of Month and Day of Week");
        }

        const result = `0 ${min} ${hour} ${quartzDom} ${month} ${quartzDow} ${year}`;
        CronValidatorU2Q.validateQuartz(result);
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
        const [second] = parts;

        // Unix cron has no second resolution; anything other than a pinned '0'
        // would silently change the schedule's frequency.
        if (second !== '0') {
            throw new Error("Unix cron does not support seconds; the Quartz second field must be '0' to convert");
        }

        const [_, min, hour, dom, month, dow] = parts.map(part => part.replace(/^0\/(\d+)$/, '*/$1'));

        if (dom.includes('L') || dom.includes('W')) {
            throw new Error("Unix cron does not support 'L' or 'W' in Day of Month");
        }
        if (dow.includes('L') || dow.includes('#')) {
            throw new Error("Unix cron does not support 'L' or '#' in Day of Week");
        }

        // Enhanced DOW conversion: handle lists, ranges, and special cases
        const unixDow = this.quartzDowToUnix(dow);
        const unixDom = dom === '?' ? '*' : dom;

        return `${min} ${hour} ${unixDom} ${month} ${unixDow}`;
    }

    private static readonly UNIX_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    private static readonly QUARTZ_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    /** Parses a single Unix DOW token (0-7 or alias), keeping 7 as 7 for enumeration. */
    private static parseUnixDowToken(token: string): number | null {
        const aliasIndex = this.UNIX_DOW_ALIASES.indexOf(token.toUpperCase());
        if (aliasIndex !== -1) return aliasIndex;
        const num = Number(token);
        if (!Number.isInteger(num) || num < 0 || num > 7) return null;
        return num;
    }

    /** Parses a single Quartz DOW token (1-7 or alias). */
    private static parseQuartzDowToken(token: string): number | null {
        const aliasIndex = this.QUARTZ_DOW_ALIASES.indexOf(token.toUpperCase());
        if (aliasIndex !== -1) return aliasIndex + 1;
        const num = Number(token);
        if (!Number.isInteger(num) || num < 1 || num > 7) return null;
        return num;
    }

    /** Maps one Unix DOW value (0-7, Sunday is 0 or 7) to its Quartz value (1-7, Sunday is 1). */
    private static unixDowValueToQuartz(value: number): number {
        return value === 0 || value === 7 ? 1 : value + 1;
    }

    /** Maps one Quartz DOW value (1-7) to its Unix value (0-6, Sunday is 0). */
    private static quartzDowValueToUnix(value: number): number {
        return value === 1 ? 0 : value - 1;
    }

    /**
     * Enumerates start..end (inclusive) by step, renders each value through the
     * mapper, and joins the deduplicated results as a list. Used for step
     * notation, where a shifted start can drag the Sunday alias (Unix 7 /
     * Quartz 1) into or out of the value set.
     */
    private static renderSteppedDowValues(
        start: number,
        end: number,
        step: number,
        map: (value: number) => number
    ): string {
        const rendered: string[] = [];
        for (let value = start; value <= end; value += step) {
            const mapped = map(value).toString();
            if (!rendered.includes(mapped)) rendered.push(mapped);
        }
        return rendered.join(',');
    }

    /**
     * Converts Unix DOW to Quartz DOW, supporting lists, ranges, steps, and special cases.
     * Unix: 0=Sun, 1=Mon, ..., 6=Sat, 7=Sun(alias)
     * Quartz: 1=Sun, 2=Mon, ..., 7=Sat
     */
    private static unixDowToQuartz(dow: string): string {
        if (dow === '*' || dow === '?') return dow;
        if (dow.includes(',')) {
            const mapped = dow.split(',').map(d => this.unixDowToQuartz(d));
            return Array.from(new Set(mapped)).join(',');
        }

        // Step notation must be handled before ranges: '1-5/2' contains both.
        // '*/n' is equivalent in both formats (both start on Sunday); any other
        // start is expanded to an explicit day list so the Unix Sunday alias (7)
        // is mapped correctly instead of being truncated by parseInt.
        if (dow.includes('/')) {
            const [start, step] = dow.split('/');
            if (start === '*') return dow;
            const stepNum = Number(step);
            let startNum: number | null;
            let endNum = 7;
            if (start.includes('-')) {
                const [rangeStart, rangeEnd] = start.split('-');
                startNum = this.parseUnixDowToken(rangeStart);
                endNum = this.parseUnixDowToken(rangeEnd) ?? endNum;
            } else {
                startNum = this.parseUnixDowToken(start);
            }
            if (startNum === null || !Number.isInteger(stepNum) || stepNum <= 0) return dow;
            return this.renderSteppedDowValues(startNum, endNum, stepNum, v => this.unixDowValueToQuartz(v));
        }

        if (dow.includes('-')) {
            const [start, end] = dow.split('-');
            if (start === end) return this.unixDowToQuartz(start);
            // A range ending at 7 wraps around Quartz's 1-based week, so it is
            // emitted as range-to-Saturday plus Sunday (e.g. FRI-7 → FRI-7,1).
            if (end === '7') {
                const startNum = this.parseUnixDowToken(start);
                if (startNum === 0) return '*'; // 0-7 / SUN-7 covers every day
                const startQuartz = this.unixDowToQuartz(start);
                return startQuartz === '7' ? '7,1' : `${startQuartz}-7,1`;
            }
            return `${this.unixDowToQuartz(start)}-${this.unixDowToQuartz(end)}`;
        }

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
     * Converts Quartz DOW to Unix DOW, supporting lists, ranges, steps, and special cases.
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

        // Step notation must be handled before ranges: '1-5/2' contains both.
        // '*/n' is equivalent in both formats; any other start is expanded to an
        // explicit day list so the day set is preserved exactly.
        if (dow.includes('/')) {
            const [start, step] = dow.split('/');
            if (start === '*') return dow;
            const stepNum = Number(step);
            let startNum: number | null;
            let endNum = 7;
            if (start.includes('-')) {
                const [rangeStart, rangeEnd] = start.split('-');
                startNum = this.parseQuartzDowToken(rangeStart);
                endNum = this.parseQuartzDowToken(rangeEnd) ?? endNum;
            } else {
                startNum = this.parseQuartzDowToken(start);
            }
            if (startNum === null || !Number.isInteger(stepNum) || stepNum <= 0) return dow;
            return this.renderSteppedDowValues(startNum, endNum, stepNum, v => this.quartzDowValueToUnix(v));
        }

        if (dow.includes('-')) {
            const [start, end] = dow.split('-');
            if (start === end) return this.quartzDowToUnix(start);
            return `${this.quartzDowToUnix(start)}-${this.quartzDowToUnix(end)}`;
        }

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
