import { ExpressionHelper as helper } from "./helper";
import { CronValidatorU2Q } from "./validator";
import { CronConverterU2Q } from "./converter";
import { en, getLocale } from "./locales/index";
import type { CronLocale } from "./locales/types";

export type { CronLocale };

export interface DescriberOptions {
  /** Use 24-hour clock format (e.g. "At 14:30"). Overrides the locale's default. */
  use24HourTimeFormat?: boolean;
  /**
   * Locale to use for descriptions. Accepts a locale ID string (e.g. "en", "es")
   * or a custom CronLocale object. Defaults to English ("en").
   */
  locale?: string | CronLocale;
}

interface FieldConfig {
  unitSingular: string;
  unitPlural: string;
  isDom?: boolean;
  isDow?: boolean;
  isMonth?: boolean;
}

const DOW_SHORT_ALIASES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_SHORT_ALIASES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export class CronDescriberU2Q {
  private static resolveLocale(options: DescriberOptions): CronLocale {
    if (!options.locale) return en;
    if (typeof options.locale === "string") return getLocale(options.locale);
    return options.locale;
  }

  public static describeUnix(unixExpression: string, options: DescriberOptions = {}): string {
    try {
      unixExpression = helper.expandMacro(unixExpression);
      CronValidatorU2Q.validateUnix(unixExpression);
      const parts = helper.GetExpressionParts(unixExpression);
      const [min, hour, dom, month, dow] = parts;
      const locale = this.resolveLocale(options);

      const descriptions = [
        this.describeTime(hour, min, options, locale),
        this.describeDayOfMonth(dom, locale),
        this.describeMonth(month, locale),
        this.describeDayOfWeek(dow, locale),
      ];

      return this.combineDescriptions(descriptions, locale);
    } catch {
      return "Invalid Unix cron expression";
    }
  }

  public static describeQuartz(quartzExpression: string, options: DescriberOptions = {}): string {
    try {
      CronValidatorU2Q.validateQuartz(quartzExpression);
      const parts = helper.GetExpressionParts(quartzExpression);
      const [second, min, hour, dom, month, dow, year] = parts;
      const locale = this.resolveLocale(options);
      const normalizedDow = CronConverterU2Q.quartzDowToUnix(dow);

      const descriptions = [
        this.describeSecond(second, locale, true),
        this.describeTime(hour, min, options, locale),
        this.describeDayOfMonth(dom, locale),
        this.describeMonth(month, locale),
        this.describeDayOfWeek(normalizedDow, locale),
        this.describeYear(year, locale),
      ];

      return this.combineDescriptions(descriptions, locale);
    } catch {
      return "Invalid Quartz cron expression";
    }
  }

  private static isSimpleNumeric(s: string): boolean {
    return /^\d+$/.test(s);
  }

  private static describeTime(
    hour: string,
    minute: string,
    options: DescriberOptions,
    locale: CronLocale
  ): string {
    // explicitUse24 is only true when the *caller* explicitly set the flag.
    // The locale's own default does not suppress midnight/noon tokens.
    const explicitUse24 = options.use24HourTimeFormat;
    const use24 = explicitUse24 ?? locale.use24HourTimeFormat;

    if (hour === "*" || hour === "?") {
      if (minute === "0") return locale.tokens.everyHour;
      return this.describeMinute(minute, locale, true);
    }

    if (
      this.isSimpleNumeric(hour) &&
      (minute === "0" || minute === "*" || this.isSimpleNumeric(minute))
    ) {
      const h = parseInt(hour, 10);
      const m = minute === "*" ? null : parseInt(minute, 10);

      if (m === null) {
        if (use24) return `${locale.tokens.everyMinuteOfPrefix} ${h.toString().padStart(2, "0")}`;
        const period = h < 12 ? locale.tokens.am : locale.tokens.pm;
        const h12 = h % 12 || 12;
        return `${locale.tokens.everyMinuteOfPrefix} ${h12} ${period}`;
      }

      // midnight / noon tokens are honoured unless the caller explicitly forces 24h.
      if (explicitUse24 !== true) {
        if (h === 0 && m === 0) return locale.tokens.midnight;
        if (h === 12 && m === 0) return locale.tokens.noon;
      }

      if (!use24) {
        const period = h < 12 ? locale.tokens.am : locale.tokens.pm;
        const h12 = h % 12 || 12;
        return `${locale.tokens.at} ${h12}:${m.toString().padStart(2, "0")} ${period}`;
      }

      return `${locale.tokens.at} ${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }

    const minDesc = this.describeMinute(minute, locale, true);
    const hourDesc = this.isSimpleNumeric(hour)
      ? this.describeTime(hour, "0", options, locale)
      : this.describeHour(hour, locale);
    return [minDesc, hourDesc].filter(Boolean).join(" ");
  }

  private static describeSecond(second: string, locale: CronLocale, suppressZero = false): string {
    if (second === "*" || (suppressZero && second === "0")) return "";
    const desc = this.describeField(
      second,
      { unitSingular: locale.tokens.second, unitPlural: locale.tokens.seconds },
      locale
    );
    if (this.isStepOrRange(desc, locale)) return this.capitalize(desc);
    return `${locale.tokens.atSecond} ${desc}`;
  }

  private static describeMinute(min: string, locale: CronLocale, suppressZero = false): string {
    if (min === "*" || (suppressZero && min === "0")) return "";
    const desc = this.describeField(
      min,
      { unitSingular: locale.tokens.minute, unitPlural: locale.tokens.minutes },
      locale
    );
    if (this.isStepOrRange(desc, locale)) return this.capitalize(desc);
    return `${locale.tokens.atMinute} ${desc}`;
  }

  private static describeHour(hour: string, locale: CronLocale): string {
    if (hour === "*") return "";
    const desc = this.describeField(
      hour,
      { unitSingular: locale.tokens.hour, unitPlural: locale.tokens.hours },
      locale
    );
    if (this.isStepOrRange(desc, locale)) return this.capitalize(desc);
    return `${locale.tokens.at} ${desc}`;
  }

  private static describeDayOfMonth(dom: string, locale: CronLocale): string {
    const desc = this.describeField(
      dom,
      { unitSingular: locale.tokens.dayOfMonth, unitPlural: locale.tokens.daysOfMonth, isDom: true },
      locale
    );
    if (!desc) return "";
    if (this.isStepOrRange(desc, locale)) return desc;
    return `${locale.tokens.onThe} ${desc} ${locale.tokens.ofTheMonth}`;
  }

  private static describeMonth(month: string, locale: CronLocale): string {
    const desc = this.describeField(
      month,
      { unitSingular: locale.tokens.month, unitPlural: locale.tokens.months, isMonth: true },
      locale
    );
    if (!desc) return "";
    if (this.isStepOrRange(desc, locale)) return desc;
    return `${locale.tokens.in} ${desc}`;
  }

  private static describeDayOfWeek(dow: string, locale: CronLocale): string {
    const desc = this.describeField(
      dow,
      { unitSingular: locale.tokens.dayOfWeek, unitPlural: locale.tokens.daysOfWeek, isDow: true },
      locale
    );
    if (!desc) return "";
    if (this.isStepOrRange(desc, locale)) return desc;
    return `${locale.tokens.on} ${desc}`;
  }

  private static describeYear(year: string | undefined, locale: CronLocale): string {
    if (!year || year === "*") return "";
    const desc = this.describeField(
      year,
      { unitSingular: locale.tokens.year, unitPlural: locale.tokens.years },
      locale
    );
    if (!desc) return "";
    if (this.isStepOrRange(desc, locale)) return desc;
    return `${locale.tokens.in} ${desc}`;
  }

  private static describeField(value: string, config: FieldConfig, locale: CronLocale): string {
    if (value === "*" || value === "?") return "";

    const parts = value.split(",");
    const descriptions = parts.map((part) => {
      if (part.includes("/")) {
        const [start, step] = part.split("/");
        const stepNum = Number(step);
        const unit = stepNum === 1 ? config.unitSingular : config.unitPlural;
        if (start === "*" || start === "0") {
          return `${locale.tokens.every} ${step} ${unit}`;
        }
        const startDesc = this.resolveValue(start, config, locale);
        return `${locale.tokens.every} ${step} ${unit} ${locale.tokens.startingFrom} ${startDesc}`;
      }
      if (part.includes("-")) {
        const [start, end] = part.split("-");
        return `${locale.tokens.from} ${this.resolveValue(start, config, locale)} ${locale.tokens.to} ${this.resolveValue(end, config, locale)}`;
      }
      return this.resolveValue(part, config, locale);
    });

    if (descriptions.length === 1) return descriptions[0];
    if (descriptions.length === 2) {
      return `${descriptions[0]} ${locale.tokens.and} ${descriptions[1]}`;
    }
    return (
      descriptions.slice(0, -1).join(locale.tokens.listSeparator) +
      locale.tokens.listFinalSeparator +
      descriptions[descriptions.length - 1]
    );
  }

  private static resolveValue(val: string, config: FieldConfig, locale: CronLocale): string {
    if (config.isDow) {
      if (val.endsWith("L")) {
        return `${locale.tokens.last} ${this.resolveValue(val.slice(0, -1), config, locale)}`;
      }
      if (val.includes("#")) {
        const [day, nth] = val.split("#");
        return `${locale.ordinal(Number(nth))} ${this.resolveValue(day, config, locale)}`;
      }
      const aliasIndex = DOW_SHORT_ALIASES.indexOf(val.toUpperCase());
      let index = aliasIndex !== -1 ? aliasIndex : Number(val);
      if (index === 7) index = 0;
      return locale.dayNames[index] ?? val;
    }

    if (config.isDom) {
      if (val === "L") return locale.tokens.lastDay;
      if (val === "LW") return locale.tokens.lastWeekday;
      if (val.endsWith("W")) {
        return `${locale.tokens.nearestWeekdayTo} ${this.resolveValue(val.slice(0, -1), config, locale)}`;
      }
      if (val.startsWith("L-")) {
        return `${val.slice(2)} ${locale.tokens.daysBeforeLastDay}`;
      }
      return locale.ordinal(Number(val));
    }

    if (config.isMonth) {
      const aliasIndex = MONTH_SHORT_ALIASES.indexOf(val.toUpperCase());
      const index = aliasIndex !== -1 ? aliasIndex : Number(val) - 1;
      return locale.monthNames[index] ?? val;
    }

    return val;
  }

  private static combineDescriptions(descriptions: string[], locale: CronLocale): string {
    const filtered = descriptions.filter(Boolean);
    return filtered.length > 0 ? filtered.join(" ").trim() : locale.tokens.everyMoment;
  }

  private static isStepOrRange(desc: string, locale: CronLocale): boolean {
    const lower = desc.toLowerCase();
    return (
      lower.startsWith(locale.tokens.every.toLowerCase()) ||
      lower.startsWith(locale.tokens.from.toLowerCase())
    );
  }

  private static capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
