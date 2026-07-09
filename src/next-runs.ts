import { ExpressionHelper as helper } from './helper';
import { CronValidatorU2Q } from './validator';
import { getLocale } from './locales/index';
import type { CronLocale } from './locales/types';

type CronKind = 'unix' | 'quartz';

interface ParsedCronExpression {
  kind: CronKind;
  parts: string[];
}

interface NumericFieldConfig {
  min: number;
  max: number;
  aliases?: string[] | null;
  normalize?: (value: number) => number;
}

interface DateParts {
  year: number;
  month: number;     // 1-12
  day: number;       // 1-31
  hour: number;      // 0-23
  minute: number;    // 0-59
  second: number;    // 0-59
  dayOfWeek: number; // 0-6 (0=Sunday)
}

export interface NextRunOptions {
  /**
   * A registered locale ID (e.g. "de") or a CronLocale object.
   * When set, its timezone field is used unless timezone is also specified.
   */
  locale?: string | CronLocale;
  /**
   * IANA timezone name (e.g. "America/New_York").
   * Overrides the locale's timezone when both are provided.
   */
  timezone?: string;
}

/** Resolves the effective IANA timezone from options, falling back to undefined (system time). */
function resolveTimezone(options?: NextRunOptions): string | undefined {
  if (options?.timezone) return options.timezone;
  if (options?.locale) {
    const locale = typeof options.locale === 'string' ? getLocale(options.locale) : options.locale;
    return locale.timezone;
  }
  return undefined;
}

const UNIX_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const QUARTZ_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_ALIASES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/** Returns the next `count` run dates matching `expression` after `fromDate`. */
export function getNextRuns(
  expression: string,
  count: number,
  fromDate = new Date(),
  options?: NextRunOptions
): Date[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('count must be a positive integer');
  }
  if (!(fromDate instanceof Date) || Number.isNaN(fromDate.getTime())) {
    throw new Error('fromDate must be a valid Date');
  }

  const parsed = parseExpression(expression);
  const timezone = resolveTimezone(options);
  const precision = parsed.kind === 'unix' || parsed.parts[0] === '0' ? 'minute' : 'second';
  const searchLimit = precision === 'minute' ? 2_635_200 : 31_536_000;

  const cursor = new Date(fromDate.getTime());
  if (precision === 'minute') {
    cursor.setMilliseconds(0);
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
  } else {
    cursor.setMilliseconds(0);
    cursor.setSeconds(cursor.getSeconds() + 1);
  }

  const results: Date[] = [];
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
export function getPreviousRuns(
  expression: string,
  count: number,
  fromDate = new Date(),
  options?: NextRunOptions
): Date[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('count must be a positive integer');
  }
  if (!(fromDate instanceof Date) || Number.isNaN(fromDate.getTime())) {
    throw new Error('fromDate must be a valid Date');
  }

  const parsed = parseExpression(expression);
  const timezone = resolveTimezone(options);
  const precision = parsed.kind === 'unix' || parsed.parts[0] === '0' ? 'minute' : 'second';
  const searchLimit = precision === 'minute' ? 2_635_200 : 31_536_000;

  const cursor = new Date(fromDate.getTime());
  if (precision === 'minute') {
    cursor.setMilliseconds(0);
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() - 1);
  } else {
    cursor.setMilliseconds(0);
    cursor.setSeconds(cursor.getSeconds() - 1);
  }

  const results: Date[] = [];
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

