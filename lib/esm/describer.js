import { ExpressionHelper as helper } from "./helper";
import { CronValidatorU2Q } from "./validator";
import { CronConverterU2Q } from "./converter";
import { en, getLocale } from "./locales/index";
const DOW_SHORT_ALIASES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_SHORT_ALIASES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
export class CronDescriberU2Q {
    static resolveLocale(options) {
        if (!options.locale)
            return en;
        if (typeof options.locale === "string")
            return getLocale(options.locale);
        return options.locale;
    }
    static describeUnix(unixExpression, options = {}) {
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
        }
        catch (_a) {
            return "Invalid Unix cron expression";
        }
    }
    static describeQuartz(quartzExpression, options = {}) {
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
        }
        catch (_a) {
            return "Invalid Quartz cron expression";
        }
    }
    static isSimpleNumeric(s) {
        return /^\d+$/.test(s);
    }
    static describeTime(hour, minute, options, locale) {
        // explicitUse24 is only true when the *caller* explicitly set the flag.
        // The locale's own default does not suppress midnight/noon tokens.
        const explicitUse24 = options.use24HourTimeFormat;
        const use24 = explicitUse24 !== null && explicitUse24 !== void 0 ? explicitUse24 : locale.use24HourTimeFormat;
        if (hour === "*" || hour === "?") {
            if (minute === "0")
                return locale.tokens.everyHour;
            return this.describeMinute(minute, locale, true);
        }
        if (this.isSimpleNumeric(hour) &&
            (minute === "0" || minute === "*" || this.isSimpleNumeric(minute))) {
            const h = parseInt(hour, 10);
            const m = minute === "*" ? null : parseInt(minute, 10);
            if (m === null) {
                if (use24)
                    return `${locale.tokens.everyMinuteOfPrefix} ${h.toString().padStart(2, "0")}`;
                const period = h < 12 ? locale.tokens.am : locale.tokens.pm;
                const h12 = h % 12 || 12;
                return `${locale.tokens.everyMinuteOfPrefix} ${h12} ${period}`;
            }
            // midnight / noon tokens are honoured unless the caller explicitly forces 24h.
            if (explicitUse24 !== true) {
                if (h === 0 && m === 0)
                    return locale.tokens.midnight;
                if (h === 12 && m === 0)
                    return locale.tokens.noon;
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
    static describeSecond(second, locale, suppressZero = false) {
        if (second === "*" || (suppressZero && second === "0"))
            return "";
        const desc = this.describeField(second, { unitSingular: locale.tokens.second, unitPlural: locale.tokens.seconds }, locale);
        if (this.isStepOrRange(desc, locale))
            return this.capitalize(desc);
        return `${locale.tokens.atSecond} ${desc}`;
    }
    static describeMinute(min, locale, suppressZero = false) {
        if (min === "*" || (suppressZero && min === "0"))
            return "";
        const desc = this.describeField(min, { unitSingular: locale.tokens.minute, unitPlural: locale.tokens.minutes }, locale);
        if (this.isStepOrRange(desc, locale))
            return this.capitalize(desc);
        return `${locale.tokens.atMinute} ${desc}`;
    }
    static describeHour(hour, locale) {
        if (hour === "*")
            return "";
        const desc = this.describeField(hour, { unitSingular: locale.tokens.hour, unitPlural: locale.tokens.hours }, locale);
        if (this.isStepOrRange(desc, locale))
            return this.capitalize(desc);
        return `${locale.tokens.at} ${desc}`;
    }
    static describeDayOfMonth(dom, locale) {
        const desc = this.describeField(dom, { unitSingular: locale.tokens.dayOfMonth, unitPlural: locale.tokens.daysOfMonth, isDom: true }, locale);
        if (!desc)
            return "";
        if (this.isStepOrRange(desc, locale))
            return desc;
        return `${locale.tokens.onThe} ${desc} ${locale.tokens.ofTheMonth}`;
    }
    static describeMonth(month, locale) {
        const desc = this.describeField(month, { unitSingular: locale.tokens.month, unitPlural: locale.tokens.months, isMonth: true }, locale);
        if (!desc)
            return "";
        if (this.isStepOrRange(desc, locale))
            return desc;
        return `${locale.tokens.in} ${desc}`;
    }
    static describeDayOfWeek(dow, locale) {
        const desc = this.describeField(dow, { unitSingular: locale.tokens.dayOfWeek, unitPlural: locale.tokens.daysOfWeek, isDow: true }, locale);
        if (!desc)
            return "";
        if (this.isStepOrRange(desc, locale))
            return desc;
        return `${locale.tokens.on} ${desc}`;
    }
    static describeYear(year, locale) {
        if (!year || year === "*")
            return "";
        const desc = this.describeField(year, { unitSingular: locale.tokens.year, unitPlural: locale.tokens.years }, locale);
        if (!desc)
            return "";
        if (this.isStepOrRange(desc, locale))
            return desc;
        return `${locale.tokens.in} ${desc}`;
    }
    static describeField(value, config, locale) {
        if (value === "*" || value === "?")
            return "";
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
        if (descriptions.length === 1)
            return descriptions[0];
        if (descriptions.length === 2) {
            return `${descriptions[0]} ${locale.tokens.and} ${descriptions[1]}`;
        }
        return (descriptions.slice(0, -1).join(locale.tokens.listSeparator) +
            locale.tokens.listFinalSeparator +
            descriptions[descriptions.length - 1]);
    }
    static resolveValue(val, config, locale) {
        var _a, _b;
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
            if (index === 7)
                index = 0;
            return (_a = locale.dayNames[index]) !== null && _a !== void 0 ? _a : val;
        }
        if (config.isDom) {
            if (val === "L")
                return locale.tokens.lastDay;
            if (val === "LW")
                return locale.tokens.lastWeekday;
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
            return (_b = locale.monthNames[index]) !== null && _b !== void 0 ? _b : val;
        }
        return val;
    }
    static combineDescriptions(descriptions, locale) {
        const filtered = descriptions.filter(Boolean);
        return filtered.length > 0 ? filtered.join(" ").trim() : locale.tokens.everyMoment;
    }
    static isStepOrRange(desc, locale) {
        const lower = desc.toLowerCase();
        return (lower.startsWith(locale.tokens.every.toLowerCase()) ||
            lower.startsWith(locale.tokens.from.toLowerCase()));
    }
    static capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
