import { ExpressionHelper as helper } from './helper';
import { CronValidatorU2Q } from './validator';
import { getLocale } from './locales/index';
/** Resolves the effective IANA timezone from options, falling back to undefined (system time). */
function resolveTimezone(options) {
    if (options === null || options === void 0 ? void 0 : options.timezone)
        return options.timezone;
    if (options === null || options === void 0 ? void 0 : options.locale) {
        const locale = typeof options.locale === 'string' ? getLocale(options.locale) : options.locale;
        return locale.timezone;
    }
    return undefined;
}
const UNIX_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const QUARTZ_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_ALIASES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
/** Returns the next `count` run dates matching `expression` after `fromDate`. */
export function getNextRuns(expression, count, fromDate = new Date(), options) {
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error('count must be a positive integer');
    }
    if (!(fromDate instanceof Date) || Number.isNaN(fromDate.getTime())) {
        throw new Error('fromDate must be a valid Date');
    }
    const parsed = parseExpression(expression);
    const timezone = resolveTimezone(options);
    const precision = parsed.kind === 'unix' || parsed.parts[0] === '0' ? 'minute' : 'second';
    const searchLimit = precision === 'minute' ? 2635200 : 31536000;
    const cursor = new Date(fromDate.getTime());
    if (precision === 'minute') {
        cursor.setMilliseconds(0);
        cursor.setSeconds(0, 0);
        cursor.setMinutes(cursor.getMinutes() + 1);
    }
    else {
        cursor.setMilliseconds(0);
        cursor.setSeconds(cursor.getSeconds() + 1);
    }
    const results = [];
    let iterations = 0;
    while (results.length < count && iterations < searchLimit) {
        const parts = getDateParts(cursor, timezone);
        if (matchesExpression(parsed, parts)) {
            results.push(new Date(cursor.getTime()));
        }
        advanceCursor(cursor, precision);
        iterations += 1;
    }
    if (results.length < count) {
        throw new Error(`Unable to find ${count} matching run(s) within the search window`);
    }
    return results;
}
/** Returns the previous `count` run dates matching `expression` before `fromDate`. */
export function getPreviousRuns(expression, count, fromDate = new Date(), options) {
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error('count must be a positive integer');
    }
    if (!(fromDate instanceof Date) || Number.isNaN(fromDate.getTime())) {
        throw new Error('fromDate must be a valid Date');
    }
    const parsed = parseExpression(expression);
    const timezone = resolveTimezone(options);
    const precision = parsed.kind === 'unix' || parsed.parts[0] === '0' ? 'minute' : 'second';
    const searchLimit = precision === 'minute' ? 2635200 : 31536000;
    const cursor = new Date(fromDate.getTime());
    if (precision === 'minute') {
        cursor.setMilliseconds(0);
        cursor.setSeconds(0, 0);
        cursor.setMinutes(cursor.getMinutes() - 1);
    }
    else {
        cursor.setMilliseconds(0);
        cursor.setSeconds(cursor.getSeconds() - 1);
    }
    const results = [];
    let iterations = 0;
    while (results.length < count && iterations < searchLimit) {
        const parts = getDateParts(cursor, timezone);
        if (matchesExpression(parsed, parts)) {
            results.push(new Date(cursor.getTime()));
        }
        retreatCursor(cursor, precision);
        iterations += 1;
    }
    if (results.length < count) {
        throw new Error(`Unable to find ${count} matching run(s) within the search window`);
    }
    return results;
}
function parseExpression(expression) {
    const expanded = helper.expandMacro(expression);
    const parts = expanded.trim().split(/\s+/);
    if (parts.length === 5) {
        CronValidatorU2Q.validateUnix(expanded);
        return { kind: 'unix', parts };
    }
    if (parts.length !== 6 && parts.length !== 7) {
        throw new Error(`Invalid cron expression!`);
    }
    CronValidatorU2Q.validateQuartz(expanded);
    return { kind: 'quartz', parts };
}
function matchesExpression(parsed, dateParts) {
    if (parsed.kind === 'unix') {
        return matchesUnixExpression(parsed.parts, dateParts);
    }
    return matchesQuartzExpression(parsed.parts, dateParts);
}
function matchesUnixExpression(parts, dp) {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    return (fieldMatchesNumeric(minute, dp.minute, { min: 0, max: 59 }) &&
        fieldMatchesNumeric(hour, dp.hour, { min: 0, max: 23 }) &&
        fieldMatchesNumeric(month, dp.month, { min: 1, max: 12, aliases: MONTH_ALIASES }) &&
        matchesUnixDayOfMonthAndWeek(dayOfMonth, dayOfWeek, dp));
}
function matchesUnixDayOfMonthAndWeek(dayOfMonth, dayOfWeek, dp) {
    const domMatches = fieldMatchesNumeric(dayOfMonth, dp.day, { min: 1, max: 31 });
    const dowMatches = fieldMatchesNumeric(dayOfWeek, dp.dayOfWeek, {
        min: 0,
        max: 7,
        aliases: UNIX_DOW_ALIASES,
        normalize: (value) => (value === 7 ? 0 : value),
    });
    if (dayOfMonth === '*' && dayOfWeek === '*')
        return true;
    if (dayOfMonth === '*')
        return dowMatches;
    if (dayOfWeek === '*')
        return domMatches;
    return domMatches || dowMatches;
}
function matchesQuartzExpression(parts, dp) {
    const [second, minute, hour, dayOfMonth, month, dayOfWeek, year] = parts;
    return (fieldMatchesNumeric(second, dp.second, { min: 0, max: 59 }) &&
        fieldMatchesNumeric(minute, dp.minute, { min: 0, max: 59 }) &&
        fieldMatchesNumeric(hour, dp.hour, { min: 0, max: 23 }) &&
        fieldMatchesNumeric(month, dp.month, { min: 1, max: 12, aliases: MONTH_ALIASES }) &&
        matchesQuartzDayOfMonth(dayOfMonth, dp) &&
        matchesQuartzDayOfWeek(dayOfWeek, dp) &&
        fieldMatchesNumeric(year !== null && year !== void 0 ? year : '*', dp.year, { min: 1970, max: 2099 }));
}
function matchesQuartzDayOfMonth(field, dp) {
    if (field === '*' || field === '?')
        return true;
    const lastDay = daysInMonth(dp.year, dp.month - 1);
    return field.split(',').some((part) => {
        const trimmed = part.trim();
        if (trimmed === 'L')
            return dp.day === lastDay;
        if (trimmed === 'LW')
            return dp.day === nearestWeekday(dp.year, dp.month - 1, lastDay);
        if (trimmed.startsWith('L-')) {
            const offset = Number(trimmed.slice(2));
            return !Number.isNaN(offset) && dp.day === lastDay - offset;
        }
        if (trimmed.endsWith('W')) {
            const targetDay = Number(trimmed.slice(0, -1));
            if (Number.isNaN(targetDay) || targetDay < 1 || targetDay > lastDay)
                return false;
            return dp.day === nearestWeekday(dp.year, dp.month - 1, targetDay);
        }
        return fieldMatchesNumeric(trimmed, dp.day, { min: 1, max: 31 });
    });
}
function matchesQuartzDayOfWeek(field, dp) {
    if (field === '*' || field === '?')
        return true;
    const quartzDow = dp.dayOfWeek + 1;
    return field.split(',').some((part) => {
        const trimmed = part.trim();
        if (trimmed.endsWith('L')) {
            const targetDow = parseQuartzDowValue(trimmed.slice(0, -1));
            if (targetDow === null)
                return false;
            return quartzDow === targetDow && isLastOccurrenceOfWeekdayInMonth(dp.year, dp.month - 1, dp.day, targetDow);
        }
        if (trimmed.includes('#')) {
            const [dowText, nthText] = trimmed.split('#');
            const targetDow = parseQuartzDowValue(dowText);
            const nth = Number(nthText);
            if (targetDow === null || Number.isNaN(nth) || nth < 1 || nth > 5)
                return false;
            return quartzDow === targetDow && isNthOccurrenceOfWeekdayInMonth(dp.day, quartzDow, nth);
        }
        return fieldMatchesNumeric(trimmed, quartzDow, { min: 1, max: 7, aliases: QUARTZ_DOW_ALIASES });
    });
}
function fieldMatchesNumeric(field, currentValue, config) {
    if (field === '*' || field === '?') {
        return true;
    }
    return field.split(',').some((part) => numericPartMatches(part.trim(), currentValue, config));
}
function numericPartMatches(part, currentValue, config) {
    if (part === '*' || part === '?') {
        return true;
    }
    const allowedValues = new Set();
    for (let rawValue = config.min; rawValue <= config.max; rawValue += 1) {
        if (rawNumericPartMatches(part, rawValue, config)) {
            allowedValues.add(config.normalize ? config.normalize(rawValue) : rawValue);
        }
    }
    return allowedValues.has(currentValue);
}
function rawNumericPartMatches(part, rawValue, config) {
    if (part === '*' || part === '?') {
        return true;
    }
    if (part.includes('/')) {
        const [startText, stepText] = part.split('/');
        const step = Number(stepText);
        if (!Number.isInteger(step) || step <= 0) {
            return false;
        }
        if (startText.includes('-')) {
            const [rangeStartText, rangeEndText] = startText.split('-');
            const rangeStart = parseFieldTokenRaw(rangeStartText, config);
            const rangeEnd = parseFieldTokenRaw(rangeEndText, config);
            if (rangeStart === null || rangeEnd === null) {
                return false;
            }
            return rawValue >= rangeStart && rawValue <= rangeEnd && (rawValue - rangeStart) % step === 0;
        }
        const start = startText === '*' ? config.min : parseFieldTokenRaw(startText, config);
        if (start === null) {
            return false;
        }
        if (rawValue < start) {
            return false;
        }
        return (rawValue - start) % step === 0;
    }
    if (part.includes('-')) {
        const [startText, endText] = part.split('-');
        const start = parseFieldTokenRaw(startText, config);
        const end = parseFieldTokenRaw(endText, config);
        if (start === null || end === null) {
            return false;
        }
        return rawValue >= start && rawValue <= end;
    }
    const value = parseFieldTokenRaw(part, config);
    if (value === null) {
        return false;
    }
    return rawValue === value;
}
function parseFieldTokenRaw(token, config) {
    if (token === '*') {
        return config.min;
    }
    const aliasValue = parseAlias(token, config.aliases);
    if (aliasValue !== null) {
        return aliasValue;
    }
    const value = Number(token);
    if (!Number.isInteger(value)) {
        return null;
    }
    if (value < config.min || value > config.max) {
        return null;
    }
    return value;
}
function parseAlias(token, aliases) {
    if (!aliases) {
        return null;
    }
    const index = aliases.indexOf(token.toUpperCase());
    if (index === -1) {
        return null;
    }
    return index + 1;
}
function parseQuartzDowValue(token) {
    const aliasValue = parseAlias(token, QUARTZ_DOW_ALIASES);
    if (aliasValue !== null) {
        return aliasValue;
    }
    const value = Number(token);
    if (!Number.isInteger(value) || value < 1 || value > 7) {
        return null;
    }
    return value;
}
function advanceCursor(cursor, precision) {
    if (precision === 'minute') {
        cursor.setMinutes(cursor.getMinutes() + 1);
        cursor.setSeconds(0, 0);
        return;
    }
    cursor.setSeconds(cursor.getSeconds() + 1);
    cursor.setMilliseconds(0);
}
function retreatCursor(cursor, precision) {
    if (precision === 'minute') {
        cursor.setMinutes(cursor.getMinutes() - 1);
        cursor.setSeconds(0, 0);
        return;
    }
    cursor.setSeconds(cursor.getSeconds() - 1);
    cursor.setMilliseconds(0);
}
/**
 * Returns date parts either in the local timezone (when no timezone is given)
 * or in the specified IANA timezone using the native Intl API (zero dependencies).
 */