function parseExpression(expression: string): ParsedCronExpression {
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

function matchesExpression(parsed: ParsedCronExpression, dateParts: DateParts): boolean {
  if (parsed.kind === 'unix') {
    return matchesUnixExpression(parsed.parts, dateParts);
  }
  return matchesQuartzExpression(parsed.parts, dateParts);
}

function matchesUnixExpression(parts: string[], dp: DateParts): boolean {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return (
    fieldMatchesNumeric(minute, dp.minute, { min: 0, max: 59 }) &&
    fieldMatchesNumeric(hour, dp.hour, { min: 0, max: 23 }) &&
    fieldMatchesNumeric(month, dp.month, { min: 1, max: 12, aliases: MONTH_ALIASES }) &&
    matchesUnixDayOfMonthAndWeek(dayOfMonth, dayOfWeek, dp)
  );
}

function matchesUnixDayOfMonthAndWeek(dayOfMonth: string, dayOfWeek: string, dp: DateParts): boolean {
  const domMatches = fieldMatchesNumeric(dayOfMonth, dp.day, { min: 1, max: 31 });
  const dowMatches = fieldMatchesNumeric(dayOfWeek, dp.dayOfWeek, {
    min: 0,
    max: 7,
    aliases: UNIX_DOW_ALIASES,
    normalize: (value) => (value === 7 ? 0 : value),
  });

  if (dayOfMonth === '*' && dayOfWeek === '*') return true;
  if (dayOfMonth === '*') return dowMatches;
  if (dayOfWeek === '*') return domMatches;
  return domMatches || dowMatches;
}

function matchesQuartzExpression(parts: string[], dp: DateParts): boolean {
  const [second, minute, hour, dayOfMonth, month, dayOfWeek, year] = parts;

  return (
    fieldMatchesNumeric(second, dp.second, { min: 0, max: 59 }) &&
    fieldMatchesNumeric(minute, dp.minute, { min: 0, max: 59 }) &&
    fieldMatchesNumeric(hour, dp.hour, { min: 0, max: 23 }) &&
    fieldMatchesNumeric(month, dp.month, { min: 1, max: 12, aliases: MONTH_ALIASES }) &&
    matchesQuartzDayOfMonth(dayOfMonth, dp) &&
    matchesQuartzDayOfWeek(dayOfWeek, dp) &&
    fieldMatchesNumeric(year ?? '*', dp.year, { min: 1970, max: 2099 })
  );
}

function matchesQuartzDayOfMonth(field: string, dp: DateParts): boolean {
  if (field === '*' || field === '?') return true;

  const lastDay = daysInMonth(dp.year, dp.month - 1);

  return field.split(',').some((part) => {
    const trimmed = part.trim();
    if (trimmed === 'L') return dp.day === lastDay;
    if (trimmed === 'LW') return dp.day === nearestWeekday(dp.year, dp.month - 1, lastDay);
    if (trimmed.startsWith('L-')) {
      const offset = Number(trimmed.slice(2));
      return !Number.isNaN(offset) && dp.day === lastDay - offset;
    }
    if (trimmed.endsWith('W')) {
      const targetDay = Number(trimmed.slice(0, -1));
      if (Number.isNaN(targetDay) || targetDay < 1 || targetDay > lastDay) return false;
      return dp.day === nearestWeekday(dp.year, dp.month - 1, targetDay);
    }
    return fieldMatchesNumeric(trimmed, dp.day, { min: 1, max: 31 });
  });
}

function matchesQuartzDayOfWeek(field: string, dp: DateParts): boolean {
  if (field === '*' || field === '?') return true;

  const quartzDow = dp.dayOfWeek + 1;

  return field.split(',').some((part) => {
    const trimmed = part.trim();
    if (trimmed.endsWith('L')) {
      const targetDow = parseQuartzDowValue(trimmed.slice(0, -1));
      if (targetDow === null) return false;
      return quartzDow === targetDow && isLastOccurrenceOfWeekdayInMonth(dp.year, dp.month - 1, dp.day, targetDow);
    }
    if (trimmed.includes('#')) {
      const [dowText, nthText] = trimmed.split('#');
      const targetDow = parseQuartzDowValue(dowText);
      const nth = Number(nthText);
      if (targetDow === null || Number.isNaN(nth) || nth < 1 || nth > 5) return false;
      return quartzDow === targetDow && isNthOccurrenceOfWeekdayInMonth(dp.day, quartzDow, nth);
    }
    return fieldMatchesNumeric(trimmed, quartzDow, { min: 1, max: 7, aliases: QUARTZ_DOW_ALIASES });
  });
}

function fieldMatchesNumeric(field: string, currentValue: number, config: NumericFieldConfig): boolean {
  if (field === '*' || field === '?') {
    return true;
  }

  return field.split(',').some((part) => numericPartMatches(part.trim(), currentValue, config));
}

function numericPartMatches(part: string, currentValue: number, config: NumericFieldConfig): boolean {
  if (part === '*' || part === '?') {
    return true;
  }

  const allowedValues = new Set<number>();

  for (let rawValue = config.min; rawValue <= config.max; rawValue += 1) {
    if (rawNumericPartMatches(part, rawValue, config)) {
      allowedValues.add(config.normalize ? config.normalize(rawValue) : rawValue);
    }
  }

  return allowedValues.has(currentValue);
}

function rawNumericPartMatches(part: string, rawValue: number, config: NumericFieldConfig): boolean {
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

function parseFieldTokenRaw(token: string, config: NumericFieldConfig): number | null {
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

function parseAlias(token: string, aliases: string[] | null | undefined): number | null {
  if (!aliases) {
    return null;
  }

  const index = aliases.indexOf(token.toUpperCase());
  if (index === -1) {
    return null;
  }

  return index + 1;
}

function parseQuartzDowValue(token: string): number | null {
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

function advanceCursor(cursor: Date, precision: 'minute' | 'second'): void {
  if (precision === 'minute') {
    cursor.setMinutes(cursor.getMinutes() + 1);
    cursor.setSeconds(0, 0);
    return;
  }
  cursor.setSeconds(cursor.getSeconds() + 1);
  cursor.setMilliseconds(0);
}

function retreatCursor(cursor: Date, precision: 'minute' | 'second'): void {
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
function getDateParts(date: Date, timezone?: string): DateParts {
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

    const parts: Record<string, string> = {};
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
  } catch {
    throw new Error(`Invalid timezone: "${timezone}"`);
  }
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function nearestWeekday(year: number, monthIndex: number, dayOfMonth: number): number {
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

function isLastOccurrenceOfWeekdayInMonth(year: number, monthIndex: number, dayOfMonth: number, targetDow: number): boolean {
  const candidate = new Date(year, monthIndex, dayOfMonth);
  if (candidate.getDay() + 1 !== targetDow) {
    return false;
  }

  return dayOfMonth + 7 > daysInMonth(year, monthIndex);
}

function isNthOccurrenceOfWeekdayInMonth(dayOfMonth: number, currentDow: number, nth: number): boolean {
  if (nth < 1 || nth > 5) {
    return false;
  }

  const occurrence = Math.floor((dayOfMonth - 1) / 7) + 1;
  return occurrence === nth && currentDow >= 1 && currentDow <= 7;
}
