import { ExpressionHelper as helper } from './helper';
import { CronValidatorU2Q } from './validator';

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

const UNIX_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const QUARTZ_DOW_ALIASES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_ALIASES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function getNextRuns(expression: string, count: number, fromDate = new Date()): Date[] {
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error('count must be a positive integer');
  }
  if (!(fromDate instanceof Date) || Number.isNaN(fromDate.getTime())) {
    throw new Error('fromDate must be a valid Date');
  }

  const parsed = parseExpression(expression);
  const results: Date[] = [];
  const cursor = new Date(fromDate.getTime());
  const precision = parsed.kind === 'unix' || parsed.parts[0] === '0' ? 'minute' : 'second';
  const searchLimit = precision === 'minute' ? 2_635_200 : 31_536_000;

  if (precision === 'minute') {
    cursor.setMilliseconds(0);
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
  } else {
    cursor.setMilliseconds(0);
    cursor.setSeconds(cursor.getSeconds() + 1);
  }

  let iterations = 0;
  while (results.length < count && iterations < searchLimit) {
    if (matchesExpression(parsed, cursor)) {
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

function matchesExpression(parsed: ParsedCronExpression, date: Date): boolean {
  if (parsed.kind === 'unix') {
    return matchesUnixExpression(parsed.parts, date);
  }
  return matchesQuartzExpression(parsed.parts, date);
}

function matchesUnixExpression(parts: string[], date: Date): boolean {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return (
    fieldMatchesNumeric(minute, date.getMinutes(), { min: 0, max: 59 }) &&
    fieldMatchesNumeric(hour, date.getHours(), { min: 0, max: 23 }) &&
    fieldMatchesNumeric(month, date.getMonth() + 1, { min: 1, max: 12, aliases: MONTH_ALIASES }) &&
    matchesUnixDayOfMonthAndWeek(dayOfMonth, dayOfWeek, date)
  );
}

function matchesUnixDayOfMonthAndWeek(dayOfMonth: string, dayOfWeek: string, date: Date): boolean {
  const domMatches = fieldMatchesNumeric(dayOfMonth, date.getDate(), { min: 1, max: 31 });
  const dowMatches = fieldMatchesNumeric(dayOfWeek, date.getDay(), {
    min: 0,
    max: 7,
    aliases: UNIX_DOW_ALIASES,
    normalize: (value) => (value === 7 ? 0 : value),
  });

  if (dayOfMonth === '*' && dayOfWeek === '*') {
    return true;
  }
  if (dayOfMonth === '*') {
    return dowMatches;
  }
  if (dayOfWeek === '*') {
    return domMatches;
  }

  return domMatches || dowMatches;
}

function matchesQuartzExpression(parts: string[], date: Date): boolean {
  const [second, minute, hour, dayOfMonth, month, dayOfWeek, year] = parts;

  return (
    fieldMatchesNumeric(second, date.getSeconds(), { min: 0, max: 59 }) &&
    fieldMatchesNumeric(minute, date.getMinutes(), { min: 0, max: 59 }) &&
    fieldMatchesNumeric(hour, date.getHours(), { min: 0, max: 23 }) &&
    fieldMatchesNumeric(month, date.getMonth() + 1, { min: 1, max: 12, aliases: MONTH_ALIASES }) &&
    matchesQuartzDayOfMonth(dayOfMonth, date) &&
    matchesQuartzDayOfWeek(dayOfWeek, date) &&
    fieldMatchesNumeric(year ?? '*', date.getFullYear(), { min: 1970, max: 2099 })
  );
}

function matchesQuartzDayOfMonth(field: string, date: Date): boolean {
  if (field === '*' || field === '?') {
    return true;
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const lastDay = daysInMonth(year, month);

  return field.split(',').some((part) => {
    const trimmed = part.trim();

    if (trimmed === 'L') {
      return day === lastDay;
    }

    if (trimmed === 'LW') {
      return day === nearestWeekday(year, month, lastDay);
    }

    if (trimmed.startsWith('L-')) {
      const offset = Number(trimmed.slice(2));
      if (Number.isNaN(offset) || offset < 1 || offset > 31) {
        return false;
      }
      return day === lastDay - offset;
    }

    if (trimmed.endsWith('W')) {
      const targetDay = Number(trimmed.slice(0, -1));
      if (Number.isNaN(targetDay) || targetDay < 1 || targetDay > lastDay) {
        return false;
      }
      return day === nearestWeekday(year, month, targetDay);
    }

    return fieldMatchesNumeric(trimmed, day, { min: 1, max: 31 });
  });
}

function matchesQuartzDayOfWeek(field: string, date: Date): boolean {
  if (field === '*' || field === '?') {
    return true;
  }

  const quartzDow = date.getDay() + 1;
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return field.split(',').some((part) => {
    const trimmed = part.trim();

    if (trimmed.endsWith('L')) {
      const targetDow = parseQuartzDowValue(trimmed.slice(0, -1));
      if (targetDow === null) {
        return false;
      }
      return quartzDow === targetDow && isLastOccurrenceOfWeekdayInMonth(year, month, day, targetDow);
    }

    if (trimmed.includes('#')) {
      const [dowText, nthText] = trimmed.split('#');
      const targetDow = parseQuartzDowValue(dowText);
      const nth = Number(nthText);
      if (targetDow === null || Number.isNaN(nth) || nth < 1 || nth > 5) {
        return false;
      }
      return quartzDow === targetDow && isNthOccurrenceOfWeekdayInMonth(day, quartzDow, nth);
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