function getDateParts(date, timezone) {
    if (!timezone) {
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
            dayOfWeek: date.getDay(),
        };
    }
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const parts = {};
        for (const { type, value } of formatter.formatToParts(date)) {
            parts[type] = value;
        }
        const year = parseInt(parts.year, 10);
        const month = parseInt(parts.month, 10);
        const day = parseInt(parts.day, 10);
        const hour = parseInt(parts.hour, 10) % 24; // normalise "24:xx" midnight edge case
        const minute = parseInt(parts.minute, 10);
        const second = parseInt(parts.second, 10);
        // Derive day-of-week from the date components to avoid locale-specific weekday strings.
        const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
        return { year, month, day, hour, minute, second, dayOfWeek };
    }
    catch (_a) {
        throw new Error(`Invalid timezone: "${timezone}"`);
    }
}
function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
}
function nearestWeekday(year, monthIndex, dayOfMonth) {
    const lastDay = daysInMonth(year, monthIndex);
    const candidateDay = Math.min(dayOfMonth, lastDay);
    const candidate = new Date(year, monthIndex, candidateDay);
    const dayOfWeek = candidate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        return candidateDay;
    }
    if (dayOfWeek === 6) {
        if (candidateDay === 1) {
            return Math.min(3, lastDay);
        }
        return candidateDay - 1;
    }
    if (candidateDay === lastDay) {
        return Math.max(1, candidateDay - 2);
    }
    return Math.min(lastDay, candidateDay + 1);
}
function isLastOccurrenceOfWeekdayInMonth(year, monthIndex, dayOfMonth, targetDow) {
    const candidate = new Date(year, monthIndex, dayOfMonth);
    if (candidate.getDay() + 1 !== targetDow) {
        return false;
    }
    return dayOfMonth + 7 > daysInMonth(year, monthIndex);
}
function isNthOccurrenceOfWeekdayInMonth(dayOfMonth, currentDow, nth) {
    if (nth < 1 || nth > 5) {
        return false;
    }
    const occurrence = Math.floor((dayOfMonth - 1) / 7) + 1;
    return occurrence === nth && currentDow >= 1 && currentDow <= 7;
}
