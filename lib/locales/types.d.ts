export interface CronLocale {
    /** BCP-47-style locale identifier, e.g. "en" or "es". */
    readonly id: string;
    /** Day names starting from Sunday (index 0). */
    readonly dayNames: readonly [string, string, string, string, string, string, string];
    /** Month names starting from January (index 0). */
    readonly monthNames: readonly [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
    ];
    /** Converts a positive integer to an ordinal string, e.g. 1 → "1st". */
    ordinal(n: number): string;
    /**
     * Whether this locale defaults to 24-hour time format.
     * Can be overridden per-call via DescriberOptions.use24HourTimeFormat.
     */
    readonly use24HourTimeFormat: boolean;
    /**
     * Default IANA timezone for this locale (e.g. "Europe/Berlin").
     * Used by getNextRuns/getPreviousRuns when locale is passed and timezone is not set directly.
     */
    readonly timezone?: string;
    readonly tokens: {
        /** Prefix for a specific time, e.g. "At" → "At 8:00 AM". */
        readonly at: string;
        /** Step/repetition word, e.g. "every" → "every 5 minutes". */
        readonly every: string;
        /** Range start word, e.g. "from" → "from Monday to Friday". */
        readonly from: string;
        /** Range end word, e.g. "to" → "from Monday to Friday". */
        readonly to: string;
        /** List conjunction for exactly 2 items, e.g. "and". */
        readonly and: string;
        /** Preposition used before months/years, e.g. "in" → "in January". */
        readonly in: string;
        /** Preposition used before day-of-week values, e.g. "on" → "on Sunday". */
        readonly on: string;
        /** Preposition + article used before day-of-month values, e.g. "on the". */
        readonly onThe: string;
        /** Suffix for day-of-month context, e.g. "of the month". */
        readonly ofTheMonth: string;
        /** Modifier for last-occurrence day-of-week, e.g. "last". */
        readonly last: string;
        /** Complete phrase for DOM=L, e.g. "last day". */
        readonly lastDay: string;
        /** Complete phrase for DOM=LW, e.g. "last weekday". */
        readonly lastWeekday: string;
        /** Prefix for DOM nearest-weekday modifier, e.g. "nearest weekday to the". */
        readonly nearestWeekdayTo: string;
        /** Suffix for DOM L-offset modifier, e.g. "days before the last day". */
        readonly daysBeforeLastDay: string;
        /** Complete time phrase for midnight (00:00), e.g. "At midnight". */
        readonly midnight: string;
        /** Complete time phrase for noon (12:00), e.g. "At noon". */
        readonly noon: string;
        /** AM period marker, e.g. "AM". */
        readonly am: string;
        /** PM period marker, e.g. "PM". */
        readonly pm: string;
        /** Phrase returned when all fields are wildcards, e.g. "Every moment". */
        readonly everyMoment: string;
        /** Phrase returned when minute=0 and hour=*, e.g. "Every hour". */
        readonly everyHour: string;
        /** Prefix for wildcard-minute + specific-hour, e.g. "Every minute of". */
        readonly everyMinuteOfPrefix: string;
        /** Prefix for a specific second value, e.g. "At second". */
        readonly atSecond: string;
        /** Prefix for a specific minute value, e.g. "At minute". */
        readonly atMinute: string;
        /** Step offset phrase, e.g. "starting from". */
        readonly startingFrom: string;
        /** Fallback for an invalid day ordinal, e.g. "Invalid day". */
        readonly invalidDay: string;
        readonly second: string;
        readonly seconds: string;
        readonly minute: string;
        readonly minutes: string;
        readonly hour: string;
        readonly hours: string;
        readonly dayOfMonth: string;
        readonly daysOfMonth: string;
        readonly month: string;
        readonly months: string;
        readonly dayOfWeek: string;
        readonly daysOfWeek: string;
        readonly year: string;
        readonly years: string;
        /** Separator between all but the last list item, e.g. ", ". */
        readonly listSeparator: string;
        /** Separator before the last list item for 3+ items, e.g. ", and ". */
        readonly listFinalSeparator: string;
    };
}
