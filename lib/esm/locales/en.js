export const en = {
    id: 'en',
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    ordinal(n) {
        if (!Number.isInteger(n) || n <= 0)
            return this.tokens.invalidDay;
        const j = n % 10;
        const k = n % 100;
        if (j === 1 && k !== 11)
            return `${n}st`;
        if (j === 2 && k !== 12)
            return `${n}nd`;
        if (j === 3 && k !== 13)
            return `${n}rd`;
        return `${n}th`;
    },
    use24HourTimeFormat: false,
    tokens: {
        at: 'At',
        every: 'every',
        from: 'from',
        to: 'to',
        and: 'and',
        in: 'in',
        on: 'on',
        onThe: 'on the',
        ofTheMonth: 'of the month',
        last: 'last',
        lastDay: 'last day',
        lastWeekday: 'last weekday',
        nearestWeekdayTo: 'nearest weekday to the',
        daysBeforeLastDay: 'days before the last day',
        midnight: 'At midnight',
        noon: 'At noon',
        am: 'AM',
        pm: 'PM',
        everyMoment: 'Every moment',
        everyHour: 'Every hour',
        everyMinuteOfPrefix: 'Every minute of',
        atSecond: 'At second',
        atMinute: 'At minute',
        startingFrom: 'starting from',
        invalidDay: 'Invalid day',
        second: 'second',
        seconds: 'seconds',
        minute: 'minute',
        minutes: 'minutes',
        hour: 'hour',
        hours: 'hours',
        dayOfMonth: 'day of month',
        daysOfMonth: 'days of month',
        month: 'month',
        months: 'months',
        dayOfWeek: 'day of week',
        daysOfWeek: 'days of week',
        year: 'year',
        years: 'years',
        listSeparator: ', ',
        listFinalSeparator: ', and ',
    },
};
