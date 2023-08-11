import { ExpressionHelper as helper } from './helper';

export class CronDescriberU2Q {

    public static describe(expression: string): string {
        const [second, min, hour, dom, month, dow] = helper.GetExpressionParts(expression);
        return `${this.describeSecond(second)} ${this.describeMinute(min)} ${this.describeHour(hour)} ${this.describeDayOfMonth(dom)} ${this.describeMonth(month)} ${this.describeDayOfWeek(dow)}`.trim();
    }

    // #region Standard cron description logic 

    private static describeSecond(second: string): string {
        if (second === '*') return 'Every second';
        if (second.startsWith('*/')) return `Every ${second.split('/')[1]} seconds`;
        return `At second ${second}`;
    }

    private static describeMinute(min: string): string {
        if (min === '*') return 'Every minute';
        if (min.startsWith('*/')) return `Every ${min.split('/')[1]} minutes`;
        return `At minute ${min}`;
    }

    private static describeHour(hour: string): string {
        if (hour === '*') return 'of every hour';
        if (hour.startsWith('*/')) return `Every ${hour.split('/')[1]} hours`;
        return `At ${hour} o'clock`;
    }

    private static describeDayOfMonth(dom: string): string {
        if (dom === '*') return 'on every day';
        return `on the ${this.ordinalSuffix(Number(dom))} of the month`;
    }

    private static describeMonth(month: string): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        if (month === '*') return 'of every month';
        return `in ${months[Number(month) - 1]}`;
    }

    private static describeDayOfWeek(dow: string): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (dow === '*') return '';
        return `on ${days[Number(dow)]}`;
    }

    private static ordinalSuffix(i: number): string {
        const j = i % 10;
        const k = i % 100;
        if (j == 1 && k != 11) return i + "st";
        if (j == 2 && k != 12) return i + "nd";
        if (j == 3 && k != 13) return i + "rd";
        return i + "th";
    }

    //#endregion

}